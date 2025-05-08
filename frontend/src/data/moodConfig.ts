// Define categories and colors
export const moodCategories = {
    Happy: { keywords: [], color: "#22c55e" }, 
    Sad: { keywords: [], color: "#3b82f6" }, 
    Angry: { keywords: [], color: "#ef4444" }, 
    Calm: { keywords: [], color: "#f59e0b" }, 
    Excited: { keywords: [], color: "#8b5cf6" }, 
    Anxious: { keywords: [], color: "#6b7280" }, 
    Confident: { keywords: [], color: "#f97316" }, 
    Lonely: { keywords: [], color: "#1e3a8a" }, 
    Nostalgic: { keywords: [], color: "#78350f" }, 
    Romantic: { keywords: [], color: "#ec4899" }, 
    Neutral: { keywords: [], color: "#a1a1aa" }
};

// Correct the type to include 'Other' instead of 'Other'
export type MoodCategoryName = keyof typeof moodCategories; // This now correctly includes "Other" 