import axios from 'axios';
import { MoodPlaylistResponse, UserCredentials, AuthResponse, RegisterData, Playlist, PasswordResetConfirmData, Track, SpecializedPlaylist, Mood, EmotionRecommendation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { apiClient };


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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest.url;

    if (status === 401 && !originalRequest._retry && 
      url !== '/api/token/' && url !== '/api/token/refresh/') {
      originalRequest._retry = true;
      try {
        console.log('Attempting token refresh...');
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) {
          throw new Error("No refresh token available for refresh attempt.");
        }
        const { data } = await axios.post(`${API_URL}/api/token/refresh/`, { refresh });
        console.log('Token refresh successful');
        localStorage.setItem('accessToken', data.access);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        logoutUser();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (userData: RegisterData): Promise<any> => {
    const response = await apiClient.post('/api/register/', userData);
    return response.data;
}

export const loginUser = async (credentials: UserCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/token/', credentials);
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
    delete apiClient.defaults.headers.common['Authorization'];
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    await apiClient.post('/api/password-reset/', { email });
};

export const confirmPasswordReset = async (data: PasswordResetConfirmData): Promise<void> => {
    await apiClient.post('/api/password-reset/confirm/', data);
};

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

export const getPlaylistHistory = async (): Promise<Playlist[]> => {
    const response = await apiClient.get<Playlist[]>('/api/playlists/history/'); 
    return response.data;
};

export const getSpecializedPlaylists = async (): Promise<SpecializedPlaylist[]> => {
  console.log("API: Fetching specialized playlists from /api/specialized-playlists/");
  const response = await apiClient.get<SpecializedPlaylist[]>('/api/specialized-playlists/');
  return response.data;
};

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
    return response.data;
};

export const getMoodHistory = async (): Promise<Mood[]> => {
    const response = await apiClient.get<Mood[]>('/api/mood-history/');
    return response.data;
};

export const getEmotionRecommendation = async (moodText: string): Promise<EmotionRecommendation> => {
    const payload = {
        mood_text: moodText, 
        detected_emotion_text: ''
    };
    const response = await apiClient.post<EmotionRecommendation>('/api/emotion-recommendation/', payload);
    return response.data;
};

export const removeTrackFromPlaylistAPI = async (playlistId: string, trackId: string): Promise<void> => {
  await apiClient.delete(`/api/playlists/${playlistId}/tracks/${trackId}/remove/`);
};

export const addTrackToPlaylistAPI = async (
    playlistId: string, 
    trackData: { title: string; artist: string; album?: string; spotify_uri?: string | null; duration?: string; }
): Promise<Track> => {
  const response = await apiClient.post<Track>(
      `/api/playlists/${playlistId}/tracks/add/`, 
      trackData
  );
  return response.data;
};

export const reorderPlaylistTracks = async (
    playlistId: string, 
    orderedTrackIds: string[]
): Promise<Playlist> => {
  const response = await apiClient.post<Playlist>(
      `/api/playlists/${playlistId}/tracks/reorder/`, 
      { track_ids: orderedTrackIds }
  );
  return response.data;
};

export const findAndAddSpotifyTrackAPI = async (
  playlistId: string,
  title: string,
  artist: string
): Promise<Track> => {
  const response = await apiClient.post<Track>(
    `/api/playlists/${playlistId}/tracks/find-and-add/`, 
    { title, artist }
  );
  return response.data;
};

export default apiClient;