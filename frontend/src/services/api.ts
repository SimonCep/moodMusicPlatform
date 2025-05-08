import axios from 'axios';
import { MoodPlaylistResponse, UserCredentials, AuthResponse, RegisterData, Playlist, PasswordResetConfirmData, Track, SpecializedPlaylist, Mood, EmotionRecommendation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export the configured apiClient instance
export { apiClient };

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to handle token refresh (optional but recommended for production)
// const refreshToken = async () => { ... };

// Add an error interceptor to handle 401 errors (e.g., token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest.url;

    // Check for 401 error, ensure it's not a retry, 
    // AND ensure it wasn't the login or refresh token endpoints that failed
    if (status === 401 && !originalRequest._retry && 
        url !== '/api/token/' && url !== '/api/token/refresh/') {
            
      originalRequest._retry = true; // Mark as retried
      try {
        console.log('Attempting token refresh...');
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) {
            console.log('No refresh token found, cannot refresh.');
            // If refresh fails because no token exists, logout/redirect might be appropriate
            // but we should let the original error propagate first or handle differently.
            // Throwing here leads to the redirect problem.
            // Consider triggering logout state change via context instead of hard redirect.
             throw new Error("No refresh token available for refresh attempt.");
        }
        
        const { data } = await axios.post(`${API_URL}/api/token/refresh/`, { refresh });
        console.log('Token refresh successful');
        localStorage.setItem('accessToken', data.access);
        // Update default headers for subsequent requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
        // Update the header for the retried request
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        return apiClient(originalRequest); // Retry original request

      } catch (refreshError: any) {
        console.error("Token refresh failed:", refreshError.message || refreshError);
        // If refresh attempt fails, clear tokens and potentially trigger logout state
        // Avoid hard redirect here as it clears component state/console
        logoutUser(); // Use the existing logout function to clear tokens
        // Optionally, trigger a state update via context if needed for UI changes
        // Example: authContext.triggerLogoutState(); 
        // Let the original 401 error propagate or a specific refresh error
        return Promise.reject(refreshError); // Reject with the refresh error
      }
    }
    
    // If it's a 401 from login/refresh endpoint, or not 401, or already retried, just reject
    console.log("Interceptor: Rejecting error without refresh attempt.", {status, url});
    return Promise.reject(error);
  }
);

export const registerUser = async (userData: RegisterData): Promise<any> => {
    const response = await apiClient.post('/api/register/', userData);
    return response.data;
}

export const loginUser = async (credentials: UserCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/token/', credentials);
    // Store tokens upon successful login
    if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
    }
    if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
}

export const logoutUser = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Optionally call a backend blacklist endpoint if using token blacklisting
    delete apiClient.defaults.headers.common['Authorization'];
};

// Password Reset Request
export const requestPasswordReset = async (email: string): Promise<void> => {
    await apiClient.post('/api/password-reset/', { email });
};

// Password Reset Confirmation
export const confirmPasswordReset = async (data: PasswordResetConfirmData): Promise<void> => {
    await apiClient.post('/api/password-reset/confirm/', data);
};

// Update function signature to accept songCount and detectedEmotionText
export const createMoodAndGetPlaylist = async (moodText: string, energyLevel: number, genre: string, songCount: number, playlistGoal?: string, detectedEmotionText?: string): Promise<MoodPlaylistResponse> => {
  const payload: any = {
    mood_text: moodText,
    energy_level: energyLevel,
    favorite_genre: genre,
    song_count: songCount,
    playlist_goal: playlistGoal
  };

  if (detectedEmotionText) {
    payload.detected_emotion_text = detectedEmotionText;
  }

  const response = await apiClient.post<MoodPlaylistResponse>('/api/mood-playlist/', payload);
  return response.data;
};

// Get Playlist History for User
export const getPlaylistHistory = async (): Promise<Playlist[]> => {
    console.log("API: Fetching playlist history from /api/playlists/history/");
    const response = await apiClient.get<Playlist[]>('/api/playlists/history/'); 
    return response.data;
};

// Get Latest Playlist for User - Placeholder, will be removed from PlaylistsPage
export const getLatestPlaylist = async (): Promise<Playlist> => {
    // Assuming the backend provides an endpoint to get the latest playlist
    // for the authenticated user.
    // This might be deprecated in favor of getPlaylistHistory
    console.warn("API: getLatestPlaylist called, consider using getPlaylistHistory.");
    console.log("API: Fetching latest playlist from /api/playlists/latest/");
    // If /latest/ endpoint still exists, keep it, otherwise remove or update.
    // For now, we assume it might still exist, but PlaylistsPage will use history.
    try {
        const response = await apiClient.get<Playlist>('/api/playlists/latest/'); 
        return response.data;
    } catch (error) {
        console.error("Failed to fetch latest playlist:", error);
        // Return a dummy/empty playlist structure or throw to indicate failure
        throw error; // Re-throw the error to be handled by the caller
    }
};

// Function to get specialized playlists
export const getSpecializedPlaylists = async (): Promise<SpecializedPlaylist[]> => {
  console.log("API: Fetching specialized playlists from /api/specialized-playlists/");
  const response = await apiClient.get<SpecializedPlaylist[]>('/api/specialized-playlists/');
  return response.data;
};

// Function to replace a specific track in a playlist based on feedback
export const replacePlaylistTrack = async (
    playlistId: string, 
    trackId: string, 
    rating: number, 
    comment: string
): Promise<Track> => {
    console.log(`API: Requesting replacement for track ${trackId} in playlist ${playlistId}`);
    const response = await apiClient.post<Track>(
        `/api/playlists/${playlistId}/tracks/${trackId}/replace/`, 
        {
            rating: rating,
            comment: comment
        }
    );
    // Assuming the backend returns the updated/new track data
    return response.data;
};

// New service functions for Mood History and Emotion Recommendation
export const getMoodHistory = async (): Promise<Mood[]> => {
    console.log("API: Fetching mood history from /api/mood-history/");
    const response = await apiClient.get<Mood[]>('/api/mood-history/');
    return response.data;
};

export const getEmotionRecommendation = async (moodText: string): Promise<EmotionRecommendation> => {
    console.log(`API: Fetching emotion recommendation for: ${moodText}`);
    // Backend expects mood_text and detected_emotion_text, but for this call, 
    // moodText from MoodModel is the consolidated one.
    const payload = {
        mood_text: moodText, 
        detected_emotion_text: '' // Send empty for this, backend will use mood_text
    };
    const response = await apiClient.post<EmotionRecommendation>('/api/emotion-recommendation/', payload);
    return response.data;
};

// --- New API service functions for Playlist Track Management ---

// Remove a track from a playlist
export const removeTrackFromPlaylistAPI = async (playlistId: string, trackId: string): Promise<void> => {
  console.log(`API: Removing track ${trackId} from playlist ${playlistId}`);
  await apiClient.delete(`/api/playlists/${playlistId}/tracks/${trackId}/remove/`);
};

// Add a track to a playlist
// The backend's AddTrackSerializer expects title, artist, and optionally album, spotify_uri
export const addTrackToPlaylistAPI = async (
    playlistId: string, 
    trackData: { title: string; artist: string; album?: string; spotify_uri?: string | null; duration?: string; }
): Promise<Track> => {
  console.log(`API: Adding track ${trackData.title} to playlist ${playlistId}`);
  const response = await apiClient.post<Track>(
      `/api/playlists/${playlistId}/tracks/add/`, 
      trackData
  );
  return response.data; // Backend should return the newly created track with its ID and order
};

// Reorder tracks in a playlist
export const reorderPlaylistTracks = async (
    playlistId: string, 
    orderedTrackIds: string[]
): Promise<Playlist> => {
  console.log(`API: Reordering tracks in playlist ${playlistId}`);
  const response = await apiClient.post<Playlist>(
      `/api/playlists/${playlistId}/tracks/reorder/`, 
      { track_ids: orderedTrackIds } // Backend's TrackOrderSerializer expects { track_ids: [...] }
  );
  return response.data; // Backend should return the updated playlist with reordered tracks
};

// Find a track on Spotify (via backend) and add it to a playlist
export const findAndAddSpotifyTrackAPI = async (
  playlistId: string,
  title: string,
  artist: string
): Promise<Track> => {
  console.log(`API: Finding and adding track "${title}" by ${artist} to playlist ${playlistId}`);
  const response = await apiClient.post<Track>(
    `/api/playlists/${playlistId}/tracks/find-and-add/`, // New backend endpoint
    { title, artist }
  );
  return response.data; // Backend returns the newly added track
};