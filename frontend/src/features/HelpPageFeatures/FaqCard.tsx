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
                    <AccordionItem value="item-1" className="border-b-0 mb-2">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-l-4 hover:border-primary rounded-lg px-4 py-3 group data-[state=open]:bg-accent/10">How does facial emotion recognition work?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90 px-4 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                            Our app uses advanced algorithms to analyze facial expressions captured via your device's camera to understand your emotional state. Your camera data is processed locally and not stored unless you explicitly choose to save mood snapshots.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-0 mb-2">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-l-4 hover:border-primary rounded-lg px-4 py-3 group data-[state=open]:bg-accent/10">Can I manually input my mood?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90 px-4 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                            Absolutely! You can always describe your emotional state through text input if you prefer not to use the camera or want to add more context.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-0 mb-2">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-l-4 hover:border-primary rounded-lg px-4 py-3 group data-[state=open]:bg-accent/10">How are my behavioral patterns analyzed?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90 px-4 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                            The app analyzes your listening habits, song ratings, and mood changes in relation to music to better understand your preferences and how music affects you. This helps in personalizing your experience.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-b-0 mb-2">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-l-4 hover:border-primary rounded-lg px-4 py-3 group data-[state=open]:bg-accent/10">How are playlists created and adjusted?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90 px-4 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                            Playlists are dynamically generated based on your current mood (detected or inputted), your past listening history, and your explicit feedback (likes/dislikes). They evolve as your tastes and needs change.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5" className="border-b-0 mb-2">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-l-4 hover:border-primary rounded-lg px-4 py-3 group data-[state=open]:bg-accent/10">What kind of reports can I see?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90 px-4 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                            You can view visualizations of your mood trends over various periods and reports on how different genres or songs correlate with your emotional states.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6" className="border-b-0 mb-2">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-l-4 hover:border-primary rounded-lg px-4 py-3 group data-[state=open]:bg-accent/10">How is my facial data handled?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90 px-4 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                            Facial data (images) are used only temporarily for analysis to determine your current emotion through an external third-party service (OpenAI). Only the analysis result - the textual description of emotion - is stored in our database. According to OpenAI's data usage policy, these image data may be temporarily stored in their systems for monitoring and security purposes for up to 30 days in case of a breach. OpenAI states that data received through their API is not used by default to train their general models or stored in their cloud. For complete transparency, we recommend users to review OpenAI's current <a href="https://openai.com/en-GB/policies/privacy-policy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://openai.com/policies/api-data-usage-policies" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">API Data Usage Policies</a>.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-7" className="border-b-0">
                        <AccordionTrigger className="text-xs font-semibold hover:no-underline cursor-pointer transition-all duration-300 hover:bg-accent/20 hover:border-l-4 hover:border-primary rounded-lg px-4 py-3 group data-[state=open]:bg-accent/10">Is the application safe to use?</AccordionTrigger>
                        <AccordionContent className="text-xs text-card-foreground/90 px-4 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                            Yes, our application is designed with your safety in mind. We do not perform retina scans or collect biometric identifiers beyond facial expressions for emotion detection. Additionally, we do not use any sound frequencies (such as low-frequency sounds around 7Hz) that could potentially affect heart rhythm or cause discomfort. All audio played through our platform adheres to standard safety guidelines for digital media. Your health and safety are our top priorities while using this service.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default FaqCard; 