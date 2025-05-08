import React, { useState } from 'react';
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
    Legend as PieLegend, Sector
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart as PieChartIcon } from 'lucide-react';
import { MoodCategoryName } from '@/data/moodConfig';

interface MoodDistributionDataItem {
    name: MoodCategoryName;
    value: number;
    fill: string;
}

interface MoodDistributionSectionProps {
    moodDistributionData: MoodDistributionDataItem[];
    totalMoodCountForPie: number;
}

// Custom active shape for Pie chart (internalized)
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g style={{ outline: 'none' }} tabIndex={-1}>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 2} // Slight expansion on hover
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="none"
                style={{ outline: 'none' }}
            />
        </g>
    );
};

// Custom Tooltip for Pie Chart (internalized)
const renderCustomPieTooltip = ({ active, payload }: any, totalMoodCount: number) => {
    if (active && payload && payload.length && totalMoodCount > 0) {
        const dataPoint = payload[0].payload; // The actual data object {name, value, fill}
        const value = dataPoint.value;
        const name = dataPoint.name;
        const percent = totalMoodCount > 0 ? (value / totalMoodCount * 100).toFixed(0) : 0;
        return (
            <div className="p-2 bg-popover text-popover-foreground border border-border rounded-md shadow-sm text-sm">
                <p>{`${name}: ${value} (${percent}%)`}</p>
            </div>
        );
    }
    return null;
};

const MoodDistributionSection: React.FC<MoodDistributionSectionProps> = ({ 
    moodDistributionData,
    totalMoodCountForPie
}) => {
    const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

    if (moodDistributionData.length === 0) {
        return (
            <div className="w-full min-w-0 flex flex-col items-center">
                <h3 className="w-full text-xl font-semibold text-center mb-4">Mood Distribution</h3>
                <Alert className="bg-muted/30 flex flex-col items-center text-center h-full justify-center AspectRatio aspect-[16/9]">
                    <PieChartIcon className="h-8 w-8 mb-2" />
                    <AlertTitle>No Mood Data for Pie Chart</AlertTitle>
                    <AlertDescription>
                        No moods in selected range to show distribution.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 flex flex-col items-center">
            <h3 className="w-full text-xl font-semibold text-center mb-4">Mood Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={moodDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        dataKey="value"
                        stroke="none"
                        activeIndex={activePieIndex ?? undefined}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        onMouseLeave={() => setActivePieIndex(null)}
                        isAnimationActive={false} // Consider true for subtle animation if desired
                    >
                        {moodDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0}/>
                        ))}
                    </Pie>
                    <Tooltip content={(props) => renderCustomPieTooltip(props, totalMoodCountForPie)} />
                    <PieLegend 
                        verticalAlign="bottom" 
                        align="center" 
                        iconSize={10}
                        wrapperStyle={{
                            fontSize: '12px',
                            color: 'hsl(var(--card-foreground))', // Ensure this CSS var is available
                            display: 'flex', 
                            justifyContent: 'center', 
                            width: '100%', 
                            textAlign: 'center',
                            paddingTop: '10px'
                        }}
                        formatter={(value) => <span style={{ color: 'hsl(var(--card-foreground))' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MoodDistributionSection; 