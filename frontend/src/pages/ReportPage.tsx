import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Loader2, MessageSquareWarning, ListChecks
} from 'lucide-react';

// Hooks
import { useMoodReportData } from '@/hooks/useMoodReportData';

// Section Components
import ReportHeaderSection from '@/components/report/ReportHeaderSection';
import MoodDistributionSection from '@/components/report/MoodDistributionSection';
import EnergyLevelsSection from '@/components/report/EnergyLevelsSection';
import DetailedMoodEntriesSection from '@/components/report/DetailedMoodEntriesSection';
import ReportActionsSection from '@/components/report/ReportActionsSection';

const ReportPage: React.FC = () => {
  const {
    isLoadingHistory,
    errorHistory,
    dateRange,
    setDateRange,
    filteredMoods,
    chartMoodData,      // Raw data for PDF
    accordionMoodData,  // Raw data for Detailed Entries & PDF
    moodDistributionData, // Data for Pie Chart & PDF
    totalMoodCountForPie, // For Pie Chart tooltip
    chartDisplayData,   // Formatted data for Line Chart
    isLoadingDataPDF,
    setIsLoadingDataPDF
  } = useMoodReportData();

  return (
    <div className="flex justify-center py-8 px-4">
        <Card className="w-full max-w-3xl glass-card text-card-foreground">
            <ReportHeaderSection />

            <CardContent className="space-y-8">
                {isLoadingHistory && (
                    <div className="flex items-center justify-center p-10">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="ml-4 text-lg">Loading mood history...</p>
                    </div>
                )}

                {errorHistory && !isLoadingHistory && (
                    <Alert variant="destructive">
                        <MessageSquareWarning className="h-5 w-5" />
                        <AlertTitle>Error Loading History</AlertTitle>
                        <AlertDescription>{errorHistory}</AlertDescription>
                    </Alert>
                )}

                {!isLoadingHistory && !errorHistory && (
                    <>
                        {filteredMoods.length === 0 ? (
                            <Alert>
                                <ListChecks className="h-5 w-5" />
                                <AlertTitle>No Mood History</AlertTitle>
                                <AlertDescription>
                                    {dateRange?.from ? "No mood entries found for the selected date range." : "You haven't logged any moods yet. Go to the Mood Check-in page to get started!"}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-8 mb-8 justify-items-center">
                                    <MoodDistributionSection
                                        moodDistributionData={moodDistributionData}
                                        totalMoodCountForPie={totalMoodCountForPie}
                                    />
                                    <EnergyLevelsSection
                                        chartDisplayData={chartDisplayData}
                                        hasEnoughDataForChart={chartMoodData.length >= 2}
                                    />
                                </div>

                                <div className="text-xs text-card-foreground/80 text-center mt-4 p-3 border-t border-border">
                                    <p><strong>Note:</strong> The mood classification used in this platform is extended from Robert Plutchik's Wheel of Emotions, adapted to include modern blended emotions like nostalgia, confidence, and calm to better represent user experiences in a musical context.</p>
                                </div>

                                <DetailedMoodEntriesSection accordionMoodData={accordionMoodData} />

                                <div className="text-xs text-card-foreground/70 text-center mt-6">
                                    <p>This report helps you track your emotional well-being over time.</p>
                                </div>
                            </>
                        )}
                    </>
                )}
            </CardContent>

            {/* Render actions section if no history fetch error */}
            {!errorHistory && (
                 <ReportActionsSection
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    isLoadingHistory={isLoadingHistory}
                    isLoadingDataPDF={isLoadingDataPDF}
                    setIsLoadingDataPDF={setIsLoadingDataPDF}
                    filteredMoods={filteredMoods}
                    accordionMoodData={accordionMoodData}
                    chartMoodDataForPdf={chartMoodData} // Pass the original chartMoodData for PDF
                    moodDistributionData={moodDistributionData}
                />
            )}

            <CardFooter className="text-xs text-card-foreground/70">
                {/* Footer content can be added here if needed in the future */}
            </CardFooter>
        </Card>
    </div>
  );
};

export default ReportPage;