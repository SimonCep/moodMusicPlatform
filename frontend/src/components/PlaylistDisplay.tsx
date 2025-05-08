// components/PlaylistDisplay.tsx
import React from 'react';
import { Playlist } from '../types';
// Fix imports to use relative paths
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";

interface PlaylistDisplayProps {
  playlist: Playlist | null;
}

const PlaylistDisplay: React.FC<PlaylistDisplayProps> = ({ playlist }) => {
  if (!playlist) return null;

  return (
    <Card className="max-w-4xl mx-auto my-8 glass-card">
      <CardHeader>
        <CardTitle className="text-2xl">Your Personalized Playlist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {playlist.tracks.map((track, index) => (
          <React.Fragment key={track.id || index}>
            {index > 0 && <Separator className="my-2" />}
            <div className="flex items-center py-2 transition-all duration-300 hover:translate-x-1 hover:bg-primary/10 rounded-md px-2">
              <Avatar className="h-10 w-10 mr-4 flex items-center justify-center bg-primary/10">
                <AvatarFallback>{index + 1}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h3 className="font-medium">{track.title}</h3>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
              </div>
              <div className="text-muted-foreground text-sm">{track.duration}</div>
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlaylistDisplay;
