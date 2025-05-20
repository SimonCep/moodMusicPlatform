import { MoodCategoryName } from '@/data/moodConfig';

export const getMoodSentiment = (categoryName: MoodCategoryName): 'positive' | 'negative' | 'neutral' => {
    if (["Happy", "Excited", "Confident", "Romantic", "Calm"].includes(categoryName)) return 'positive';
    if (["Sad", "Angry", "Anxious", "Lonely"].includes(categoryName)) return 'negative';
    return 'neutral';
}; 