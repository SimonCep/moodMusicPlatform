from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
import json 
import os
import base64
from datetime import datetime
from .models import MoodModel, Playlist, Track, UserPreference, SpecializedPlaylist
from .serializers import (
    MoodSerializer, PlaylistSerializer, TrackSerializer, UserSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserProfileSerializer, ChangePasswordSerializer, SpecializedPlaylistSerializer,
    AddTrackSerializer, TrackOrderSerializer, TrackDetailsRequestSerializer
)
from openai import OpenAI
from django.contrib.auth.models import User
import traceback
from django.shortcuts import get_object_or_404
from django.db import transaction
import logging
from rest_framework.views import APIView
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import geoip2.database
from geoip2.errors import AddressNotFoundError

logger = logging.getLogger(__name__) # Define logger early

# --- Globals / Constants ---
# It's better to initialize the GeoIP reader once when the app starts,
# but for simplicity in this example, we might open it in the view.
# A more robust solution would use Django settings for the path.
GEOIP_DATABASE_PATH = '/app/geoip_data/GeoLite2-Country.mmdb' # Update this path if needed
geoip_reader = None
try:
    # Attempt to load the GeoIP database when the module is loaded.
    # Ensure the database file is present at GEOIP_DATABASE_PATH inside your container.
    geoip_reader = geoip2.database.Reader(GEOIP_DATABASE_PATH)
except FileNotFoundError:
    logger.warning(f"GeoIP2 database not found at {GEOIP_DATABASE_PATH}. IP-based market detection will be disabled.")
except Exception as e:
    logger.error(f"Error loading GeoIP2 database: {e}", exc_info=True)

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
# logger = logging.getLogger(__name__) # No longer needed here, moved up

MOOD_CATEGORIES_LIST = [
    "Happy", "Sad", "Angry", "Calm", "Excited", "Anxious", 
    "Confident", "Lonely", "Nostalgic", "Romantic", "Other"
]

def get_mood_category_from_openai(mood_text):
    """Calls OpenAI to classify mood_text into one of the predefined categories."""
    if not mood_text:
        return "Other"
        
    categories_str = ", ".join(MOOD_CATEGORIES_LIST)
    prompt = (
        f"Given the user's mood description: '{mood_text}'\n\n"
        f"Classify this mood into ONE of the following categories: {categories_str}.\n\n"
        f"Return ONLY the name of the single most appropriate category. "
        f"If none seem to fit well or the description is unclear/irrelevant, return 'Other'."
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are an assistant that classifies user mood descriptions into one of these categories: {categories_str}. You only output the single category name."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=20
        )
        
        category = response.choices[0].message.content.strip()
        
        if category in MOOD_CATEGORIES_LIST:
            return category
        else:
            logger.warning(f"OpenAI returned unexpected category '{category}' for mood '{mood_text}'. Defaulting to Other.")
            return "Other"
            
    except Exception as e:
        logger.error(f"Error calling OpenAI for mood categorization: {str(e)}", exc_info=True)
        return "Other"

class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_mood_and_playlist(request):
    user = request.user
    mood_text = request.data.get('mood_text', '') 
    detected_emotion_text = request.data.get('detected_emotion_text', '') 
    energy_level = request.data.get('energy_level', 5)
    favorite_genre = request.data.get('favorite_genre', 'Pop')
    song_count = request.data.get('song_count', 7) 
    song_count = max(5, min(int(song_count), 15)) 
    playlist_goal = request.data.get('playlist_goal')

    text_for_mood_tracking = mood_text if mood_text else detected_emotion_text

    mood_category = get_mood_category_from_openai(text_for_mood_tracking)
    logger.info(f"Using text for categorization: '{text_for_mood_tracking}'. Categorized as: {mood_category}")

    market_code_for_spotify = None
    # 1. Try to determine market code from favorite_genre keywords
    if favorite_genre and isinstance(favorite_genre, str):
        genre_lower = favorite_genre.lower()
        if "lithuanian" in genre_lower:
            market_code_for_spotify = "LT"
        elif "polish" in genre_lower:
            market_code_for_spotify = "PL"
        elif "japanese" in genre_lower or "j-pop" in genre_lower or "j-rock" in genre_lower:
            market_code_for_spotify = "JP"
        # Add more genre-to-market mappings as needed

    # 2. If not found from genre, try to determine from user's IP address
    if not market_code_for_spotify and geoip_reader:
        try:
            # Get client IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            if ip_address:
                logger.info(f"Attempting GeoIP lookup for IP: {ip_address}")
                response = geoip_reader.country(ip_address)
                market_code_for_spotify = response.country.iso_code
                logger.info(f"GeoIP lookup successful: IP {ip_address} mapped to market {market_code_for_spotify}")
            else:
                logger.warning("Could not determine client IP address for GeoIP lookup.")
        except AddressNotFoundError:
            logger.warning(f"IP address {ip_address} not found in GeoIP database.")
        except Exception as e:
            logger.error(f"Error during GeoIP lookup for IP {ip_address}: {e}", exc_info=True)
    
    if market_code_for_spotify:
        logger.info(f"Using market code for Spotify: {market_code_for_spotify}")
    else:
        logger.info("No specific market code determined for Spotify. Using Spotify's default.")

    current_month = datetime.now().month
    if 3 <= current_month <= 5:
        season = 'Spring'
    elif 6 <= current_month <= 8:
        season = 'Summer'
    elif 9 <= current_month <= 11:
        season = 'Fall'
    else:
        season = 'Winter'
    
    current_hour = datetime.now().hour
    if 5 <= current_hour < 12:
        time_of_day = 'Morning'
    elif 12 <= current_hour < 17:
        time_of_day = 'Afternoon'
    elif 17 <= current_hour < 21:
        time_of_day = 'Evening'
    else:
        time_of_day = 'Night'

    pref, created = UserPreference.objects.update_or_create(
        user=user,
        defaults={'favorite_genre': favorite_genre}
    )

    mood_instance = MoodModel.objects.create(
        user=user,
        mood_text=text_for_mood_tracking,
        energy_level=energy_level,
        season=season,
        category=mood_category
    )
    
    feeling_description = ""
    if detected_emotion_text:
        feeling_description = f"whose facial expression was analyzed as '{detected_emotion_text}'"
    elif mood_text:
        feeling_description = f"is feeling '{mood_text}'"
    else: 
        feeling_description = "is in an unspecified mood"

    prompt_parts = [
        f"Create a music playlist for someone who {feeling_description} (overall mood categorized as {mood_category}). ",
        f"It's currently {time_of_day} in {season}, their energy level is {energy_level}/10, ",
        f"and they prefer {favorite_genre} music. "
    ]

    # Refine prompt for regional music
    if market_code_for_spotify: # If a specific market is identified
        prompt_parts.append(
            f"The user has indicated a preference for music from the region associated with market code '{market_code_for_spotify}'. "
            f"Please prioritize songs that are verifiably available on major streaming platforms within this market. "
            f"If possible, lean towards more recognizable tracks from this region to increase verification chances. "
        )

    if playlist_goal:
        prompt_parts.append(f"The goal for this playlist is: '{playlist_goal}'. ")

    prompt_parts.extend([
        f"Return ONLY a JSON object (no extra text before or after) with two keys: ",
        f"1. 'playlist_name': A short, creative title for the playlist (max 5 words). ",
        f"2. 'tracks': A JSON array of exactly {song_count} songs. ",
        f"Each song in the array must have 'title', 'artist', and 'duration' fields. ",
        f"For each track, please provide the most common and verifiable spelling for the title and artist. If suggesting regional or less common music, prioritize tracks that are likely to be found on major streaming platforms. ",
        f"Make sure the songs match the mood, category, time of day, energy level, and playlist goal if provided."
    ])
    
    prompt = "".join(prompt_parts)

    try:
        playlist_data = call_openai_api(prompt)

        playlist_name = playlist_data.get('playlist_name', f"Mood Playlist ({text_for_mood_tracking[:20]}...)") 
        tracks_data = playlist_data.get('tracks', []) 

        # Process tracks first to determine fallback status
        processed_tracks_data = []
        verified_on_spotify_count = 0
        llm_fallback_count = 0

        for i, track_data_from_llm in enumerate(tracks_data):
            original_title = track_data_from_llm.get('title', 'Unknown Title')
            original_artist = track_data_from_llm.get('artist', 'Unknown Artist')
            original_duration = track_data_from_llm.get('duration')

            spotify_track_details = _search_spotify_for_track_details(
                title=original_title, 
                artist=original_artist, 
                market_code=market_code_for_spotify
            )

            track_info_to_save = {
                'title': original_title,
                'artist': original_artist,
                'album': None,
                'duration': original_duration,
                'spotify_uri': None,
                'order_in_playlist': i
            }

            if spotify_track_details:
                logger.info(f"Successfully found Spotify details for: {original_title} - {original_artist}")
                track_info_to_save['title'] = spotify_track_details['title']
                track_info_to_save['artist'] = spotify_track_details['artist']
                track_info_to_save['album'] = spotify_track_details['album']
                track_info_to_save['duration'] = spotify_track_details['duration']
                track_info_to_save['spotify_uri'] = spotify_track_details['spotify_uri']
                verified_on_spotify_count += 1
            else:
                logger.warning(f"Could not find Spotify details for: {original_title} - {original_artist}. Using LLM provided data.")
                llm_fallback_count += 1
                # Attempt to parse/normalize LLM duration
                if track_info_to_save['duration'] and isinstance(track_info_to_save['duration'], str) and ':' not in track_info_to_save['duration']:
                    try:
                        total_seconds = int(track_info_to_save['duration'])
                        minutes = total_seconds // 60
                        seconds = total_seconds % 60
                        track_info_to_save['duration'] = f"{minutes}:{seconds:02d}"
                    except ValueError:
                        logger.warning(f"Could not parse LLM duration '{track_info_to_save['duration']}' for '{original_title}'. Leaving as null.")
                        track_info_to_save['duration'] = None
            
            processed_tracks_data.append(track_info_to_save)

        # Now create the Playlist instance with the final counts
        total_tracks_count = len(processed_tracks_data)
        playlist_instance = Playlist.objects.create(
            mood=mood_instance, 
            prompt_used=prompt, 
            name=playlist_name,
            llm_fallback_count=llm_fallback_count,
            total_tracks_generated=total_tracks_count
        )
        
        # Now create the Track instances linked to the playlist
        created_tracks_instances = []
        for track_info in processed_tracks_data:
            track = Track.objects.create(
                playlist=playlist_instance,
                title=track_info['title'],
                artist=track_info['artist'],
                album=track_info['album'],
                duration=track_info['duration'],
                spotify_uri=track_info['spotify_uri'],
                order_in_playlist=track_info['order_in_playlist']
            )
            created_tracks_instances.append(track)

        mood_serializer = MoodSerializer(mood_instance) 
        playlist_serializer = PlaylistSerializer(playlist_instance) 
        
        response_data = {
            'mood': mood_serializer.data,
            'playlist': playlist_serializer.data,
        }

        return Response(response_data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Error generating playlist for user {user.username}: {str(e)}", exc_info=True)
        
        if mood_instance and mood_instance.pk:
            mood_instance.delete() 
        
        return Response({
            'error': f"Failed to generate playlist. Please try again later."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def call_openai_api(prompt):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an assistant that generates playlist names and song lists in JSON format."}, 
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        response_text = response.choices[0].message.content
        
        try:
            playlist_data = json.loads(response_text)
            
            if 'playlist_name' not in playlist_data or 'tracks' not in playlist_data:
                raise ValueError("Missing 'playlist_name' or 'tracks' key in response.")
            if not isinstance(playlist_data['tracks'], list):
                 raise ValueError("'tracks' key is not a list.")

            for i, track in enumerate(playlist_data['tracks']):
                if 'title' not in track or 'artist' not in track or 'duration' not in track:
                    logger.warning(f"Missing fields in track {i}: {track}")
            
            return playlist_data
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse JSON response or validate structure: {response_text} Error: {str(e)}")
            return fallback_playlist_data()
            
    except Exception as e:
        logger.error(f"Error calling OpenAI API in call_openai_api: {str(e)}", exc_info=True)
        return fallback_playlist_data()

def fallback_playlist_data():
    """Provide a fallback playlist structure in case the API call fails"""
    logger.warning("OpenAI call failed, returning fallback playlist data.")
    return {
        "playlist_name": "Default Fallback Playlist",
        "tracks": [
            {"id": 1, "title": "Happy", "artist": "Pharrell Williams", "duration": "3:53"},
            {"id": 2, "title": "Good Feeling", "artist": "Flo Rida", "duration": "4:08"},
            {"id": 3, "title": "Walking on Sunshine", "artist": "Katrina & The Waves", "duration": "3:58"},
            {"id": 4, "title": "Uptown Funk", "artist": "Mark Ronson ft. Bruno Mars", "duration": "4:30"},
            {"id": 5, "title": "Can't Stop the Feeling!", "artist": "Justin Timberlake", "duration": "3:56"}
        ]
    }

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save() 
        return Response({"detail": "Password reset email has been sent if an account with this email exists."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save() 
        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)

class PlaylistHistoryView(generics.ListAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Playlist.objects.filter(mood__user=user).order_by('-created_at')

def call_openai_for_replacement(prompt):
    """Calls OpenAI specifically for replacing one track, expecting a single track JSON object."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an assistant that suggests a single replacement song based on feedback and playlist context. Output ONLY the JSON for the single song with keys 'title', 'artist', 'duration'."}, 
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"} 
        )
        response_text = response.choices[0].message.content
        try:
            track_data = json.loads(response_text)
            if 'title' not in track_data or 'artist' not in track_data or 'duration' not in track_data:
                 raise ValueError("Response JSON missing required track fields.")
            return track_data
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse replacement track JSON: {response_text}. Error: {str(e)}")
            return None 
    except Exception as e:
        logger.error(f"Error calling OpenAI API for replacement: {str(e)}", exc_info=True)
        return None

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def replace_track_view(request, playlist_pk, track_pk):
    try:
        playlist = Playlist.objects.get(pk=playlist_pk, mood__user=request.user)
        track_to_replace = Track.objects.get(pk=track_pk, playlist=playlist)
    except Playlist.DoesNotExist:
        return Response({"detail": "Playlist not found or access denied."}, status=status.HTTP_404_NOT_FOUND)
    except Track.DoesNotExist:
        return Response({"detail": "Track not found in this playlist."}, status=status.HTTP_404_NOT_FOUND)

    rating = request.data.get('rating')
    comment = request.data.get('comment', '') 

    if rating is None:
        return Response({"detail": "Rating is required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        rating = int(rating)
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5.")
    except ValueError as e:
         return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    mood = playlist.mood
    try:
        user_pref = UserPreference.objects.get(user=request.user)
        genre = user_pref.favorite_genre
    except UserPreference.DoesNotExist:
        genre = "Unknown" 

    other_tracks = playlist.tracks.exclude(pk=track_pk)
    other_tracks_formatted = "\n".join([f"- {t.title} by {t.artist}" for t in other_tracks])
    if not other_tracks_formatted:
        other_tracks_formatted = "(This is the only song)"

    prompt = (
        f"Context: A playlist was generated for a user feeling '{mood.mood_text}' "
        f"with an energy level of {mood.energy_level}/10. The preferred genre is '{genre}'. "
        f"It was {mood.season} during the {datetime.fromtimestamp(mood.timestamp.timestamp()).strftime('%H:%M')} when generated.\n"
        f"Current playlist songs (excluding the one being replaced):\n{other_tracks_formatted}\n\n"
        f"Feedback on Song: '{track_to_replace.title}' by '{track_to_replace.artist}'\n"
        f"- User Rating: {rating}/5\n"
        f"- User Comment: {comment}\n\n"
        f"Task: Suggest ONE replacement song (title, artist, duration) that fits the original mood/energy context "
        f"AND addresses the user's feedback. **Crucially, the replacement song MUST strictly be in the '{genre}' genre.** "
        f"The replacement should maintain the overall vibe while respecting the genre constraint. "
        f"Return ONLY the JSON object for the single replacement song with keys 'title', 'artist', 'duration'."
    )

    # Reverting to print statements due to persistent SyntaxError
    logger.debug("--- Replacement Prompt ---")
    logger.debug(prompt)
    logger.debug("--------------------------")

    new_track_data = call_openai_for_replacement(prompt)

    if not new_track_data:
        return Response({"detail": "Failed to generate replacement song from AI."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    track_to_replace.title = new_track_data.get('title', 'Unknown Title')
    track_to_replace.artist = new_track_data.get('artist', 'Unknown Artist')
    track_to_replace.duration = new_track_data.get('duration', '')
    track_to_replace.save()

    serializer = TrackSerializer(track_to_replace)
    return Response(serializer.data, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data, context={'request': request}) 

        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SpecializedPlaylistListView(generics.ListAPIView):
    queryset = SpecializedPlaylist.objects.all()
    serializer_class = SpecializedPlaylistSerializer
    permission_classes = [permissions.IsAuthenticated] 

class MoodHistoryView(generics.ListAPIView):
    serializer_class = MoodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MoodModel.objects.filter(user=user).order_by('-timestamp')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def get_emotion_recommendation(request):
    mood_text = request.data.get('mood_text', '')
    detected_emotion_text = request.data.get('detected_emotion_text', '') 
    user = request.user

    text_for_recommendation = mood_text if mood_text else detected_emotion_text

    if not text_for_recommendation:
        return Response({"error": "Mood text or detected emotion is required for recommendations."}, status=status.HTTP_400_BAD_REQUEST)

    prompt = (
        f"A user is feeling: '{text_for_recommendation}'. "
        f"Provide 2-3 concise, actionable coping strategies or pieces of advice specifically targeting the challenges or nature of this feeling. "
        f"Aim for advice that is distinct to '{text_for_recommendation}' where possible, rather than generic well-being tips applicable to any mood. "
        f"Focus on emotional regulation or healthy perspective shifts. Do not suggest music. Avoid overly clinical language. "
        f"Return ONLY a JSON object with a single key 'advice_list' which is an array of strings, each string being one piece of advice."
    )

    try:
        system_message = "You are an assistant that provides general well-being advice for emotions. Output ONLY a JSON object with the key 'advice_list' containing an array of advice strings."
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        advice_data = json.loads(response.choices[0].message.content)
        
        if 'advice_list' not in advice_data or not isinstance(advice_data['advice_list'], list):
            raise ValueError("OpenAI response missing 'advice_list' key or it's not a list.")
        if not all(isinstance(item, str) for item in advice_data['advice_list']):
             raise ValueError("'advice_list' must contain only strings.")

        return Response(advice_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error getting emotion recommendation for '{text_for_recommendation}' for user {user.username}: {str(e)}", exc_info=True)
        return Response({
            'error': "Failed to get emotion-based recommendation. Please try again later."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_track_from_playlist(request, playlist_pk, track_pk):
    playlist = get_object_or_404(Playlist, id=playlist_pk, mood__user=request.user) 
    track = get_object_or_404(Track, id=track_pk, playlist=playlist)
    
    track_title = track.title 
    track.delete()
            
    return Response({"message": f"Track '{track_title}' removed successfully."}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_track_to_playlist(request, playlist_pk):
    playlist = get_object_or_404(Playlist, id=playlist_pk, mood__user=request.user) 
    
    serializer = AddTrackSerializer(data=request.data, context={'request': request, 'playlist_pk': playlist_pk})
    if serializer.is_valid():
        new_track = serializer.save() 
        track_data = TrackSerializer(new_track).data 
        return Response(track_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reorder_playlist_tracks(request, playlist_pk):
    playlist = get_object_or_404(Playlist, id=playlist_pk, mood__user=request.user) 
    
    serializer = TrackOrderSerializer(data=request.data, context={'request': request, 'playlist_pk': playlist_pk})
    if serializer.is_valid():
        serializer.save() 
        updated_playlist_data = PlaylistSerializer(playlist).data
        return Response(updated_playlist_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def _search_spotify_for_track_details(title: str, artist: str, market_code: str | None = None):
    """
    Searches Spotify for a track by title and artist, optionally for a specific market.
    Returns a dictionary with track details if found, otherwise None.
    """
    client_id = os.environ.get('SPOTIPY_CLIENT_ID')
    client_secret = os.environ.get('SPOTIPY_CLIENT_SECRET')

    if not client_id or not client_secret:
        logger.error("Spotify API credentials (SPOTIPY_CLIENT_ID, SPOTIPY_CLIENT_SECRET) not found in environment variables.")
        return None

    try:
        client_credentials_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

        query = f"track:{title} artist:{artist}"
        logger.info(f"Searching Spotify with query: '{query}', market: '{market_code if market_code else 'None (default behavior)'}'")
        results = sp.search(q=query, type='track', limit=1, market=market_code) # Use dynamic market_code

        if results and results['tracks']['items']:
            track_item = results['tracks']['items'][0]
            
            duration_ms = track_item.get('duration_ms', 0)
            duration_seconds = duration_ms // 1000
            # Corrected duration formatting to avoid issues like 01:05 vs 1:05
            minutes = duration_seconds // 60
            seconds = duration_seconds % 60
            duration_formatted = f"{minutes}:{seconds:02d}"

            return {
                "title": track_item['name'],
                "artist": ", ".join([a['name'] for a in track_item['artists']]),
                "album": track_item['album']['name'],
                "duration_ms": duration_ms, # Keep ms for potential future use
                "duration": duration_formatted, # Formatted for display
                "spotify_uri": track_item.get('uri')
            }
        else:
            logger.warning(f"Spotify search: No results found for title='{title}', artist='{artist}' with market '{market_code}'")
            # Fallback: attempt search with just title if artist search fails or is too specific
            logger.info(f"Attempting Spotify search with title only: '{title}' with market '{market_code}'")
            results_title_only = sp.search(q=f"track:{title}", type='track', limit=5, market=market_code)
            if results_title_only and results_title_only['tracks']['items']:
                # Basic attempt to match artist if multiple results
                for item in results_title_only['tracks']['items']:
                    spotify_artists = [a['name'].lower() for a in item['artists']]
                    if artist.lower() in spotify_artists or any(artist.lower() in s_artist for s_artist in spotify_artists):
                        track_item = item # Found a plausible match
                        duration_ms = track_item.get('duration_ms', 0)
                        duration_seconds = duration_ms // 1000
                        minutes = duration_seconds // 60
                        seconds = duration_seconds % 60
                        duration_formatted = f"{minutes}:{seconds:02d}"
                        logger.info(f"Found fallback match for '{title}' by '{artist}' -> '{track_item['name']}' by '{', '.join([a['name'] for a in track_item['artists']])}' with market '{market_code}'")    
                        return {
                            "title": track_item['name'],
                            "artist": ", ".join([a['name'] for a in track_item['artists']]),
                            "album": track_item['album']['name'],
                            "duration_ms": duration_ms,
                            "duration": duration_formatted,
                            "spotify_uri": track_item.get('uri')
                        }
            logger.warning(f"Spotify search (title only fallback): Still no results for title='{title}' with market '{market_code}'")
            return None
    except spotipy.SpotifyException as se:
        logger.error(f"Spotify API error for title='{title}', artist='{artist}', market='{market_code}': {str(se)}. Status: {se.http_status}, Reason: {se.msg}")
        return None
    except Exception as e:
        logger.error(f"General Spotify search error for title='{title}', artist='{artist}': {str(e)}", exc_info=True)
        return None

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def find_and_add_spotify_track(request, playlist_pk):
    serializer = TrackDetailsRequestSerializer(data=request.data)
    if serializer.is_valid():
        title = serializer.validated_data['title']
        artist = serializer.validated_data['artist']
        
        playlist = get_object_or_404(Playlist, pk=playlist_pk, mood__user=request.user)

        spotify_track_details = _search_spotify_for_track_details(title, artist)

        if spotify_track_details:
            duration_ms = spotify_track_details.get('duration_ms', 0)
            duration_seconds = duration_ms // 1000
            duration_formatted = f"{duration_seconds // 60:02d}:{duration_seconds % 60:02d}"

            # Determine next order for the new track
            last_track = Track.objects.filter(playlist=playlist).order_by('-order_in_playlist').first()
            next_order = (last_track.order_in_playlist + 1) if last_track else 0

            new_track = Track.objects.create(
                playlist=playlist,
                title=spotify_track_details['title'],
                artist=spotify_track_details['artist'],
                album=spotify_track_details.get('album', 'N/A'),
                duration=duration_formatted, 
                spotify_uri=spotify_track_details.get('spotify_uri'),
                order_in_playlist=next_order # Set the order for the new track
            )
            return Response(TrackSerializer(new_track).data, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'Track not found on Spotify or error in search.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AnalyzeEmotionOpenAIView(APIView):
    permission_classes = [] 

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.client = OpenAI()
        if not self.client.api_key:
             logger.error("OpenAI API key not found in environment variables for AnalyzeEmotionOpenAIView.")

    def post(self, request, *args, **kwargs):
        if not self.client.api_key: 
             return Response({"error": "OpenAI API key not configured on server for emotion analysis."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        image_data_list = request.data.get('images')

        if not image_data_list or not isinstance(image_data_list, list) or len(image_data_list) != 1:
            return Response({"error": "Exactly one image is required for OpenAI analysis."}, status=status.HTTP_400_BAD_REQUEST)

        image_data_base64 = image_data_list[0]

        try:
            if ';base64,' in image_data_base64:
                header, encoded_data = image_data_base64.split(';base64,', 1)
                image_url = f"data:image/jpeg;base64,{encoded_data}" 
            else:
                image_url = f"data:image/jpeg;base64,{image_data_base64}"

            logger.info("Sending image to OpenAI for emotion analysis...")
            model_name = "gpt-4o" 
            
            response = self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text", 
                                "text": "Analyze the primary emotion displayed by the person in this image. Describe the emotion and any supporting facial cues. Respond concisely, focusing on the emotional state."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                     "url": image_url,
                                }
                            }
                        ]
                    }
                ],
                max_tokens=150
            )

            if response.choices and response.choices[0].message and response.choices[0].message.content:
                description = response.choices[0].message.content.strip()
                logger.info(f"OpenAI analysis successful. Description: {description}") 
                return Response({"description": description}, status=status.HTTP_200_OK)
            else:
                logger.error("OpenAI response was empty or malformed.") 
                return Response({"error": "Failed to get analysis from OpenAI."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.exception(f"Error during OpenAI API call in AnalyzeEmotionOpenAIView: {str(e)}") 
            return Response({"error": f"An error occurred during OpenAI analysis: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)