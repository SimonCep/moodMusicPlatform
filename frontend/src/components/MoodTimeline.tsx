import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const mockHistory = [
  { date: "Today, 8:30 AM", mood: "Energetic", tracks: 6 },
  { date: "Yesterday, 8:15 PM", mood: "Relaxed", tracks: 5 },
  { date: "Apr 15, 11:20 AM", mood: "Happy", tracks: 7 },
];

export function MoodTimeline() {
  return (
    <Card className="max-w-md mx-auto mt-8 glass-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Your Mood History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockHistory.map((item, i) => (
            <div key={i} className="relative pl-6 pb-4">
              {i < mockHistory.length - 1 && (
                <div className="absolute top-2 bottom-0 left-2 w-0.5 bg-primary/30" />
              )}
              <div className="absolute top-2 left-0 w-4 h-4 rounded-full bg-primary" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{item.date}</span>
                <span className="font-medium">{item.mood}</span>
                <span className="text-sm">{item.tracks} tracks generated</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
