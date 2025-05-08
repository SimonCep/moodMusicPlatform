import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { BookOpen } from 'lucide-react';

const TutorialCard: React.FC = () => {
    return (
        <Card className="glass-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <BookOpen className="h-4 w-4 text-card-foreground/80" />
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="text-lg font-bold text-card-foreground">Getting Started</div>
                <p className="text-sm text-card-foreground/80">
                    Learn how to use the app features to enhance your emotional well-being through music.
                </p>
                <ul className="space-y-4 pt-2">
                    <li>
                        <h4 className="text-sm font-semibold text-card-foreground mb-1">Facial Emotion Recognition:</h4>
                        <p className="text-xs text-card-foreground/80">Allow the app to access your camera to detect your mood, or input it manually via text.</p>
                    </li>
                    <li>
                        <h4 className="text-sm font-semibold text-card-foreground mb-1">Behavioral Analysis:</h4>
                        <p className="text-xs text-card-foreground/80">The app learns your preferences over time to suggest music that resonates with you.</p>
                    </li>
                    <li>
                        <h4 className="text-sm font-semibold text-card-foreground mb-1">Dynamic Playlists:</h4>
                        <p className="text-xs text-card-foreground/80">Enjoy playlists that are automatically created and adjusted based on your current mood and feedback.</p>
                    </li>
                    <li>
                        <h4 className="text-sm font-semibold text-card-foreground mb-1">Mood Tracking & Reports:</h4>
                        <p className="text-xs text-card-foreground/80">Visualize your mood history and understand the emotional impact of music.</p>
                    </li>
                    <li>
                        <h4 className="text-sm font-semibold text-card-foreground mb-1">Goal-Oriented Playlists:</h4>
                        <p className="text-xs text-card-foreground/80">Use specialized playlists designed for focus, relaxation, exercise, and more.</p>
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
};

export default TutorialCard; 