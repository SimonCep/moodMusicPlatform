import { useState, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { getMoodHistory } from '@/services/api';
import { Mood } from '@/types';
import { toast } from 'sonner';
import { moodCategories, MoodCategoryName } from '@/data/moodConfig';
import { formatDate } from '@/utils/dateUtils';

export const useMoodReportData = () => {
    const [moodHistory, setMoodHistory] = useState<Mood[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [errorHistory, setErrorHistory] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [isLoadingDataPDF, setIsLoadingDataPDF] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            setErrorHistory(null);
            try {
                const history = await getMoodHistory(); 
                setMoodHistory(history);
            } catch (err: any) {
                const errorMessage = err.response?.data?.detail || err.message || "Failed to load mood history.";
                setErrorHistory(errorMessage);
                toast.error("Error Loading History", { description: errorMessage });
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredMoods = useMemo(() => {
        if (!dateRange?.from) {
            return moodHistory;
        }
        const fromDate = dateRange.from;
        const toDate = dateRange.to ? dateRange.to : fromDate;
        return moodHistory.filter(mood => {
            const moodTimestamp = new Date(mood.timestamp);
            const startOfDayFrom = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
            const endOfDayTo = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999);
            return moodTimestamp >= startOfDayFrom && moodTimestamp <= endOfDayTo;
        });
    }, [moodHistory, dateRange]);

    const chartMoodData = useMemo(() => 
        [...filteredMoods].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), 
        [filteredMoods]
    );

    const accordionMoodData = useMemo(() => 
        [...filteredMoods].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
        [filteredMoods]
    );

    const moodDistributionData = useMemo(() => {
        const counts: Record<MoodCategoryName, number> = Object.keys(moodCategories).reduce((acc, key) => {
            acc[key as MoodCategoryName] = 0;
            return acc;
        }, {} as Record<MoodCategoryName, number>); 

        filteredMoods.forEach(mood => {
            const category = mood.category && mood.category in moodCategories ? mood.category as MoodCategoryName : 'Neutral'; 
            counts[category]++;
        });

        return Object.entries(counts)
            .filter(([, value]) => value > 0) 
            .map(([name, value]) => ({
                name: name as MoodCategoryName,
                value,
                fill: moodCategories[name as MoodCategoryName]?.color || moodCategories.Neutral.color 
            }));
    }, [filteredMoods]);

    const totalMoodCountForPie = useMemo(() => {
        return moodDistributionData.reduce((sum, entry) => sum + entry.value, 0);
    }, [moodDistributionData]);

    const chartDisplayData = useMemo(() => 
        chartMoodData.map(mood => ({
            name: formatDate(mood.timestamp, 'short'),
            energyLevel: mood.energy_level,
            fullDate: formatDate(mood.timestamp, 'long'),
            moodText: mood.mood_text,
            timestamp: mood.timestamp
        })),
        [chartMoodData]
    );

    return {
        moodHistory,
        isLoadingHistory,
        errorHistory,
        dateRange,
        setDateRange,
        filteredMoods,
        chartMoodData,
        accordionMoodData,
        moodDistributionData,
        totalMoodCountForPie,
        chartDisplayData,
        isLoadingDataPDF,
        setIsLoadingDataPDF 
    };
}; 