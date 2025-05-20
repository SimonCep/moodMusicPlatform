import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

const addSongSchema = z.object({
    title: z.string().min(1, "Song title is required"),
    artist: z.string().min(1, "Artist name is required"),
});

type AddSongFormValues = z.infer<typeof addSongSchema>;

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
    const form = useForm<AddSongFormValues>({
        resolver: zodResolver(addSongSchema),
        defaultValues: {
            title: title,
            artist: artist,
        },
    });

    const handleSubmit = async (data: AddSongFormValues) => {
        onTitleChange(data.title);
        onArtistChange(data.artist);
        await onSubmit();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-card">
                <DialogHeader>
                    <DialogTitle>Add Song to Playlist</DialogTitle>
                    <DialogDescription className="text-card-foreground/80">
                        Enter the title and artist of the song you want to add.
                        We'll try to find it on Spotify and add it to your playlist.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-card-foreground">Song Title</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Enter song title" 
                                            {...field} 
                                            className="bg-input/50 text-card-foreground"
                                            disabled={isFinding}
                                            value={title}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                onTitleChange(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive font-medium" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="artist"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-card-foreground">Artist Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Enter artist name" 
                                            {...field} 
                                            className="bg-input/50 text-card-foreground"
                                            disabled={isFinding}
                                            value={artist}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                onArtistChange(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive font-medium" />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    disabled={isFinding}
                                    className="bg-card/80 hover:bg-card/60 cursor-pointer transition-all duration-300 hover:scale-105 border border-primary"
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button 
                                type="submit" 
                                disabled={isFinding} 
                                className="bg-primary/90 hover:bg-primary cursor-pointer transition-all duration-300 hover:scale-105 border border-primary"
                            >
                                {isFinding ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Finding Song...
                                    </>
                                ) : (
                                    'Add Song'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddSongDialog; 