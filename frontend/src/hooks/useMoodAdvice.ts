import { useState } from 'react';
import { getEmotionRecommendation } from '@/services/api'; // Assuming api services are in @/services
import { Mood, EmotionRecommendationError } from '@/types';
import { toast } from 'sonner';

export const useMoodAdvice = () => {
    const [selectedMoodIdForAdvice, setSelectedMoodIdForAdvice] = useState<number | null>(null);
    const [advice, setAdvice] = useState<string[] | null>(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    const [errorAdvice, setErrorAdvice] = useState<string | null>(null);

    const handleGetAdvice = async (mood: Mood) => {
        setSelectedMoodIdForAdvice(mood.id);
        setIsLoadingAdvice(true);
        setErrorAdvice(null);
        setAdvice(null);
        try {
            const recommendationData = await getEmotionRecommendation(mood.mood_text);
            if (recommendationData && recommendationData.advice_list && Array.isArray(recommendationData.advice_list)) {
                setAdvice(recommendationData.advice_list);
                toast.success("Advice Generated!", {
                    description: "Here are some tailored recommendations."
                });
            } else {
                console.warn("Recommendation data from backend was incomplete or not an array:", recommendationData);
                throw new Error("Received incomplete or invalid recommendation data.");
            }
        } catch (err: any) {
            console.error("Error fetching emotion recommendation:", err);
            let errorMessage = "Failed to get advice.";
            if (err.response?.data) {
                const errorData = err.response.data as EmotionRecommendationError;
                errorMessage = errorData.error || "An unknown error occurred while fetching advice.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            setErrorAdvice(errorMessage);
            toast.error("Advice Generation Failed", { description: errorMessage });
            setAdvice(null); 
        } finally {
            setIsLoadingAdvice(false);
        }
    };

    return {
        selectedMoodIdForAdvice,
        advice,
        isLoadingAdvice,
        errorAdvice,
        handleGetAdvice,
        // Exposing setSelectedMoodIdForAdvice might be useful if another component needs to reset it
        // or trigger advice display from outside, but for now, let's keep it internal to the hook + handleGetAdvice trigger
        // setSelectedMoodIdForAdvice 
    };
}; 