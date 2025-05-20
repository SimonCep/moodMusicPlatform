import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { searchSpotifyTrack } from '../services/spotify';
import { SpecializedPlaylist } from '../types';
import { DiscoveryAllPreviewsState } from '../types';

export const getSpotifyTrackIdFromUri = (uri: string | null | undefined): string | null => {
    if (!uri || !uri.startsWith('spotify:track:')) return null;
    return uri.split(':')[2];
};

export const useDiscoveryPreview = (playlists: SpecializedPlaylist[]) => {
  const [discoveryPreviewStates, setDiscoveryPreviewStates] = useState<DiscoveryAllPreviewsState>({});
  const [activePreview, setActivePreview] = useState<{ playlistId: number; trackKey: string } | null>(null);

  useEffect(() => {
    const initialStates = playlists.reduce((acc, playlist) => {
      const playlistKey = String(playlist.id);
      acc[playlistKey] = {};
      if (playlist.cached_tracks) {
        playlist.cached_tracks.forEach((track, index) => {
          const trackKey = String(track.id != null ? track.id : index);
          acc[playlistKey][trackKey] = discoveryPreviewStates[playlistKey]?.[trackKey] || { uri: null, loading: false };
        });
      }
      return acc;
    }, {} as DiscoveryAllPreviewsState);
    setDiscoveryPreviewStates(initialStates);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlists]);

  const handleLoadDiscoveryPreview = useCallback(async (playlistId: number, trackKey: string, title: string, artist: string) => {
    const playlistKeyStr = String(playlistId);

    setDiscoveryPreviewStates(prev => ({
        ...prev,
        [playlistKeyStr]: {
            ...(prev[playlistKeyStr] || {}),
            [trackKey]: { uri: null, loading: true }
        }
    }));

    try {
        const uri = await searchSpotifyTrack(title, artist);
        setDiscoveryPreviewStates(prev => ({
            ...prev,
            [playlistKeyStr]: {
                ...(prev[playlistKeyStr] || {}),
                [trackKey]: { uri: uri ?? undefined, loading: false }
            }
        }));
        
        if (uri) {
            setActivePreview({ playlistId, trackKey });
        } else {
            toast.info(`Spotify preview not found for "${title}"`);
            if (activePreview?.playlistId === playlistId && activePreview?.trackKey === trackKey) {
                setActivePreview(null);
            }
        }
    } catch (err) {
        toast.error("Failed to search Spotify", { description: "Please try again." });
        setDiscoveryPreviewStates(prev => ({
            ...prev,
            [playlistKeyStr]: {
                ...(prev[playlistKeyStr] || {}),
                [trackKey]: { uri: undefined, loading: false }
            }
        }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePreview]);

  const handleTogglePreview = useCallback((playlistId: number, trackKey: string, spotifyTrackIdFromUri?: string | null) => {
    if (!spotifyTrackIdFromUri) { 
        toast.info("Spotify preview ID not available for this track.");
        setActivePreview(null);
        return;
    }
    setActivePreview(prev => {
      if (prev?.playlistId === playlistId && prev?.trackKey === trackKey) {
        return null;
      }
      return { playlistId, trackKey };
    });
  }, []);

  return {
    discoveryPreviewStates,
    activePreview,
    handleLoadDiscoveryPreview,
    handleTogglePreview,
    getSpotifyTrackIdFromUri
  };
}; 