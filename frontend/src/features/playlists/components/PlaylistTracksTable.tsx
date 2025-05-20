import React from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Loader2, PlayCircle, XCircle, Trash2, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { Playlist, Track } from '../../../types';
import { UseTrackPreviewReturn } from '../hooks/useTrackPreview';

interface PlaylistTracksTableProps {
    playlist: Playlist;
    tracksToDisplay: Track[];
    reorderModeActiveForCurrentPlaylist: boolean;
    onMoveTrack: (trackId: string, direction: 'up' | 'down') => void;
    trackPreviewHook: UseTrackPreviewReturn;
    onFeedbackClick: (playlistId: string, track: Track) => void;
    onRemoveTrack: (playlistId: string, trackId: string, trackTitle: string) => Promise<void>;
}

const PlaylistTracksTable: React.FC<PlaylistTracksTableProps> = ({
    playlist,
    tracksToDisplay,
    reorderModeActiveForCurrentPlaylist,
    onMoveTrack,
    trackPreviewHook,
    onFeedbackClick,
    onRemoveTrack
}) => {
    const { 
        trackPreviewStates, 
        activeTrackFrame, 
        handleLoadPreview, 
        handleToggleTrackFrame, 
        getSpotifyTrackIdFromUri 
    } = trackPreviewHook;

    if (!tracksToDisplay || tracksToDisplay.length === 0) {
        return (
            <div className="text-center p-8 text-card-foreground/80">
                This playlist has no tracks.
            </div>
        );
    }

    const sortedTracksToDisplay = [...tracksToDisplay].sort((a, b) => a.order_in_playlist - b.order_in_playlist);

    return (
        <Table className="table-fixed">
            <TableHeader>
                <TableRow>
                    {reorderModeActiveForCurrentPlaylist && (
                        <TableHead className="w-20 text-card-foreground/80 text-center">Move</TableHead>
                    )}
                    <TableHead className="text-card-foreground/80">Title</TableHead>
                    <TableHead className="text-card-foreground/80">Artist</TableHead>
                    <TableHead className="text-center w-24 text-card-foreground/80">Preview</TableHead>
                    <TableHead className="text-center w-24 text-card-foreground/80">Feedback</TableHead>
                    <TableHead className="text-right w-16 text-card-foreground/80">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedTracksToDisplay.map((track, trackIndex, arr) => {
                        const trackKey = String(track.id);
                        const playlistKey = String(playlist.id);
                        const previewState = trackPreviewStates[playlistKey]?.[trackKey] || { uri: null, loading: false };
                        const spotifyTrackIdForEmbed = getSpotifyTrackIdFromUri(previewState.uri);
                        const isActiveFrame = activeTrackFrame?.playlistId === playlistKey && activeTrackFrame?.trackId === trackKey;

                        return (
                            <React.Fragment key={trackKey}>
                                <TableRow className={isActiveFrame ? "bg-muted/10" : ""}>
                                    {reorderModeActiveForCurrentPlaylist && (
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost" size="icon"
                                                onClick={() => onMoveTrack(trackKey, 'up')}
                                                disabled={trackIndex === 0}
                                                className="disabled:opacity-30 hover:bg-transparent cursor-pointer transition-all duration-300 hover:scale-110"
                                                title="Move Up"
                                            >
                                                <ArrowUpCircle size={18} className="opacity-70 hover:opacity-100 transition-opacity" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                onClick={() => onMoveTrack(trackKey, 'down')}
                                                disabled={trackIndex === arr.length - 1}
                                                className="disabled:opacity-30 hover:bg-transparent cursor-pointer transition-all duration-300 hover:scale-110"
                                                title="Move Down"
                                            >
                                                <ArrowDownCircle size={18} className="opacity-70 hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </TableCell>
                                    )}
                                    <TableCell className="font-medium">{track.title}</TableCell>
                                    <TableCell>{track.artist}</TableCell>
                                    <TableCell className="text-center">
                                        {previewState.loading ? (
                                            <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3">
                                                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                                                <span className="hidden sm:inline">Loading...</span>
                                            </Button>
                                        ) : previewState.uri === undefined ? (
                                            <Badge variant="outline" className="text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-800/50 dark:border-red-700/60 text-xs font-medium">Not Found</Badge>
                                        ) : spotifyTrackIdForEmbed ? (
                                            <span className="inline-flex items-center space-x-1">
                                                <Badge variant="outline" className="text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-800/50 dark:border-green-700/60 text-xs font-medium">Loaded</Badge>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => handleToggleTrackFrame(playlistKey, trackKey)}
                                                    className="h-8 w-8 cursor-pointer transition-all duration-300 hover:scale-110"
                                                    title={isActiveFrame ? "Close Preview" : "Play Preview"}
                                                >
                                                    {isActiveFrame ? <XCircle className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity" /> : <PlayCircle className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity" />}
                                                </Button>
                                            </span>
                                        ) : (
                                            <Button
                                                variant="ghost" size="icon"
                                                onClick={() => handleLoadPreview(playlistKey, track)}
                                                className="h-8 w-8 cursor-pointer transition-all duration-300 hover:scale-110"
                                                title="Load Spotify Preview"
                                            >
                                                <PlayCircle className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity" />
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost" size="icon"
                                            onClick={(e) => { e.stopPropagation(); onFeedbackClick(playlistKey, track); }}
                                            className="text-primary hover:text-primary/80 cursor-pointer transition-all duration-300 hover:scale-110"
                                            aria-label="Give feedback"
                                        >
                                            <Search className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 cursor-pointer transition-all duration-300 hover:scale-110" aria-label="Remove track">
                                                    <Trash2 size={18} className="opacity-70 hover:opacity-100 transition-opacity" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action will remove "{track.title}" by "{track.artist}" from this playlist. This cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onRemoveTrack(playlistKey, trackKey, track.title)}
                                                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                                    >
                                                        Remove
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                                {isActiveFrame && spotifyTrackIdForEmbed && (
                                    <TableRow className="bg-muted/30 hover:bg-muted/40">
                                        <TableCell colSpan={reorderModeActiveForCurrentPlaylist ? 6 : 5} className="p-0">
                                            <iframe
                                                style={{ borderRadius: "12px", border: "none", width: "100%" }}
                                                src={`https://open.spotify.com/embed/track/${spotifyTrackIdForEmbed}?utm_source=generator`}
                                                height="80"
                                                allowFullScreen={false}
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                                title={`Spotify Preview: ${track.title} by ${track.artist}`}
                                            ></iframe>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
            </TableBody>
        </Table>
    );
};

export default PlaylistTracksTable; 