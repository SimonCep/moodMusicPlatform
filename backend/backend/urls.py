from django.contrib import admin
from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', views.UserCreate.as_view(), name='user_create'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('api/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('api/password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('api/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/mood-playlist/', views.create_mood_and_playlist, name='create_mood_and_playlist'),
    path('api/playlists/history/', views.PlaylistHistoryView.as_view(), name='playlist_history'),
    path('api/playlists/<int:playlist_pk>/tracks/<int:track_pk>/replace/', views.replace_track_view, name='replace_track'),
    path('api/specialized-playlists/', views.SpecializedPlaylistListView.as_view(), name='specialized_playlists'),
    path('api/mood-history/', views.MoodHistoryView.as_view(), name='mood_history'),
    path('api/emotion-recommendation/', views.get_emotion_recommendation, name='emotion_recommendation'),
    path('api/analyze-emotion-openai/', views.AnalyzeEmotionOpenAIView.as_view(), name='analyze_emotion_openai'),
    path('api/playlists/<int:playlist_pk>/tracks/<int:track_pk>/remove/', views.remove_track_from_playlist, name='playlist_track_remove'),
    path('api/playlists/<int:playlist_pk>/tracks/add/', views.add_track_to_playlist, name='playlist_track_add'),
    path('api/playlists/<int:playlist_pk>/tracks/reorder/', views.reorder_playlist_tracks, name='playlist_tracks_reorder'),
    path('api/playlists/<int:playlist_pk>/tracks/find-and-add/', views.find_and_add_spotify_track, name='playlist_track_find_and_add'),

]
