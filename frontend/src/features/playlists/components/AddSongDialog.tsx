import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';

interface AddSongDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onTitleChange: (title: string) => void;
    artist: string;
    onArtistChange: (artist: string) => void;
    onSubmit: () => Promise<void>;
    isFinding: boolean;
}

const AddSongDialog: React.FC<AddSongDialogProps> = ({
    open,
    onOpenChange,
    title,
    onTitleChange,
    artist,
    onArtistChange,
    onSubmit,
    isFinding
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Song to Playlist</DialogTitle>
                    <DialogDescription>
                        Enter the title and artist of the song you want to add.
                        We'll try to find it on Spotify and add it to your playlist.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="song-title-input" className="text-right">
                            Title
                        </label>
                        <Input
                            id="song-title-input"
                            placeholder="Song title"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            className="col-span-3"
                            disabled={isFinding}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="song-artist-input" className="text-right">
                            Artist
                        </label>
                        <Input
                            id="song-artist-input"
                            placeholder="Artist name"
                            value={artist}
                            onChange={(e) => onArtistChange(e.target.value)}
                            className="col-span-3"
                            disabled={isFinding}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isFinding}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={onSubmit} disabled={isFinding || !title.trim() || !artist.trim()}>
                        {isFinding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Add Song
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddSongDialog; 