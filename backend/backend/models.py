from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class MoodModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moods')
    mood_text = models.TextField()
    energy_level = models.IntegerField(default=5)  # Scale of 1-10
    timestamp = models.DateTimeField(default=timezone.now)
    season = models.CharField(max_length=20)  # Could be auto-calculated based on timestamp
    category = models.CharField(max_length=50, default='Other', blank=True) # Store the determined category
    
    def __str__(self):
        return f"{self.user.username}'s mood: {self.mood_text[:20]}..."

class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorite_genre = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Preference for {self.user.username}: {self.favorite_genre}"

class Playlist(models.Model):
    mood = models.ForeignKey(MoodModel, on_delete=models.CASCADE, related_name='playlists')
    name = models.CharField(max_length=200, default="My Mood Playlist")
    created_at = models.DateTimeField(default=timezone.now)
    prompt_used = models.TextField()
    llm_fallback_count = models.IntegerField(default=0)     # New field: count of tracks not found on Spotify
    total_tracks_generated = models.IntegerField(default=0) # New field: total tracks initially generated
    
    def __str__(self):
        return f"{self.name} (User: {self.mood.user.username}) - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Track(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='tracks')
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.CharField(max_length=255, null=True, blank=True)
    duration = models.CharField(max_length=10, null=True, blank=True)
    spotify_uri = models.CharField(max_length=255, null=True, blank=True)
    order_in_playlist = models.IntegerField(default=0)

    class Meta:
        ordering = ['order_in_playlist']

    def __str__(self):
        return f"{self.title} by {self.artist}"

class SpecializedPlaylist(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    generation_prompt_keywords = models.TextField(help_text="Keywords or base prompt for OpenAI to generate tracks, e.g., 'upbeat electronic for coding'")
    target_song_count = models.PositiveIntegerField(default=10)
    cached_tracks = models.JSONField(null=True, blank=True, help_text="JSON containing the list of tracks: [{title, artist, duration}] for the current day")
    last_refreshed_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name
