import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Track } from '../../../types';
import { searchSpotifyTrack } from '../../../services/spotify';

export interface TrackPreviewState {
    uri: string | null | undefined;
    loading: boolean;
}

export interface TrackPreviewStates {
    [playlistId: string]: { [trackId: string]: TrackPreviewState };
}

interface ActiveTrackFrame {
    playlistId: string;
    trackId: string;
}

export interface UseTrackPreviewReturn {
    trackPreviewStates: TrackPreviewStates;
    activeTrackFrame: ActiveTrackFrame | null;
    handleLoadPreview: (playlistId: string, track: Track) => Promise<void>;
    handleToggleTrackFrame: (playlistId: string, trackId: string) => void;
    getSpotifyTrackIdFromUri: (uri: string | null | undefined) => string | null;
    initializePreviewStatesForPlaylists: (playlists: { id: string | number; tracks: Track[] }[]) => void;
    setTrackPreviewStates: React.Dispatch<React.SetStateAction<TrackPreviewStates>>;
}

export const useTrackPreview = (): UseTrackPreviewReturn => {
    const [trackPreviewStates, setTrackPreviewStates] = useState<TrackPreviewStates>({});
    const [activeTrackFrame, setActiveTrackFrame] = useState<ActiveTrackFrame | null>(null);

    const initializePreviewStatesForPlaylists = useCallback((playlists: { id: string | number; tracks: Track[] }[]) => {
        const initialStates = playlists.reduce((acc, playlist) => {
            acc[String(playlist.id)] = playlist.tracks.reduce((trackAcc, track) => {
                trackAcc[String(track.id)] = { uri: null, loading: false };
                return trackAcc;
            }, {} as { [trackId: string]: TrackPreviewState });
            return acc;
        }, {} as TrackPreviewStates);
        setTrackPreviewStates(initialStates);
    }, []);

    const handleLoadPreview = async (playlistId: string, track: Track) => {
        const playlistKey = String(playlistId);
        const trackKey = String(track.id);

        setTrackPreviewStates(prev => ({
            ...prev,
            [playlistKey]: {
                ...(prev[playlistKey] || {}),
                [trackKey]: { uri: null, loading: true }
            }
        }));

        try {
            const uri = await searchSpotifyTrack(track.title, track.artist);
            setTrackPreviewStates(prev => ({
                ...prev,
                [playlistKey]: {
                    ...(prev[playlistKey] || {}),
                    [trackKey]: { uri: uri ?? undefined, loading: false }
                }
            }));

            if (uri) {
                setActiveTrackFrame({ playlistId: playlistKey, trackId: trackKey });
            } else {
                toast.info(`Spotify preview not found for "${track.title}"`);
                if (activeTrackFrame?.playlistId === playlistKey && activeTrackFrame?.trackId === trackKey) {
                    setActiveTrackFrame(null);
                }
            }
        } catch (err) {
            console.error("Error during Spotify search:", err);
            toast.error("Failed to search Spotify", { description: "Please try again later." });
            setTrackPreviewStates(prev => ({
                ...prev,
                [playlistKey]: {
                    ...(prev[playlistKey] || {}),
                    [trackKey]: { uri: undefined, loading: false }
                }
            }));
            if (activeTrackFrame?.playlistId === playlistKey && activeTrackFrame?.trackId === trackKey) {
                setActiveTrackFrame(null);
            }
        }
    };

    const handleToggleTrackFrame = (playlistId: string, trackId: string) => {
        setActiveTrackFrame(prev => {
            if (prev?.playlistId === playlistId && prev?.trackId === trackId) {
                return null;
            }
            return { playlistId, trackId };
        });
    };

    const getSpotifyTrackIdFromUri = (uri: string | null | undefined): string | null => {
        if (!uri || !uri.startsWith('spotify:track:')) return null;
        return uri.split(':')[2];
    };

    return {
        trackPreviewStates,
        activeTrackFrame,
        handleLoadPreview,
        handleToggleTrackFrame,
        getSpotifyTrackIdFromUri,
        initializePreviewStatesForPlaylists,
        setTrackPreviewStates
    };
}; 