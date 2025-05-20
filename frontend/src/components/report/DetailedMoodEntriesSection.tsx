import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, MessageSquareWarning } from 'lucide-react';
import { Mood } from '@/types';
import { cn } from "@/lib/utils";
import { useMoodAdvice } from '@/hooks/useMoodAdvice';
import { MoodCategoryName, moodCategories } from '@/data/moodConfig';
import { getMoodSentiment } from '@/utils/moodUtils';
import { formatDate } from '@/utils/dateUtils';
import MoodIcon from '@/components/common/MoodIcon';

interface AccordionMoodDataItem extends Mood {}

interface DetailedMoodEntriesSectionProps {
    accordionMoodData: AccordionMoodDataItem[];
}

const DetailedMoodEntriesSection: React.FC<DetailedMoodEntriesSectionProps> = ({ accordionMoodData }) => {
    const {
        selectedMoodIdForAdvice,
        advice,
        isLoadingAdvice,
        errorAdvice,
        handleGetAdvice
    } = useMoodAdvice();

    if (!accordionMoodData || accordionMoodData.length === 0) {
        return null; 
    }

    return (
        <div>
            <h3 className="text-xl font-semibold mb-6 text-center">Detailed Mood Entries</h3>
            <Accordion type="single" collapsible className="w-full">
                {accordionMoodData.map((mood) => {
                    const categoryName = mood.category && mood.category in moodCategories
                        ? mood.category as MoodCategoryName
                        : 'Neutral';
                    const sentiment = getMoodSentiment(categoryName);
                    let sentimentClasses = 'bg-zinc-50 dark:bg-zinc-800/20';
                    let textClasses = 'text-zinc-700 dark:text-zinc-400';

                    if (categoryName === 'Happy') { sentimentClasses = 'bg-green-50 dark:bg-green-900/30'; textClasses = 'text-green-700 dark:text-green-400'; }
                    else if (categoryName === 'Sad') { sentimentClasses = 'bg-blue-50 dark:bg-blue-900/30'; textClasses = 'text-blue-700 dark:text-blue-400'; }
                    else if (categoryName === 'Angry') { sentimentClasses = 'bg-red-50 dark:bg-red-900/30'; textClasses = 'text-red-700 dark:text-red-400'; }
                    else if (categoryName === 'Calm') { sentimentClasses = 'bg-yellow-50 dark:bg-yellow-900/30'; textClasses = 'text-yellow-700 dark:text-yellow-500'; }
                    else if (categoryName === 'Excited') { sentimentClasses = 'bg-purple-50 dark:bg-purple-900/30'; textClasses = 'text-purple-700 dark:text-purple-400'; }
                    else if (categoryName === 'Anxious') { sentimentClasses = 'bg-gray-100 dark:bg-gray-700/30'; textClasses = 'text-gray-700 dark:text-gray-400'; }
                    else if (categoryName === 'Confident') { sentimentClasses = 'bg-orange-50 dark:bg-orange-900/30'; textClasses = 'text-orange-700 dark:text-orange-400'; }
                    else if (categoryName === 'Lonely') { sentimentClasses = 'bg-blue-100 dark:bg-blue-800/40'; textClasses = 'text-blue-800 dark:text-blue-300'; }
                    else if (categoryName === 'Nostalgic') { sentimentClasses = 'bg-amber-50 dark:bg-amber-900/30'; textClasses = 'text-amber-800 dark:text-amber-400'; }
                    else if (categoryName === 'Romantic') { sentimentClasses = 'bg-pink-50 dark:bg-pink-900/30'; textClasses = 'text-pink-700 dark:text-pink-400'; }

                    return (
                        <AccordionItem value={`mood-${mood.id}`} key={mood.id} className={cn(sentimentClasses, 'rounded-md mb-2 border group cursor-pointer transition-all duration-300 hover:scale-[1.01] relative')}>
                            <AccordionTrigger className="hover:no-underline px-4 py-3 cursor-pointer transition-all duration-300 hover:bg-accent/10 data-[state=open]:bg-accent/5">
                                <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center">
                                    <div className="flex items-center gap-3">
                                        <MoodIcon categoryName={categoryName} className="transition-transform duration-300 group-hover:scale-110 h-5 w-5" />
                                        <p className={cn("font-semibold text-base transition-colors duration-300", textClasses)}>
                                            {mood.mood_text}
                                        </p>
                                    </div>
                                    <div className="text-xs text-card-foreground/70 mt-2 sm:mt-0 text-left sm:text-right">
                                        <p>Energy: {mood.energy_level}/10 | Season: {mood.season}</p>
                                        <p>Logged: {formatDate(mood.timestamp, 'long')}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 overflow-hidden transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                                {sentiment === 'negative' && (
                                    <Button
                                        onClick={() => handleGetAdvice(mood)}
                                        disabled={isLoadingAdvice && selectedMoodIdForAdvice === mood.id}
                                        size="sm"
                                        variant="outline"
                                        className="w-full sm:w-auto cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-primary bg-card/80 hover:bg-card/60 mt-4 mb-2"
                                    >
                                        {isLoadingAdvice && selectedMoodIdForAdvice === mood.id ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Lightbulb className="mr-2 h-4 w-4 transition-colors duration-300" />
                                        )}
                                        Get Tailored Advice for this Mood
                                    </Button>
                                )}
                                {sentiment === 'positive' && (
                                    <div className={cn("text-sm p-3 rounded-md", sentimentClasses, textClasses)}>
                                        <MoodIcon categoryName="Happy" className="inline-block h-5 w-5 mr-2" />
                                        Feeling good! Keep up the positive vibes.
                                    </div>
                                )}
                                {sentiment === 'neutral' && !(isLoadingAdvice && selectedMoodIdForAdvice === mood.id) && (
                                    <div className={cn("text-sm p-3 rounded-md", sentimentClasses, textClasses)}>
                                        <MoodIcon categoryName="Neutral" className="inline-block h-5 w-5 mr-2" />
                                        This mood seems neutral. You can still reflect on your day!
                                    </div>
                                )}

                                {selectedMoodIdForAdvice === mood.id && isLoadingAdvice && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Fetching advice...
                                    </div>
                                )}
                                {selectedMoodIdForAdvice === mood.id && errorAdvice && !isLoadingAdvice && (
                                    <Alert variant="destructive" className="mt-2">
                                        <MessageSquareWarning className="h-4 w-4" />
                                        <AlertTitle>Advice Error</AlertTitle>
                                        <AlertDescription>{errorAdvice}</AlertDescription>
                                    </Alert>
                                )}
                                {selectedMoodIdForAdvice === mood.id && advice && !isLoadingAdvice && !errorAdvice && (
                                    <div className="mt-3 space-y-2 rounded-md border bg-accent/30 p-4">
                                        <h4 className="font-semibold text-accent-foreground">Personalized Recommendations:</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-accent-foreground/90">
                                            {advice.map((rec, index) => (
                                                <li key={index}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    )}
                )}
            </Accordion>
        </div>
    );
};

export default DetailedMoodEntriesSection; 