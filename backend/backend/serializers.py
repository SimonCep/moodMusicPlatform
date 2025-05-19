from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MoodModel, Playlist, Track, UserPreference, SpecializedPlaylist
from django.contrib.auth.forms import SetPasswordForm, PasswordResetForm
from django.conf import settings
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import update_session_auth_hash
from django.db import transaction
from django.contrib.auth.password_validation import validate_password

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'title', 'artist', 'duration', 'order_in_playlist']

class PlaylistSerializer(serializers.ModelSerializer):
    tracks = TrackSerializer(many=True, read_only=True)
    
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'created_at', 'tracks', 'llm_fallback_count', 'total_tracks_generated']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class MoodSerializer(serializers.ModelSerializer):
    playlists = PlaylistSerializer(many=True, read_only=True)
    
    class Meta:
        model = MoodModel
        fields = ['id', 'mood_text', 'energy_level', 'timestamp', 'season', 'category', 'playlists']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
        read_only_fields = ('id', 'username', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def save(self, **kwargs):
        user = self.instance
        password = self.validated_data['new_password1']
        user.set_password(password)
        user.save()
        if self.context.get('request'):
            update_session_auth_hash(self.context['request'], user)
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password1 = serializers.CharField(required=True, write_only=True)
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Your old password was entered incorrectly. Please enter it again.")
        return value

    def validate(self, data):
        if data['new_password1'] != data['new_password2']:
            raise serializers.ValidationError({"new_password2": "The two password fields didn't match."})
        
        try:
            validate_password(data['new_password1'], self.context['request'].user)
        except serializers.ValidationError as e:
            raise serializers.ValidationError({'new_password1': list(e.messages)})
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password1'])
        user.save()
        update_session_auth_hash(self.context['request'], user) 
        return user

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['id', 'favorite_genre']

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        self.reset_form = PasswordResetForm(data=self.initial_data)
        if not self.reset_form.is_valid():
            raise serializers.ValidationError("Invalid email format.")
            
        if not User.objects.filter(email__iexact=value).exists():
            print(f"Password reset attempt for non-existent email: {value}")
            pass
             
        return value

    def save(self):
        request = self.context.get('request')
        email = self.validated_data['email']
        
        if User.objects.filter(email__iexact=email).exists():
            opts = {
                'use_https': request.is_secure(),
                'token_generator': default_token_generator,
                'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL', 'webmaster@localhost'),
                'email_template_name': 'registration/password_reset_email.html',
                'subject_template_name': 'registration/password_reset_subject.txt',
                'request': request, 
                'extra_email_context': {
                    'frontend_base_url': settings.FRONTEND_URL
                },
            }
            
            self.reset_form = PasswordResetForm({'email': email})
            if self.reset_form.is_valid():
                 self.reset_form.save(**opts)


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(max_length=128, write_only=True)
    new_password2 = serializers.CharField(max_length=128, write_only=True)
    uidb64 = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({'uidb64': 'Invalid user ID.'})

        if not default_token_generator.check_token(self.user, attrs['token']):
            raise serializers.ValidationError({'token': 'Invalid or expired token.'})
            
        if attrs['new_password1'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password2': "The two password fields didn't match."})

        self.set_password_form = SetPasswordForm(self.user, attrs)
        if not self.set_password_form.is_valid():
            raise serializers.ValidationError(self.set_password_form.errors)
            
        return attrs

    def save(self):
        self.set_password_form.save() 

class SpecializedPlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecializedPlaylist
        fields = ['id', 'name', 'description', 'generation_prompt_keywords', 'target_song_count', 'cached_tracks', 'last_refreshed_date']
        read_only_fields = ['cached_tracks', 'last_refreshed_date']

class AddTrackSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    artist = serializers.CharField(max_length=255)
    album = serializers.CharField(max_length=255, required=False, allow_blank=True)
    spotify_uri = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def create(self, validated_data):
        playlist_id = self.context['playlist_pk']
        playlist = Playlist.objects.get(id=playlist_id)
        
        last_track = Track.objects.filter(playlist=playlist).order_by('-order_in_playlist').first()
        next_order = (last_track.order_in_playlist + 1) if last_track else 0
        
        track = Track.objects.create(
            playlist=playlist,
            title=validated_data['title'],
            artist=validated_data['artist'],
            album=validated_data.get('album'),
            order_in_playlist=next_order
        )
        return track

class TrackOrderSerializer(serializers.Serializer):
    track_ids = serializers.ListField(
        child=serializers.IntegerField()
    )

    def save(self):
        playlist_id = self.context['playlist_pk']
        playlist = Playlist.objects.get(id=playlist_id)
        track_ids = self.validated_data['track_ids']
        
        with transaction.atomic():
            for index, track_id in enumerate(track_ids):
                Track.objects.filter(id=track_id, playlist=playlist).update(order_in_playlist=index)
        return playlist

class TrackDetailsRequestSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    artist = serializers.CharField(max_length=255)
