import json
import os
from datetime import date, datetime
from django.core.management.base import BaseCommand
from backend.models import SpecializedPlaylist
from openai import OpenAI
from django.conf import settings


client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

SEED_PLAYLIST_TEMPLATES = [
    {
        "name": "Morning Focus Flow",
        "description": "Instrumental electronic and ambient music to help you concentrate and start your day productively.",
        "generation_prompt_keywords": "instrumental electronic, ambient, focus, concentration, no lyrics, morning, productive, study, work",
        "target_song_count": 10,
    },
    {
        "name": "Workout Power Hour",
        "description": "High-energy tracks to fuel your workout session.",
        "generation_prompt_keywords": "high-energy, workout, gym, running, power, upbeat, electronic, pop, rock",
        "target_song_count": 12,
    },
    {
        "name": "Chill Evening Vibes",
        "description": "Relaxing tunes to unwind in the evening.",
        "generation_prompt_keywords": "chill, relaxing, evening, unwind, lofi, acoustic, jazz, calm",
        "target_song_count": 8,
    },
    {
        "name": "Coding Deep Dive",
        "description": "Instrumental tracks to keep you in the zone while coding.",
        "generation_prompt_keywords": "coding, programming, instrumental, electronic, focus, deep work, no distractions",
        "target_song_count": 15,
    },
    {
        "name": "Sunday Morning Coffee",
        "description": "Laid-back acoustic and indie tunes to ease into your Sunday.",
        "generation_prompt_keywords": "acoustic, indie, calm, soft, mellow, sunday, morning, relaxing, cozy",
        "target_song_count": 10,
    },
    {
        "name": "Late Night Drive",
        "description": "Atmospheric and moody tracks for reflective late-night drives.",
        "generation_prompt_keywords": "moody, atmospheric, synth, night, drive, introspective, chill, ambient, cinematic",
        "target_song_count": 12,
    },
    {
        "name": "Feel-Good Hits",
        "description": "Uplifting and catchy songs to boost your mood.",
        "generation_prompt_keywords": "feel-good, upbeat, pop, dance, happy, energy, catchy, summer",
        "target_song_count": 10,
    },
    {
        "name": "Rainy Day Reading",
        "description": "Soft piano and ambient music perfect for reading on a rainy day.",
        "generation_prompt_keywords": "piano, ambient, instrumental, soft, reading, rain, calm, classical, introspective",
        "target_song_count": 8,
    },
    {
        "name": "Party Starter",
        "description": "High-energy party anthems to get everyone on their feet.",
        "generation_prompt_keywords": "party, dance, edm, pop, hip-hop, upbeat, energy, fun, anthems",
        "target_song_count": 15,
    },
    {
        "name": "Study Burnout Recovery",
        "description": "Gentle, comforting music to help you reset after intense study sessions.",
        "generation_prompt_keywords": "recovery, study, burnout, gentle, soft, acoustic, lo-fi, chill, decompress, reset",
        "target_song_count": 10,
    },
    {
        "name": "Creative Flow",
        "description": "Inspiring and rhythmic instrumentals to spark your creativity.",
        "generation_prompt_keywords": "creative, inspiration, instrumental, beats, rhythmic, ambient, art, design, writing, flow",
        "target_song_count": 12,
    },
    {
        "name": "Anxiety Relief Mix",
        "description": "Soothing ambient and slow-tempo tracks to help calm your mind.",
        "generation_prompt_keywords": "calm, anxiety, relief, ambient, slow tempo, peaceful, minimal, nature sounds, therapeutic",
        "target_song_count": 8,
    },
    {
        "name": "Confidence Boost",
        "description": "Empowering anthems to boost your confidence and self-esteem.",
        "generation_prompt_keywords": "confidence, empowerment, upbeat, bold, pop, hip-hop, anthems, motivation, self-love",
        "target_song_count": 10,
    },
    {
        "name": "Focus & Flow for ADHD",
        "description": "Repetitive, no-vocal tracks designed to reduce distraction and aid sustained focus.",
        "generation_prompt_keywords": "ADHD, focus, no vocals, repetitive, electronic, study, work, deep concentration, instrumental",
        "target_song_count": 15,
    }
]


def generate_tracks_for_specialized_playlist(playlist_name, prompt_keywords, song_count, stdout_writer=None, stderr_writer=None):
    """
    Calls OpenAI to generate a list of tracks for a given specialized playlist.
    Returns a list of track dicts e.g., [{'title': '...', 'artist': '...', 'duration': '...'}] or None.
    Uses provided writer functions for output, defaulting to print if None.
    """
    _stdout = stdout_writer if stdout_writer else lambda msg, style=None: print(msg)
    _stderr = stderr_writer if stderr_writer else lambda msg, style=None: print(f"ERROR: {msg}")

    _stdout(f"Attempting to generate {song_count} tracks for playlist '{playlist_name}' with keywords: '{prompt_keywords}'...")
    
    prompt = (
        f"Generate a music playlist titled something like '{playlist_name}' based on these characteristics or purpose: '{prompt_keywords}'. "
        f"The playlist should contain exactly {song_count} songs. "
        f"Return ONLY a JSON object (no extra text before or after the JSON) with a single key 'tracks'. "
        f"The value of 'tracks' should be a JSON array of these songs. "
        f"Each song in the array must be an object with 'title', 'artist', 'duration', and 'spotify_track_id' fields. "
        f"The 'spotify_track_id' should be a valid Spotify track ID. If a Spotify ID cannot be found, this field can be null. "
        f"Example: {{ \"tracks\": [{{ \"title\": \"Song Title\", \"artist\": \"Artist Name\", \"duration\": \"3:45\", \"spotify_track_id\": \"abcdef1234567890\" }}] }}"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", 
            messages=[
                {"role": "system", "content": "You are an assistant that generates song lists in JSON format."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        response_text = response.choices[0].message.content
        
        try:
            data = json.loads(response_text)
            tracks = data.get('tracks')

            if not isinstance(tracks, list):
                _stderr(f"OpenAI response for '{playlist_name}' did not contain a list of tracks under the 'tracks' key. Response: {response_text}")
                return None

            if len(tracks) != song_count:
                _stdout(f"Warning: OpenAI returned {len(tracks)} tracks for '{playlist_name}', but {song_count} were requested. Using the returned tracks.", style=lambda x: x)
            
            valid_tracks = []
            for i, track_data in enumerate(tracks):
                if isinstance(track_data, dict) and 'title' in track_data and 'artist' in track_data and 'duration' in track_data:
                    valid_tracks.append({
                        'id': i,
                        'title': track_data.get('title'),
                        'artist': track_data.get('artist'),
                        'duration': track_data.get('duration'),
                        'spotify_track_id': track_data.get('spotify_track_id')
                    })
                else:
                    _stdout(f"Skipping invalid track data for '{playlist_name}': {track_data}", style=lambda x: x)
            
            if not valid_tracks:
                _stderr(f"No valid tracks found in OpenAI response for '{playlist_name}' after validation. Response: {response_text}")
                return None

            _stdout(f"Successfully generated {len(valid_tracks)} tracks for '{playlist_name}'.", style=lambda x: x)
            return valid_tracks

        except json.JSONDecodeError as e:
            _stderr(f"Failed to parse JSON response from OpenAI for '{playlist_name}': {e}. Response text: {response_text}")
            return None
        except KeyError as e:
            _stderr(f"Missing 'tracks' key in OpenAI JSON response for '{playlist_name}': {e}. Response text: {response_text}")
            return None

    except Exception as e:
        _stderr(f"Error calling OpenAI API for '{playlist_name}': {str(e)}")
        import traceback
        traceback.print_exc()
        return None

class Command(BaseCommand):
    help = 'Generates or refreshes tracks for all specialized playlists daily using OpenAI.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting manual specialized playlist refresh task..."))
        today = date.today()
        
        specialized_playlists = SpecializedPlaylist.objects.all()
        if not specialized_playlists.exists():
            self.stdout.write(self.style.WARNING("No specialized playlists found in the database. Seeding from templates might be needed or run startup logic."))
            return

        refreshed_count = 0
        for playlist in specialized_playlists:
            self.stdout.write(f"Checking playlist for manual refresh: '{playlist.name}' (ID: {playlist.id})")
            self.stdout.write(f"Attempting manual refresh for '{playlist.name}'...")
            new_tracks = generate_tracks_for_specialized_playlist(
                playlist.name, 
                playlist.generation_prompt_keywords,
                playlist.target_song_count,
                stdout_writer=self.stdout.write,
                stderr_writer=self.stderr.write
            )
            
            if new_tracks:
                playlist.cached_tracks = new_tracks
                playlist.last_refreshed_date = today
                playlist.save()
                self.stdout.write(self.style.SUCCESS(f"Successfully refreshed and saved playlist: '{playlist.name}'"))
                refreshed_count += 1
            else:
                self.stderr.write(self.style.ERROR(f"Failed to generate tracks for playlist: '{playlist.name}' during manual refresh."))
            
        self.stdout.write(self.style.SUCCESS(f"Manual specialized playlist refresh task finished. Refreshed {refreshed_count} playlists."))

def run_startup_playlist_generation(stdout_writer=None, stderr_writer=None):
    _stdout = stdout_writer if stdout_writer else lambda msg, style=None: print(msg)
    _stderr = stderr_writer if stderr_writer else lambda msg, style=None: print(f"ERROR: {msg}")

    _stdout(f"[{datetime.now()}] Running startup specialized playlist generation...")
    today = date.today()
    created_count = 0
    refreshed_count = 0

    for template in SEED_PLAYLIST_TEMPLATES:
        playlist, created = SpecializedPlaylist.objects.get_or_create(
            name=template["name"],
            defaults={
                'description': template["description"],
                'generation_prompt_keywords': template["generation_prompt_keywords"],
                'target_song_count': template["target_song_count"],
                'last_refreshed_date': None,
                'cached_tracks': None
            }
        )

        if created:
            _stdout(f"Created new specialized playlist entry: '{playlist.name}'")
            created_count +=1
        
        needs_tracks_generation = False
        if created or not playlist.cached_tracks or (playlist.last_refreshed_date and playlist.last_refreshed_date < today) or not playlist.last_refreshed_date:
            _stdout(f"Playlist '{playlist.name}' requires track generation/refresh (Created: {created}, No tracks: {not playlist.cached_tracks}, Stale: {playlist.last_refreshed_date < today if playlist.last_refreshed_date else True}).")
            needs_tracks_generation = True
        else:
            _stdout(f"Playlist '{playlist.name}' is already up-to-date for today ({playlist.last_refreshed_date}).")

        if needs_tracks_generation:
            new_tracks = generate_tracks_for_specialized_playlist(
                playlist.name,
                playlist.generation_prompt_keywords,
                playlist.target_song_count,
                stdout_writer=stdout_writer,
                stderr_writer=stderr_writer
            )
            if new_tracks:
                playlist.cached_tracks = new_tracks
                playlist.last_refreshed_date = today
                playlist.save(update_fields=['cached_tracks', 'last_refreshed_date'])
                _stdout(f"Successfully generated/refreshed tracks for '{playlist.name}'.")
                refreshed_count +=1
            else:
                 _stderr(f"Failed to generate tracks for '{playlist.name}' on startup.")
        
    _stdout(f"[{datetime.now()}] Startup playlist generation finished. Created: {created_count}, Refreshed/Generated Tracks for: {refreshed_count} playlists.") 