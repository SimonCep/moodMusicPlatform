import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Textarea } from "../components/ui/textarea";
import GenreSelector from './GenreSelector';

interface MoodInputProps {
  onSubmit: (moodText: string, energyLevel: number, genre: string) => void;
  isLoading: boolean;
}

const MoodInput: React.FC<MoodInputProps> = ({ onSubmit, isLoading }) => {
  const [moodText, setMoodText] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [selectedGenre, setSelectedGenre] = useState('pop'); // Default genre

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodText.trim()) {
      onSubmit(moodText, energyLevel, selectedGenre);
    }
  };

  return (
    <Card className="max-w-md mx-auto glass-card">
      <CardHeader>
        <CardTitle className="text-xl text-center">How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your mood..."
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              className="min-h-[120px]"
              required
            />

            <GenreSelector
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
            />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Energy Level: {energyLevel}</span>
                <span className="text-muted-foreground">{energyLevel}/10</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[energyLevel]}
                onValueChange={(value) => setEnergyLevel(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading}
            variant={isLoading ? "outline" : "default"}
          >
            {isLoading ? 'Generating Playlist...' : 'Generate My Playlist'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MoodInput;
