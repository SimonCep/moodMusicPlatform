export interface Mood {
    id: number;
    mood_text: string;
    energy_level: number;
    timestamp: string;
    season: string;
    category: string;
  }
  
  export interface Track {
    id: number | null;
    title: string;
    artist: string;
    album: string | null;
    genre: string | null;
    duration: string | null;
    file_path: string | null;
    spotify_track_id: string | null;
    youtube_video_id: string | null;
    isrc: string | null;
    cover_art_url: string | null;
    fingerprint_hash: string | null;
    preview_url: string | null;
    energy: number | null;
    valence: number | null;
    tempo: number | null;
    danceability: number | null;
    acousticness: number | null;
    instrumentalness: number | null;
    liveness: number | null;
    loudness: number | null;
    speechiness: number | null;
    key: number | null;
    mode: number | null;
    time_signature: number | null;
    popularity_score: number | null;
    release_date: string | null;
    added_at: string;
    last_played_at: string | null;
    play_count: number;
    rating: number | null;
    source: 'spotify' | 'youtube' | 'local' | 'soundcloud' | 'bandcamp' | 'other';
    tags: string[] | null;
    notes: string | null;
    quality: 'lossless' | 'high' | 'medium' | 'low' | null;
    bitrate: number | null;
    sample_rate: number | null;
    channels: number | null;
    order_in_playlist: number;
  }
  
  export interface BackendTrack {
    id: number | null;
    title: string;
    artist: string;
    duration: string | null;
  }
  
  export interface DiscoveryPreviewState {
    uri: string | null | undefined;
    loading: boolean;
  }
  
  export interface DiscoveryAllPreviewsState {
    [playlistId: string]: {
      [trackKey: string]: DiscoveryPreviewState;
    };
  }
  
  export interface Playlist {
    id: string;
    name: string;
    created_at: string;
    tracks: Track[];
    llm_fallback_count?: number;
    total_tracks_generated?: number;
  }
  
  export interface MoodPlaylistResponse {
    playlist: Playlist;
  }
  
  export interface UserCredentials {
    username?: string;
    password?: string;
  }
  
  export interface RegisterData extends UserCredentials {
    email?: string;
  }
  
  export interface AuthResponse {
    refresh: string;
    access: string;
  }
  
  export interface PasswordResetConfirmData {
    uidb64: string;
    token: string;
    new_password1: string;
    new_password2: string;
  }
  
  export interface UserProfile {
    id: number;
    username: string;
    email: string;
  }
  
  export interface SpecializedPlaylist {
    id: number;
    name: string;
    description: string;
    generation_prompt_keywords: string;
    target_song_count: number;
    cached_tracks: Track[] | null;
    last_refreshed_date: string | null;
  }
  
  export interface EmotionRecommendation {
    advice_list: string[];
  }
  
  export interface EmotionRecommendationError {
    error: string;
  }
  