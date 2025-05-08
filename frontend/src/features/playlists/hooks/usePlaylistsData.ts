import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Playlist, Track } from '../../../types'; // Adjust path as needed
import { 
    getPlaylistHistory, 
    removeTrackFromPlaylistAPI, 
    findAndAddSpotifyTrackAPI,
    replacePlaylistTrack, // Assuming this is the correct name for the feedback submission API
    reorderPlaylistTracks 
} from '../../../services/api'; // Adjust path as needed

export interface UsePlaylistsDataReturn {
    playlistHistory: Playlist[];
    isLoading: boolean;
    error: string | null;
    fetchHistory: () => Promise<void>;
    handleRemoveTrack: (playlistId: string, trackId: string, trackTitle: string) => Promise<void>;
    
    // Add Song specific states and handlers
    showAddSongDialog: boolean;
    openAddSongDialog: (playlistId: string) => void;
    closeAddSongDialog: () => void;
    addSongTitle: string;
    setAddSongTitle: (title: string) => void;
    addSongArtist: string;
    setAddSongArtist: (artist: string) => void;
    isFindingSong: boolean;
    handleFindAndAddSong: () => Promise<void>;
    currentPlaylistForAdding: string | null;

    // Reorder specific states and handlers
    reorderModeActive: string | null;
    playlistTracksBeingReordered: Track[] | null;
    handleToggleReorderMode: (playlistId: string) => void;
    handleMoveTrackInReorder: (trackId: string, direction: 'up' | 'down') => void;
    handleSaveReorderedTracks: () => Promise<void>;
    cancelReorder: (playlistId: string) => void;

    // Feedback related updates (integrated into this hook)
    handleTrackReplacementInHistory: (playlistId: string, trackId: string, updatedTrack: Track) => void;
}

export const usePlaylistsData = (): UsePlaylistsDataReturn => {
    const [playlistHistory, setPlaylistHistory] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for "Add Song" dialog
    const [showAddSongDialog, setShowAddSongDialog] = useState(false);
    const [currentPlaylistForAdding, setCurrentPlaylistForAdding] = useState<string | null>(null);
    const [addSongTitle, setAddSongTitle] = useState("");
    const [addSongArtist, setAddSongArtist] = useState("");
    const [isFindingSong, setIsFindingSong] = useState(false);

    // State for Reordering
    const [reorderModeActive, setReorderModeActive] = useState<string | null>(null);
    const [playlistTracksBeingReordered, setPlaylistTracksBeingReordered] = useState<Track[] | null>(null);
    const [originalTracksForRevert, setOriginalTracksForRevert] = useState<Track[] | null>(null);


    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const history = await getPlaylistHistory();
            setPlaylistHistory(history);
        } catch (err: any) {
            console.error("Failed to fetch playlist history:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Please try again later.";
            toast.error("Failed to load playlist history", { description: errorMessage });
            setError(errorMessage);
            setPlaylistHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleRemoveTrack = async (playlistId: string, trackId: string, trackTitle: string) => {
        const toastId = toast.loading(`Removing "${trackTitle}"...`);
        try {
            await removeTrackFromPlaylistAPI(playlistId, trackId);
            setPlaylistHistory(currentHistory =>
                currentHistory.map(p => {
                    if (String(p.id) === playlistId) {
                        return {
                            ...p,
                            tracks: p.tracks.filter(t => String(t.id) !== trackId),
                        };
                    }
                    return p;
                })
            );
            toast.success(`"${trackTitle}" removed successfully.`, { id: toastId });
        } catch (err: any) {
            console.error("Failed to remove track:", err);
            toast.error(`Failed to remove "${trackTitle}"`, {
                id: toastId,
                description: err.message || "Please try again later."
            });
        }
    };

    const openAddSongDialog = (playlistId: string) => {
        setCurrentPlaylistForAdding(playlistId);
        setAddSongTitle("");
        setAddSongArtist("");
        setShowAddSongDialog(true);
    };

    const closeAddSongDialog = () => {
        setShowAddSongDialog(false);
        setCurrentPlaylistForAdding(null);
        setAddSongTitle("");
        setAddSongArtist("");
    }

    const handleFindAndAddSong = async () => {
        if (!currentPlaylistForAdding || !addSongTitle.trim() || !addSongArtist.trim()) {
            toast.error("Playlist ID, Title and Artist are required to add a song.");
            return;
        }
        setIsFindingSong(true);
        const toastId = toast.loading(`Finding and adding "${addSongTitle}" by ${addSongArtist}...`);

        try {
            const newTrack = await findAndAddSpotifyTrackAPI(currentPlaylistForAdding, addSongTitle, addSongArtist);
            setPlaylistHistory(currentHistory =>
                currentHistory.map(p => {
                    if (String(p.id) === currentPlaylistForAdding) {
                        const updatedTracks = [...p.tracks, newTrack].sort((a, b) => a.order_in_playlist - b.order_in_playlist);
                        return {
                            ...p,
                            tracks: updatedTracks,
                        };
                    }
                    return p;
                })
            );
            toast.success(`"${newTrack.title}" by ${newTrack.artist} added successfully.`, { id: toastId });
            closeAddSongDialog();
        } catch (err: any) {
            console.error("Failed to find and add track:", err);
            toast.error(`Failed to add song: ${err.response?.data?.detail || err.message || "Please try again."}`, {
                id: toastId,
            });
        } finally {
            setIsFindingSong(false);
        }
    };
    
    const handleTrackReplacementInHistory = (playlistId: string, trackId: string, updatedTrack: Track) => {
        setPlaylistHistory(currentHistory =>
            currentHistory.map(p => {
                if (String(p.id) === playlistId) {
                    return {
                        ...p,
                        tracks: p.tracks.map(t =>
                            String(t.id) === trackId ? updatedTrack : t
                        ).sort((a,b) => a.order_in_playlist - b.order_in_playlist) // Ensure order is maintained
                    };
                }
                return p;
            })
        );
    };

    const handleToggleReorderMode = (playlistId: string) => {
        if (reorderModeActive === playlistId) { // Deactivating reorder mode for this playlist
            // No need to revert here, cancellation or save will handle it.
            setReorderModeActive(null);
            setPlaylistTracksBeingReordered(null);
            setOriginalTracksForRevert(null);
        } else { // Activating reorder mode for a new playlist (or switching)
            if (reorderModeActive && playlistTracksBeingReordered && originalTracksForRevert) {
                // If another playlist was being reordered, revert its changes before switching
                 setPlaylistHistory(currentHistory =>
                    currentHistory.map(p => {
                        if (String(p.id) === reorderModeActive) {
                            return { ...p, tracks: originalTracksForRevert.sort((a,b) => a.order_in_playlist - b.order_in_playlist) };
                        }
                        return p;
                    })
                );
            }

            const playlistToReorder = playlistHistory.find(p => String(p.id) === playlistId);
            if (playlistToReorder) {
                const tracksCopy = JSON.parse(JSON.stringify(playlistToReorder.tracks));
                setReorderModeActive(playlistId);
                setPlaylistTracksBeingReordered(tracksCopy);
                setOriginalTracksForRevert(tracksCopy); // Store the original state for potential revert
            }
        }
    };
    
    const cancelReorder = (playlistId: string) => {
        if (reorderModeActive === playlistId && originalTracksForRevert) {
            setPlaylistHistory(currentHistory =>
                currentHistory.map(p => {
                    if (String(p.id) === playlistId) {
                        // Revert to original tracks order
                        return { ...p, tracks: originalTracksForRevert.sort((a,b) => a.order_in_playlist - b.order_in_playlist) };
                    }
                    return p;
                })
            );
        }
        setReorderModeActive(null);
        setPlaylistTracksBeingReordered(null);
        setOriginalTracksForRevert(null);
    };


    const handleMoveTrackInReorder = (trackId: string, direction: 'up' | 'down') => {
        if (!playlistTracksBeingReordered || !reorderModeActive) return;

        const tracks = [...playlistTracksBeingReordered];
        const currentIndex = tracks.findIndex(t => String(t.id) === trackId);

        if (currentIndex === -1) return;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= tracks.length) return;

        const temp = tracks[currentIndex];
        tracks[currentIndex] = tracks[targetIndex];
        tracks[targetIndex] = temp;

        const updatedTracksWithOrder = tracks.map((track, index) => ({ ...track, order_in_playlist: index }));
        setPlaylistTracksBeingReordered(updatedTracksWithOrder);
    };

    const handleSaveReorderedTracks = async () => {
        if (!reorderModeActive || !playlistTracksBeingReordered) {
            toast.error("No playlist is currently being reordered or no tracks to save.");
            return;
        }

        const playlistId = reorderModeActive;
        const orderedTracks = playlistTracksBeingReordered;
        const orderedTrackIds = orderedTracks.map(t => String(t.id));
        const toastId = toast.loading("Updating playlist order...");

        // Optimistically update UI
        setPlaylistHistory(currentHistory =>
            currentHistory.map(p => {
                if (String(p.id) === playlistId) {
                    return { ...p, tracks: orderedTracks.map((track, index) => ({ ...track, order_in_playlist: index })) };
                }
                return p;
            })
        );

        try {
            const updatedPlaylistFromServer = await reorderPlaylistTracks(playlistId, orderedTrackIds);
            setPlaylistHistory(currentHistory =>
                currentHistory.map(p => {
                    if (String(p.id) === playlistId) {
                        return updatedPlaylistFromServer; // Use server response as source of truth
                    }
                    return p;
                })
            );
            toast.success("Playlist order updated successfully.", { id: toastId });
            setReorderModeActive(null);
            setPlaylistTracksBeingReordered(null);
            setOriginalTracksForRevert(null);
        } catch (err: any) {
            console.error("Failed to update track order:", err);
            toast.error("Failed to update playlist order.", {
                id: toastId,
                description: err.message || "Please try again later."
            });
            // Revert to original tracks if save fails
            if (originalTracksForRevert) {
                 setPlaylistHistory(currentHistory =>
                    currentHistory.map(p => {
                        if (String(p.id) === playlistId) {
                            return { ...p, tracks: originalTracksForRevert.sort((a,b) => a.order_in_playlist - b.order_in_playlist) };
                        }
                        return p;
                    })
                );
            }
        }
    };

    return {
        playlistHistory,
        isLoading,
        error,
        fetchHistory,
        handleRemoveTrack,
        showAddSongDialog,
        openAddSongDialog,
        closeAddSongDialog,
        addSongTitle,
        setAddSongTitle,
        addSongArtist,
        setAddSongArtist,
        isFindingSong,
        handleFindAndAddSong,
        currentPlaylistForAdding,
        reorderModeActive,
        playlistTracksBeingReordered,
        handleToggleReorderMode,
        handleMoveTrackInReorder,
        handleSaveReorderedTracks,
        cancelReorder,
        handleTrackReplacementInHistory,
    };
}; 