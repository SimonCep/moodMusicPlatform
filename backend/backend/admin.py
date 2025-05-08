from django.contrib import admin
from .models import MoodModel, UserPreference, Playlist, Track, SpecializedPlaylist

# Basic admin registration
admin.site.register(MoodModel)
admin.site.register(UserPreference)
admin.site.register(Playlist)
admin.site.register(Track)

@admin.register(SpecializedPlaylist)
class SpecializedPlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'target_song_count', 'last_refreshed_date')
    list_filter = ('last_refreshed_date',)
    search_fields = ('name', 'description', 'generation_prompt_keywords')
    readonly_fields = ('cached_tracks',)

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'generation_prompt_keywords', 'target_song_count', 'last_refreshed_date')
        }),
        ('Cached Content (Read-Only)', {
            'classes': ('collapse',), # Collapsible section
            'fields': ('cached_tracks',)
        }),
    )

# If you want to customize other admin interfaces, you can do so here.
# For example:
# class PlaylistAdmin(admin.ModelAdmin):
#     list_display = ('name', 'mood_summary', 'created_at', 'track_count')
#     def mood_summary(self, obj):
#         return obj.mood.mood_text[:50] + "..."
#     def track_count(self, obj):
#         return obj.tracks.count()
# admin.site.register(Playlist, PlaylistAdmin) 