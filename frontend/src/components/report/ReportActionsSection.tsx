import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Download, FileText, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { exportMoodsToCSV, generateDataPDF } from '@/services/reportGenerator';
import { Mood } from '@/types';
import { MoodCategoryName } from '@/data/moodConfig';

interface MoodDistributionDataItem {
    name: MoodCategoryName;
    value: number;
    fill?: string;
}
interface ChartMoodDataItem {
    timestamp: string;
    energy_level: number;
    mood_text: string;
}
interface AccordionMoodDataItem extends Mood {}


interface ReportActionsSectionProps {
    dateRange?: DateRange;
    setDateRange: (dateRange?: DateRange) => void;
    isLoadingHistory: boolean;
    isLoadingDataPDF: boolean;
    setIsLoadingDataPDF: (loading: boolean) => void;
    filteredMoods: Mood[];
    accordionMoodData: AccordionMoodDataItem[]; 
    chartMoodDataForPdf: ChartMoodDataItem[]; 
    moodDistributionData: MoodDistributionDataItem[]; 
}

const ReportActionsSection: React.FC<ReportActionsSectionProps> = ({
    dateRange,
    setDateRange,
    isLoadingHistory,
    isLoadingDataPDF,
    setIsLoadingDataPDF,
    filteredMoods,
    accordionMoodData,
    chartMoodDataForPdf,
    moodDistributionData
}) => {

    const handleGeneratePDF = async () => {
        if (filteredMoods.length === 0 && !isLoadingHistory) {
            return;
        }
        setIsLoadingDataPDF(true);
        try {
            await generateDataPDF(
                filteredMoods,
                accordionMoodData, 
                chartMoodDataForPdf,
                moodDistributionData, 
                dateRange
            );
        } catch (error) {
        } finally {
            setIsLoadingDataPDF(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredMoods.length === 0 && !isLoadingHistory) {
            return;
        }
        exportMoodsToCSV(filteredMoods, dateRange);
    }

    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-center justify-center pt-4 pb-6 border-t border-border">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full sm:w-[280px] justify-start text-left font-normal cursor-pointer",
                            "bg-background/50 hover:bg-background/70 text-card-foreground transition-all duration-300 hover:scale-105 border border-primary",
                            !dateRange && "text-muted-foreground/80"
                        )}
                        disabled={isLoadingHistory}
                    >
                        <CalendarDays className="mr-2 h-4 w-4 transition-colors duration-300" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background/80 backdrop-blur-sm border-white/20" align="center">
                    <Calendar 
                        initialFocus 
                        mode="range" 
                        defaultMonth={dateRange?.from} 
                        selected={dateRange} 
                        onSelect={setDateRange} 
                        numberOfMonths={2}
                        className="
                            [&_.rdp-day]:cursor-pointer 
                            [&_.rdp-day]:transition-all 
                            [&_.rdp-day]:duration-300 
                            [&_.rdp-day:hover]:scale-110 
                            [&_.rdp-day:hover]:bg-accent/50 
                            [&_.rdp-day:hover]:rounded-md 
                            [&_.rdp-day_button]:cursor-pointer 
                            [&_.rdp-day_button]:transition-all 
                            [&_.rdp-day_button]:duration-300
                            [&_.rdp-day_button:hover]:bg-accent/80 
                            [&_.rdp-day_button:hover]:text-accent-foreground 
                            [&_.rdp-day_button:hover]:scale-110
                            [&_.rdp-day_button:hover]:shadow-sm
                            [&_.rdp-day_button:focus]:bg-accent/80 
                            [&_.rdp-day_button:focus]:text-accent-foreground
                            [&_.rdp-button]:cursor-pointer 
                            [&_.rdp-button]:transition-all 
                            [&_.rdp-button]:duration-300
                            [&_.rdp-button:hover]:bg-accent/50 
                            [&_.rdp-button:hover]:rounded-md
                            [&_.rdp-nav_button]:cursor-pointer
                            [&_.rdp-nav_button]:transition-all
                            [&_.rdp-nav_button]:duration-300
                            [&_.rdp-nav_button:hover]:bg-accent/50
                            [&_.rdp-nav_button:hover]:rounded-md
                            [&_.rdp-day_selected]:bg-primary
                            [&_.rdp-day_selected]:text-primary-foreground
                            [&_.rdp-day_selected]:hover:bg-primary/90
                            [&_.rdp-day_selected]:hover:text-primary-foreground
                        "
                    />
                </PopoverContent>
            </Popover>
            {dateRange && (
                <Button 
                    variant="ghost" 
                    onClick={() => setDateRange(undefined)} 
                    className="w-full sm:w-auto text-card-foreground/80 hover:text-card-foreground cursor-pointer transition-all duration-300 hover:scale-105"
                    disabled={isLoadingHistory}
                >
                    Reset
                </Button>
            )}
            <Button
                variant="outline"
                onClick={handleExportCSV}
                className="w-full sm:w-auto bg-background/50 hover:bg-background/70 text-card-foreground cursor-pointer transition-all duration-300 hover:scale-105 border border-primary"
                disabled={isLoadingHistory || isLoadingDataPDF || filteredMoods.length === 0}
            >
                <Download className="mr-2 h-4 w-4 transition-colors duration-300" />
                Download CSV
            </Button>
            <Button
                variant="outline"
                onClick={handleGeneratePDF}
                className="w-full sm:w-auto bg-background/50 hover:bg-background/70 text-card-foreground cursor-pointer transition-all duration-300 hover:scale-105 border border-primary"
                disabled={isLoadingHistory || isLoadingDataPDF || filteredMoods.length === 0}
            >
                {isLoadingDataPDF ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileText className="mr-2 h-4 w-4 transition-colors duration-300" />
                )}
                Download Report
            </Button>
        </div>
    );
};

export default ReportActionsSection; 