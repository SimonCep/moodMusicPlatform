import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const FaqCard: React.FC = () => {
    return (
        <Card className="glass-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <HelpCircle className="h-4 w-4 text-card-foreground/80" />
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="text-lg font-bold text-card-foreground">Frequently Asked Questions</div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline">How does facial emotion recognition work?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90">
                            Our app uses advanced algorithms to analyze facial expressions captured via your device's camera to understand your emotional state. Your camera data is processed locally and not stored unless you explicitly choose to save mood snapshots.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline">Can I manually input my mood?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90">
                            Absolutely! You can always describe your emotional state through text input if you prefer not to use the camera or want to add more context.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline">How are my behavioral patterns analyzed?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90">
                            The app analyzes your listening habits, song ratings, and mood changes in relation to music to better understand your preferences and how music affects you. This helps in personalizing your experience.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline">How are playlists created and adjusted?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90">
                            Playlists are dynamically generated based on your current mood (detected or inputted), your past listening history, and your explicit feedback (likes/dislikes). They evolve as your tastes and needs change.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline">What kind of reports can I see?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90">
                            You can view visualizations of your mood trends over various periods and reports on how different genres or songs correlate with your emotional states.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline">Is my data private?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90">
                            We are committed to protecting your privacy. Please refer to our Privacy Policy for detailed information on how we collect, use, and protect your data.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default FaqCard; 