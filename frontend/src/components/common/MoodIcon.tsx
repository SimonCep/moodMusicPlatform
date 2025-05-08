import React from 'react';
import { cn } from "@/lib/utils";
import {
    Smile, Frown, Meh, 
    Angry as AngryIcon, 
    Coffee as CalmIcon,
    Sparkles as ExcitedIcon,
    AlertTriangle as AnxiousIcon,
    ShieldCheck as ConfidentIcon,
    Users as LonelyIcon, 
    Clock as NostalgicIcon,
    Heart as RomanticIcon
} from 'lucide-react'; 
import { moodCategories, MoodCategoryName } from '@/data/moodConfig';

interface MoodIconProps {
    categoryName: string | undefined;
    className?: string;
}

const MoodIcon: React.FC<MoodIconProps> = ({ categoryName, className = "h-5 w-5 mr-2" }) => {
    const validCategory = categoryName && categoryName in moodCategories ? categoryName as MoodCategoryName : 'Neutral';
    switch (validCategory) {
        case "Happy": return <Smile className={cn(className, "text-green-500")} />;
        case "Sad": return <Frown className={cn(className, "text-blue-500")} />;
        case "Angry": return <AngryIcon className={cn(className, "text-red-500")} />;
        case "Calm": return <CalmIcon className={cn(className, "text-yellow-600")} />;
        case "Excited": return <ExcitedIcon className={cn(className, "text-purple-500")} />;
        case "Anxious": return <AnxiousIcon className={cn(className, "text-gray-500")} />;
        case "Confident": return <ConfidentIcon className={cn(className, "text-orange-500")} />;
        case "Lonely": return <LonelyIcon className={cn(className, "text-blue-800")} />;
        case "Nostalgic": return <NostalgicIcon className={cn(className, "text-amber-800")} />;
        case "Romantic": return <RomanticIcon className={cn(className, "text-pink-500")} />;
        case "Neutral":
        default: return <Meh className={cn(className, "text-zinc-500")} />;
    }
};

export default MoodIcon; 