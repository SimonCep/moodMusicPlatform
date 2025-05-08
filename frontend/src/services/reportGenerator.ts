import { Mood } from '@/types';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { formatDate } from '@/utils/dateUtils'; // Already created
import { MoodCategoryName, moodCategories } from '@/data/moodConfig'; // Already created

// Data types expected by the PDF generator for its sections
interface MoodDistributionDataItem {
    name: MoodCategoryName;
    value: number;
    fill?: string; // Color for the mood category
}

interface ChartMoodDataItem {
    timestamp: string; // Keep original timestamp for sorting
    energy_level: number;
    mood_text: string; // For PDF content
    // name: string; // Formatted date for x-axis in chart - not directly needed in PDF in this format
    // fullDate: string; // Formatted date for tooltip - not directly needed in PDF in this format
}

interface AccordionMoodDataItem extends Mood {
    // Extends the base Mood type, which includes id, mood_text, energy_level, timestamp, category, season
}


export const exportMoodsToCSV = (filteredMoods: Mood[], dateRange?: DateRange) => {
    if (filteredMoods.length === 0) {
        toast.info("No Data to Export", { description: "There are no mood entries in the current view to export." });
        return;
    }

    const headers = ["Timestamp", "Mood Text", "Category", "Energy Level", "Season"];
    const rows = filteredMoods.map(mood => [
        formatDate(mood.timestamp, 'long'),
        `"${mood.mood_text.replace(/"/g, '""')}"`, // Corrected double quote escaping
        mood.category || 'N/A',
        mood.energy_level,
        mood.season || 'N/A'
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    let fileName = "mood_report";
    if (dateRange?.from) {
        fileName += `_${format(dateRange.from, "yyyy-MM-dd")}`;
        if (dateRange.to) {
            fileName += `_to_${format(dateRange.to, "yyyy-MM-dd")}`;
        }
    }
    fileName += ".csv";

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report Downloaded", { description: `Successfully exported ${filteredMoods.length} mood entries.` });
};

export const generateDataPDF = async (
    filteredMoods: Mood[], // Used for checking if data exists
    accordionMoodData: AccordionMoodDataItem[], // For detailed entries
    chartMoodDataForPdf: ChartMoodDataItem[], // For energy log, ensure this is sorted by timestamp if needed by PDF
    moodDistributionData: MoodDistributionDataItem[], // For summary
    dateRange?: DateRange,
    // setIsLoadingDataPDF: (loading: boolean) => void // Caller handles this
) => {
    if (filteredMoods.length === 0) {
        toast.info("No Data for PDF", { description: "There are no mood entries to include in the PDF." });
        return;
    }
    // setIsLoadingDataPDF(true); // Caller should set this before calling
    toast.info("Generating PDF Report...", { description: "This may take a moment." });

    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const usableWidth = pageWidth - 2 * margin;
        let currentY = margin;

        const primaryAccentColor = '#007bff';
        const headerColor = '#343a40';
        const bodyTextColor = '#212529';
        const metadataTextColor = '#6c757d';
        const lineColor = '#ced4da';

        const lineHeightSuperTitle = 10;
        const lineHeightHeader = 7;
        const lineHeightBody = 6;
        const lineHeightSmall = 5;

        const sectionSpacing = 10;
        const itemSpacing = 3;
        const paragraphSpacing = 4;

        let currentPage = 1;
        const drawPageNumber = () => {
            const pageNumText = `Page ${currentPage}`;
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(metadataTextColor);
            pdf.text(pageNumText, pageWidth / 2, pageHeight - margin / 2, { align: 'center' });
        };

        const checkAndAddPage = (neededHeight: number = lineHeightBody) => {
            if (currentY + neededHeight > pageHeight - margin - (margin / 2)) {
                drawPageNumber();
                pdf.addPage();
                currentPage++;
                currentY = margin;
                return true;
            }
            return false;
        };

        const drawHorizontalLine = (yPosition: number, color: string = lineColor, thickness: number = 0.2) => {
            pdf.setDrawColor(color);
            pdf.setLineWidth(thickness);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        };

        checkAndAddPage(lineHeightSuperTitle + lineHeightBody * 2);
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(primaryAccentColor);
        pdf.text("Mood & Emotional Impact Report", pageWidth / 2, currentY, { align: 'center' });
        currentY += lineHeightSuperTitle;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(bodyTextColor);
        const descriptionLines = pdf.splitTextToSize("A comprehensive overview of your recorded moods, energy levels, and emotional patterns.", usableWidth);
        pdf.text(descriptionLines, pageWidth / 2, currentY, { align: 'center' });
        currentY += descriptionLines.length * lineHeightBody + itemSpacing;

        if (dateRange?.from) {
            checkAndAddPage();
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(metadataTextColor);
            let dateStr = `Report Period: ${format(dateRange.from, "MMMM dd, yyyy")}`;
            if (dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime()) {
                dateStr += ` - ${format(dateRange.to, "MMMM dd, yyyy")}`;
            }
            pdf.text(dateStr, pageWidth / 2, currentY, { align: 'center' });
            currentY += lineHeightSmall * 1.5;
        }
        currentY += itemSpacing;
        drawHorizontalLine(currentY, primaryAccentColor, 0.4);
        currentY += sectionSpacing * 0.75;

        if (moodDistributionData.length > 0) {
            checkAndAddPage(lineHeightHeader + lineHeightBody);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(headerColor);
            pdf.text("Mood Distribution Summary", margin, currentY);
            currentY += lineHeightHeader;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(bodyTextColor);
            moodDistributionData.forEach(moodData => {
                checkAndAddPage(lineHeightBody);
                pdf.text(`•  ${moodData.name}: ${moodData.value} entr${moodData.value === 1 ? 'y' : 'ies'}`, margin + 5, currentY);
                currentY += lineHeightBody;
            });
            currentY += sectionSpacing * 0.75;
            drawHorizontalLine(currentY, lineColor, 0.2);
            currentY += sectionSpacing * 0.75;
        }

        if (chartMoodDataForPdf.length > 0) {
            checkAndAddPage(lineHeightHeader + lineHeightBody);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(headerColor);
            pdf.text("Energy Levels Log", margin, currentY);
            currentY += lineHeightHeader;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(bodyTextColor);
            // Assuming chartMoodDataForPdf is already sorted by timestamp ASC as it was in original ReportPage
            chartMoodDataForPdf.forEach(mood => {
                checkAndAddPage(lineHeightBody);
                // Use formatDate utility for consistency
                pdf.text(`•  ${formatDate(mood.timestamp, 'short')}: Energy Level ${mood.energy_level}/10`, margin + 5, currentY);
                currentY += lineHeightBody;
            });
            currentY += sectionSpacing * 0.75;
            drawHorizontalLine(currentY, lineColor, 0.2);
            currentY += sectionSpacing * 0.75;
        }

        checkAndAddPage(lineHeightHeader);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(headerColor);
        pdf.text("Detailed Mood Entries", margin, currentY);
        currentY += lineHeightHeader;

        // Assuming accordionMoodData is sorted by timestamp DESC as it was in original ReportPage
        accordionMoodData.forEach((mood) => {
            currentY += itemSpacing * 1.5;
            checkAndAddPage(lineHeightSmall * 2 + lineHeightBody * 2 + paragraphSpacing);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(metadataTextColor);
            pdf.text(formatDate(mood.timestamp, 'long'), margin, currentY);
            currentY += lineHeightSmall * 1.2;

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(bodyTextColor);
            const moodTextLines = pdf.splitTextToSize(mood.mood_text, usableWidth);
            pdf.text(moodTextLines, margin, currentY);
            currentY += moodTextLines.length * lineHeightBody + paragraphSpacing / 2;

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(metadataTextColor);
            pdf.text(`Category: ${mood.category || 'N/A'}  |  Energy: ${mood.energy_level}/10  |  Season: ${mood.season || 'N/A'}`, margin, currentY);
            currentY += lineHeightSmall * 1.5;
        });
        currentY += sectionSpacing * 0.75;
        drawHorizontalLine(currentY, lineColor, 0.2);
        currentY += sectionSpacing * 0.75;

        checkAndAddPage(lineHeightHeader + lineHeightSmall * 3);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(headerColor);
        pdf.text("Note on Mood Classification", margin, currentY);
        currentY += lineHeightHeader * 0.8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(bodyTextColor);
        const noteLines = pdf.splitTextToSize("The mood classification used in this platform is extended from Robert Plutchik's Wheel of Emotions, adapted to include modern blended emotions like nostalgia, confidence, and calm to better represent user experiences in a musical context.", usableWidth);
        pdf.text(noteLines, margin, currentY);
        currentY += noteLines.length * lineHeightBody + sectionSpacing;

        checkAndAddPage(lineHeightBody * 2);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(metadataTextColor);
        const conclusionLines = pdf.splitTextToSize("This report helps you track your emotional well-being over time.", usableWidth);
        pdf.text(conclusionLines, pageWidth / 2, currentY, { align: 'center' });
        currentY += conclusionLines.length * lineHeightBody;

        drawPageNumber();

        let fileName = "mood_report";
        if (dateRange?.from) {
            fileName += `_${format(dateRange.from, "yyyy-MM-dd")}`;
            if (dateRange.to) {
                fileName += `_to_${format(dateRange.to, "yyyy-MM-dd")}`;
            }
        }
        pdf.save(`${fileName}.pdf`);
        toast.success("Report PDF Generated", { description: `Successfully exported report to ${fileName}.pdf` });

    } catch (error: any) {
        console.error("Error generating data PDF:", error);
        toast.error("PDF Generation Failed", {
            description: error?.message || "An unexpected error occurred. See console for details."
        });
    } finally {
        // setIsLoadingDataPDF(false); // Caller handles this after the async operation completes
    }
}; 