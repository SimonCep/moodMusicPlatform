import React, { useState, useEffect } from 'react';
import SongFeedbackPopup from '../components/SongFeedbackPopup';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { PlusCircle, Save, Ban as CancelIcon, Edit3 as ReorderIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Track, Playlist } from '../types'; // Ensure Track & Playlist types are correctly imported/defined
import { usePlaylistsData } from '../features/playlists/hooks/usePlaylistsData';
import { useTrackPreview, TrackPreviewStates } from '../features/playlists/hooks/useTrackPreview';
import { formatPlaylistDate } from '../features/playlists/utils/dateUtils';
import AddSongDialog from '../features/playlists/components/AddSongDialog';
import PlaylistTracksTable from '../features/playlists/components/PlaylistTracksTable';
import { replacePlaylistTrack } from '../services/api';


const revisedDisclaimerText = "Song suggestions for niche or highly regional genres may sometimes be inaccurate or difficult to verify. We do our best, but some tracks in this playlist might not exist due to the complexity of the LLM's suggestions. For more consistently verifiable results, try using broader genre terms or selecting more mainstream music styles.";

const PlaylistsPage: React.FC = () => {
  const {
    playlistHistory,
    isLoading,
    error,
    handleRemoveTrack,
    showAddSongDialog,
    openAddSongDialog: openAddSongDialogFromHook,
    closeAddSongDialog,
    addSongTitle,
    setAddSongTitle,
    addSongArtist,
    setAddSongArtist,
    isFindingSong,
    handleFindAndAddSong,
    reorderModeActive,
    playlistTracksBeingReordered,
    handleToggleReorderMode,
    handleMoveTrackInReorder,
    handleSaveReorderedTracks,
    cancelReorder,
    handleTrackReplacementInHistory,
  } = usePlaylistsData();

  const trackPreviewHook = useTrackPreview();
  const { initializePreviewStatesForPlaylists, setTrackPreviewStates } = trackPreviewHook;

  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [editingTrackInfo, setEditingTrackInfo] = useState<{ playlistId: string, track: Track } | null>(null);

  useEffect(() => {
    if (playlistHistory && playlistHistory.length > 0) {
      initializePreviewStatesForPlaylists(playlistHistory.map(p => ({id: String(p.id), tracks: p.tracks })));
    }
  }, [playlistHistory, initializePreviewStatesForPlaylists]);

  const handleFeedbackClick = (playlistId: string, track: Track) => {
    setEditingTrackInfo({ playlistId, track });
    setShowFeedbackPopup(true);
  };

  const handleCloseFeedbackPopup = () => {
    setShowFeedbackPopup(false);
    setEditingTrackInfo(null);
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!editingTrackInfo) return;

    const { playlistId, track } = editingTrackInfo;
    const trackId = String(track.id);
    const originalTitle = track.title;
    const toastId = toast.loading(`Replacing "${originalTitle}"...`);

    try {
      const updatedTrackData = await replacePlaylistTrack(playlistId, trackId, rating, comment);
      handleTrackReplacementInHistory(playlistId, trackId, updatedTrackData);
      
      setTrackPreviewStates((prev: TrackPreviewStates) => {
        const newState = { ...prev };
        if (newState[playlistId]) {
          delete newState[playlistId][trackId];
        }
        return newState;
      });

      toast.success(`Replaced "${originalTitle}" with "${updatedTrackData.title}"`, {
        id: toastId,
      });
      handleCloseFeedbackPopup();
    } catch (error: any) {
      // console.error removed
      toast.error(`Failed to replace "${originalTitle}"`, {
        id: toastId,
        description: error.response?.data?.detail || error.message || "Please try again later."
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-card-foreground/80">Loading your playlists...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-destructive">Error loading history: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Card className="w-full max-w-4xl glass-card text-card-foreground mb-6 bg-black/10 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>Your Playlist History</CardTitle>
          <CardDescription className="text-card-foreground/80">
            View your previously generated playlists. Load previews from Spotify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {playlistHistory && playlistHistory.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {playlistHistory.map((playlist: Playlist, index: number) => {
                const currentPlaylistIdStr = String(playlist.id);
                const isReorderModeForThisPlaylist = reorderModeActive === currentPlaylistIdStr;
                const tracksForDisplay = isReorderModeForThisPlaylist && playlistTracksBeingReordered 
                  ? playlistTracksBeingReordered 
                  : playlist.tracks;

                // Removed debug logs

                const showDisclaimer = playlist.total_tracks_generated != null && playlist.llm_fallback_count != null &&
                                     playlist.total_tracks_generated > 0 && 
                                     playlist.llm_fallback_count > playlist.total_tracks_generated / 2;

                // Removed debug logs

                return (
                  <AccordionItem value={`item-${index}`} key={currentPlaylistIdStr} className="mb-2 border-b-0 rounded-lg overflow-hidden shadow-md bg-black/5 backdrop-blur-md border border-white/10">
                    <AccordionTrigger className="text-left hover:no-underline px-6 py-4 data-[state=open]:bg-primary/10 group">
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex flex-col text-left">
                          <span className="truncate mr-2 font-medium text-lg text-card-foreground">{playlist.name || 'Unnamed Playlist'}</span>
                          <span className="text-xs text-card-foreground/80">
                            {formatPlaylistDate(playlist.created_at)} - {playlist.tracks ? playlist.tracks.length : 0} tracks
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 ml-2 opacity-0 group-data-[state=open]:opacity-100 transition-opacity duration-300 ease-in-out">
                          {!isReorderModeForThisPlaylist && (
                            <Button
                              variant="ghost" size="icon"
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); openAddSongDialogFromHook(currentPlaylistIdStr); }} // Typed 'e'
                              className="text-primary hover:text-primary/80"
                              aria-label="Add song to playlist"
                            >
                              <PlusCircle size={20} />
                            </Button>
                          )}
                          {isReorderModeForThisPlaylist ? (
                            <>
                              <Button
                                variant="outline" size="icon"
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSaveReorderedTracks(); }} // Typed 'e'
                                className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-600"
                                title="Save Order"
                              >
                                <Save size={18} />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); cancelReorder(currentPlaylistIdStr); }} // Typed 'e'
                                className="text-destructive hover:text-destructive/80"
                                title="Cancel Reorder"
                              >
                                <CancelIcon size={20} />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost" size="icon"
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleToggleReorderMode(currentPlaylistIdStr); }} // Typed 'e'
                              className="text-blue-500 hover:text-blue-600"
                              title="Reorder Playlist"
                            >
                              <ReorderIcon size={18} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-4 pt-0 sm:px-4 md:px-6">
                      {showDisclaimer && (
                        <div className="my-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm rounded-md">
                          <p><span className="font-semibold">Please Note:</span> {revisedDisclaimerText}</p>
                        </div>
                      )}

                      {playlist.tracks && playlist.tracks.length > 0 ? (
                        <PlaylistTracksTable
                          playlist={playlist}
                          tracksToDisplay={tracksForDisplay}
                          reorderModeActiveForCurrentPlaylist={isReorderModeForThisPlaylist}
                          onMoveTrack={handleMoveTrackInReorder}
                          trackPreviewHook={trackPreviewHook}
                          onFeedbackClick={handleFeedbackClick}
                          onRemoveTrack={handleRemoveTrack}                                               
                        />
                      ) : (
                        <div className="text-center p-4 text-card-foreground/70">
                          This playlist currently has no tracks.
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center p-8 text-card-foreground/80">
              You haven't generated any playlists yet. Go to Mood Check-in to create your first one!
            </div>
          )}
        </CardContent>
      </Card>

      {editingTrackInfo && (
        <SongFeedbackPopup
          open={showFeedbackPopup}
          trackTitle={editingTrackInfo.track.title}
          trackArtist={editingTrackInfo.track.artist}
          onSubmit={handleFeedbackSubmit}
          onCancel={handleCloseFeedbackPopup}
        />
      )}

      <AddSongDialog 
        open={showAddSongDialog}
        onOpenChange={(isOpen: boolean) => !isOpen && closeAddSongDialog()} // Typed 'isOpen'
        title={addSongTitle}
        onTitleChange={setAddSongTitle}
        artist={addSongArtist}
        onArtistChange={setAddSongArtist}
        onSubmit={handleFindAndAddSong}
        isFinding={isFindingSong}
      />
    </div>
  );
};

export default PlaylistsPage; 