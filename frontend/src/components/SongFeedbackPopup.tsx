import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SongFeedbackPopupProps {
  open: boolean;
  trackTitle: string;
  trackArtist: string;
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
}

const SongFeedbackPopup: React.FC<SongFeedbackPopupProps> = ({ 
    open, 
    trackTitle, 
    trackArtist, 
    onSubmit, 
    onCancel 
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (open) {
        setRating(0);
        setComment("");
    } else {
         // Optional: Delay reset slightly if needed for animations
         // setTimeout(() => {
         //   setRating(0);
         //   setComment("");
         // }, 150);
    }
  }, [open]);

  const handleRating = (rateValue: number) => {
    setRating(rateValue);
  };

  const handleSubmit = () => {
    if (rating === 0) {
        console.warn("Rating is required to submit feedback.");
        return; 
    }
    onSubmit(rating, comment);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px] glass-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Feedback for "{trackTitle}"</DialogTitle>
          <DialogDescription className="text-card-foreground/80">
            By {trackArtist}. Please rate the song and leave an optional comment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">
              Rating
            </Label>
            <div className="col-span-3 flex space-x-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star 
                        key={starValue}
                        className={cn(
                            "h-6 w-6 cursor-pointer transition-colors",
                            starValue <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground hover:text-yellow-300"
                        )}
                        onClick={() => handleRating(starValue)}
                    />
                ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              Comment
            </Label>
            <Textarea
              id="comment"
              placeholder="Why this rating? (e.g., doesn't fit mood, too slow...)"
              className="col-span-3 bg-input/50"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={rating === 0}>
                Submit Feedback
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SongFeedbackPopup; 