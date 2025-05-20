import { useState } from 'react';
import { getEmotionRecommendation } from '@/services/api';
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
                throw new Error("Received incomplete or invalid recommendation data.");
            }
        } catch (err: any) {
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
    };
}; 