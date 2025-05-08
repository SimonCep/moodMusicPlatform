import React from 'react';
import {
  Card, CardContent, CardDescription, CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Track } from '../types';
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Music2, PlayCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useDiscoveryPlaylists, isToday } from '../hooks/useDiscoveryPlaylists';
import { useDiscoveryPreview } from '../hooks/useDiscoveryPreview';

const DiscoveryPage: React.FC = () => {
  const { playlists, isLoading, error } = useDiscoveryPlaylists();
  const {
    discoveryPreviewStates,
    activePreview,
    handleLoadDiscoveryPreview,
    handleTogglePreview,
    getSpotifyTrackIdFromUri
  } = useDiscoveryPreview(playlists);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <p className="text-lg text-muted-foreground">Loading Discovery Playlists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_0.2)] mb-2">Discover Playlists</h1>
        <p className="text-xl text-gray-200 [text-shadow:_0_1px_3px_rgb(0_0_0_/_0.2)]">
          Explore curated playlists. Tracks are refreshed daily.
        </p>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center p-8 text-card-foreground/80">
          <p>No specialized playlists available at the moment. Check back later!</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {playlists.map((playlist, playlistIndex) => (
            <Card key={playlist.id || playlistIndex} className="glass-card">
              <AccordionItem value={`playlist-${playlist.id || playlistIndex}`} className="border-b-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex flex-col items-start text-left w-full">
                    <div className="flex justify-between w-full items-center">
                        <CardTitle className="text-xl flex items-center">
                            <Music2 className="mr-2 h-5 w-5 text-primary" /> 
                            {playlist.name}
                        </CardTitle>
                        {isToday(playlist.last_refreshed_date) ? (
                            <Badge variant="secondary" className="text-xs ml-2">Refreshed Today</Badge>
                        ) : playlist.last_refreshed_date ? (
                            <Badge variant="outline" className="text-xs ml-2">Last Refreshed: {playlist.last_refreshed_date}</Badge>
                        ) : (
                            <Badge variant="outline" className="text-xs ml-2">Awaiting Tracks</Badge>
                        )}
                    </div>
                    <CardDescription className="text-card-foreground/80 mt-1 text-sm">
                      {playlist.description}
                    </CardDescription>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <CardContent className="px-6 pb-6 pt-0"> 
                    {playlist.cached_tracks && playlist.cached_tracks.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px] text-card-foreground">#</TableHead>
                            <TableHead className="text-card-foreground">Title</TableHead>
                            <TableHead className="text-card-foreground">Artist</TableHead>
                            <TableHead className="w-[100px] text-card-foreground hidden sm:table-cell">Duration</TableHead>
                            <TableHead className="text-right w-[120px] text-card-foreground">Preview</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(playlist.cached_tracks as Track[]).map((track, trackIndex) => {
                            const trackIdFromBackend = track.id != null ? track.id : trackIndex; 
                            const trackKey = String(trackIdFromBackend);
                            const playlistKeyStr = String(playlist.id);

                            const currentTrackPreviewState = discoveryPreviewStates[playlistKeyStr]?.[trackKey] || { uri: null, loading: false };
                            const spotifyTrackIdToEmbed = getSpotifyTrackIdFromUri(currentTrackPreviewState.uri);
                            
                            const isPreviewActive = activePreview?.playlistId === playlist.id && activePreview?.trackKey === trackKey;
                            
                            return (
                              <React.Fragment key={trackKey}>
                                <TableRow className="hover:bg-muted/20">
                                  <TableCell className="font-medium">{trackIndex + 1}</TableCell>
                                  <TableCell>{track.title}</TableCell>
                                  <TableCell>{track.artist}</TableCell>
                                  <TableCell className="hidden sm:table-cell">{track.duration}</TableCell>
                                  <TableCell className="text-right space-x-1 whitespace-nowrap">
                                    {currentTrackPreviewState.loading ? (
                                      <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3">
                                        <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                                        <span className="hidden sm:inline">Loading...</span>
                                      </Button>
                                    ) : currentTrackPreviewState.uri === undefined ? (
                                      <Badge variant="outline" className="text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-800/50 dark:border-red-700/60 text-xs font-medium">Not Found</Badge>
                                    ) : spotifyTrackIdToEmbed ? (
                                      <span className="inline-flex items-center space-x-1">
                                        <Badge variant="outline" className="text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-800/50 dark:border-green-700/60 text-xs font-medium hidden sm:inline">Loaded</Badge>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleTogglePreview(playlist.id, trackKey, spotifyTrackIdToEmbed)}
                                          title={isPreviewActive ? "Close Preview" : "Play Preview"}
                                        >
                                          {isPreviewActive ? (
                                            <XCircle className="h-5 w-5" />
                                          ) : (
                                            <PlayCircle className="h-5 w-5" />
                                          )}
                                        </Button>
                                      </span>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleLoadDiscoveryPreview(playlist.id, trackKey, track.title, track.artist)}
                                        title="Load Spotify Preview"
                                      >
                                        <PlayCircle className="h-5 w-5 opacity-70 hover:opacity-100" />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                                {isPreviewActive && spotifyTrackIdToEmbed && (
                                  <TableRow className="bg-muted/30 hover:bg-muted/40">
                                    <TableCell colSpan={5} className="p-0">
                                      <iframe
                                        style={{ borderRadius: "0 0 8px 8px", border: "none", width: "100%" }}
                                        src={`https://open.spotify.com/embed/track/${spotifyTrackIdToEmbed}?utm_source=generator`}
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
                        <TableCaption className="text-card-foreground/80">
                            {playlist.cached_tracks.length} {playlist.cached_tracks.length === 1 ? "track" : "tracks"}.
                            {!isToday(playlist.last_refreshed_date) && playlist.last_refreshed_date && ` Last updated: ${playlist.last_refreshed_date}.`}
                            {!playlist.last_refreshed_date && " Awaiting first refresh."}
                        </TableCaption>
                      </Table>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground italic">
                        Tracks for this playlist are not yet available or are being refreshed.
                      </div>
                    )}
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default DiscoveryPage; 