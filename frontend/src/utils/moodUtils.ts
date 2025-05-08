import { MoodCategoryName } from '@/data/moodConfig';

// Simplified getMoodSentiment - Now uses category from backend
export const getMoodSentiment = (categoryName: MoodCategoryName): 'positive' | 'negative' | 'neutral' => {
    // No change needed here, as MoodCategoryName is now correct
    if (["Happy", "Excited", "Confident", "Romantic", "Calm"].includes(categoryName)) return 'positive';
    if (["Sad", "Angry", "Anxious", "Lonely"].includes(categoryName)) return 'negative';
    return 'neutral';
}; 