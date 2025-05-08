import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Download, FileText, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { exportMoodsToCSV, generateDataPDF } from '@/services/reportGenerator';
import { Mood } from '@/types'; // For filteredMoods type

// Data types from reportGenerator.ts for clarity (or import them if exported from there)
interface MoodDistributionDataItem {
    name: string; // Assuming MoodCategoryName or string
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
        if (filteredMoods.length === 0 && !isLoadingHistory) { // Check added from original component
            // toast.info("No Data for PDF", { description: "There are no mood entries to include in the PDF." });
            // This toast is now handled inside generateDataPDF itself.
            return;
        }
        setIsLoadingDataPDF(true);
        try {
            // The actual call to generateDataPDF needs the specific data structures it expects.
            // The `useMoodReportData` hook provides chartMoodData, accordionMoodData, moodDistributionData.
            // Ensure these match what generateDataPDF needs or adapt them.
            await generateDataPDF(
                filteredMoods, // Used for initial check in generateDataPDF
                accordionMoodData, 
                chartMoodDataForPdf, // This needs to be `chartMoodData` from the hook, possibly adapting its structure if needed
                moodDistributionData, 
                dateRange
            );
        } catch (error) {
            // Error handling is done within generateDataPDF now, including toasts.
            // console.error("Error in handleGeneratePDF:", error); // Optional: for additional client-side logging
        } finally {
            setIsLoadingDataPDF(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredMoods.length === 0 && !isLoadingHistory) { // Check added from original component
            // toast.info("No Data to Export", { description: "There are no mood entries in the current view to export." });
            // This toast is now handled inside exportMoodsToCSV itself.
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
                            "w-full sm:w-[280px] justify-start text-left font-normal",
                            "bg-background/50 hover:bg-background/70 text-card-foreground",
                            !dateRange && "text-muted-foreground/80"
                        )}
                        disabled={isLoadingHistory} // Disable if history is loading
                    >
                        <CalendarDays className="mr-2 h-4 w-4" />
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
                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                </PopoverContent>
            </Popover>
            {dateRange && (
                <Button 
                    variant="ghost" 
                    onClick={() => setDateRange(undefined)} 
                    className="w-full sm:w-auto text-card-foreground/80 hover:text-card-foreground"
                    disabled={isLoadingHistory} // Disable if history is loading
                >
                    Reset
                </Button>
            )}
            <Button
                variant="outline"
                onClick={handleExportCSV} // Use wrapped handler
                className="w-full sm:w-auto bg-background/50 hover:bg-background/70 text-card-foreground"
                disabled={isLoadingHistory || isLoadingDataPDF || filteredMoods.length === 0}
            >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
            <Button
                variant="outline"
                onClick={handleGeneratePDF} // Use wrapped handler
                className="w-full sm:w-auto bg-background/50 hover:bg-background/70 text-card-foreground"
                disabled={isLoadingHistory || isLoadingDataPDF || filteredMoods.length === 0}
            >
                {isLoadingDataPDF ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileText className="mr-2 h-4 w-4" />
                )}
                Download Report
            </Button>
        </div>
    );
};

export default ReportActionsSection; 