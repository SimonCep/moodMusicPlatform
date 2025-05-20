import React from 'react';
import FaceScanPopup from '../components/FaceScanPopup';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { genreOptions } from '../data/genres';
import { GenreSelector } from '../components/mood/GenreSelector';
import { useMoodForm } from '../hooks/useMoodForm';

const MoodPage: React.FC = () => {
    const {
        values,
        handlers,
    } = useMoodForm();

    const {
        moodInput,
        detectedEmotion,
        energyLevel,
        genreOpen,
        genreValue,
        songCount,
        playlistGoal,
        isLoadingPlaylist,
        showFaceScanPopup,
    } = values;

    const {
        setMoodInput,
        setEnergyLevel,
        setGenreOpen,
        setGenreValue,
        setSongCount,
        setPlaylistGoal,
        handleScanFaceClick,
        handleClosePopup,
        handleEmotionFromScan,
        handleSubmitMood,
    } = handlers;

    const { isLoading: isAuthContextLoading } = useAuth();

    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-lg glass-card text-card-foreground">
                <CardHeader>
                    <CardTitle>Mood Check-in</CardTitle>
                    <CardDescription className="text-card-foreground/80">
                        {detectedEmotion 
                            ? "Review your scanned emotion, or adjust other details below."
                            : "Log your mood, energy, preferred genre, and desired playlist length."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!detectedEmotion && (
                        <div>
                            <Label htmlFor="mood-input">How are you feeling?</Label>
                            <Input 
                                id="mood-input" 
                                placeholder="e.g., Happy, Energetic, Calm... or use Face Scan" 
                                className="bg-input/50 cursor-pointer" 
                                value={moodInput}
                                onChange={(e) => setMoodInput(e.target.value)}
                            />
                        </div>
                    )}
                    
                    {detectedEmotion && (
                        <div className="mt-0">
                            <Label htmlFor="detected-emotion-input">Detected Emotion (from Face Scan)</Label>
                            <Input 
                                id="detected-emotion-input" 
                                value={detectedEmotion}
                                readOnly
                                className="bg-muted/70 border-dashed text-card-foreground/90" 
                            />
                        </div>
                    )}
                    <div>
                        <Label htmlFor="playlist-goal">Playlist Goal (Optional)</Label>
                        <Textarea 
                            id="playlist-goal" 
                            placeholder="e.g., For a focused work session, for a relaxing evening..." 
                            className="bg-input/50 resize-none h-24 border-primary cursor-pointer" 
                            value={playlistGoal}
                            onChange={(e) => setPlaylistGoal(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="energy-level">Energy Level ({energyLevel[0]}/10)</Label>
                        <Slider 
                            id="energy-level"
                            min={0}
                            max={10}
                            step={1}
                            value={energyLevel}
                            onValueChange={setEnergyLevel}
                            className="pt-2 cursor-pointer"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="song-count">Number of Songs ({songCount[0]})</Label>
                        <Slider 
                            id="song-count"
                            min={5}
                            max={15}
                            step={1}
                            value={songCount}
                            onValueChange={setSongCount}
                            className="pt-2 cursor-pointer"
                        />
                     </div>
                     <div className="space-y-1.5">
                         <Label>Preferred Genre</Label>
                         <GenreSelector 
                            genreOptions={genreOptions}
                            genreValue={genreValue}
                            setGenreValue={setGenreValue}
                            genreOpen={genreOpen}
                            setGenreOpen={setGenreOpen}
                         />
                     </div>
                     <div className="text-center pt-4">
                        <Button 
                            variant="outline" 
                            className="w-full sm:w-auto border-primary bg-card/80 hover:bg-primary/10 cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden group" 
                            onClick={handleScanFaceClick} 
                            disabled={!!detectedEmotion}
                        >
                            <span className="absolute inset-0 bg-primary/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            <Camera className="mr-2 h-4 w-4 relative z-10 text-primary" /> 
                            <span className="relative z-10 text-primary">{detectedEmotion ? "Face Scan Used" : "Or Scan Your Face"}</span>
                        </Button>
                     </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center gap-2">
                     <Button 
                        variant="outline"
                        className="w-full sm:w-auto border-primary hover:bg-primary/10 cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                        onClick={handleSubmitMood} 
                        disabled={isLoadingPlaylist || isAuthContextLoading}
                    >
                        <span className="absolute inset-0 bg-primary/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                        <span className="relative z-10">
                            {isLoadingPlaylist ? 'Generating Playlist...' : 'Generate Playlist'}
                        </span>
                    </Button>
                </CardFooter>
            </Card>

            <FaceScanPopup 
                open={showFaceScanPopup} 
                onClose={handleClosePopup} 
                onEmotionDetected={handleEmotionFromScan}
            />
        </div>
    );
};

export default MoodPage;