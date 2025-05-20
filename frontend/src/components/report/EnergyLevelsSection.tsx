import React from 'react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LineChart as LineChartIcon } from 'lucide-react';

interface ChartDisplayDataItem {
    name: string;
    energyLevel: number;
    fullDate: string;
    moodText: string;
}

interface EnergyLevelsSectionProps {
    chartDisplayData: ChartDisplayDataItem[];
    hasEnoughDataForChart: boolean;
}

const EnergyLevelsSection: React.FC<EnergyLevelsSectionProps> = ({ 
    chartDisplayData,
    hasEnoughDataForChart
}) => {
    if (!hasEnoughDataForChart) {
        return (
            <div className="w-full min-w-0 flex flex-col items-center">
                <h3 className="w-full text-xl font-semibold mb-4 text-center">Energy Levels Over Time</h3>
                <Alert className="bg-muted/30 flex flex-col items-center text-center h-full justify-center AspectRatio aspect-[16/9]">
                    <LineChartIcon className="h-8 w-8 mb-2" />
                    <AlertTitle>Not Enough Data for Chart</AlertTitle>
                    <AlertDescription>
                        Min. 2 entries in range needed.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 flex flex-col items-center">
            <h3 className="w-full text-xl font-semibold mb-4 text-center">Energy Levels Over Time</h3>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartDisplayData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--card-foreground))" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke="hsl(var(--card-foreground))" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))', 
                            color: 'hsl(var(--popover-foreground))', 
                            borderRadius: '0.5rem', 
                            border: '1px solid hsl(var(--border))'
                        }}
                        formatter={(value: number, _name: string, props: any) => [`${value}/10 - ${props.payload.moodText}`, `Energy on ${props.payload.fullDate}`]}
                    />
                    <Line
                        type="monotone"
                        dataKey="energyLevel"
                        name="Energy Level"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ 
                            r: 4, 
                            fill: "hsl(var(--primary))", 
                            className: "cursor-pointer transition-all duration-300 hover:r-6" 
                        }}
                        activeDot={{ 
                            r: 6, 
                            className: "cursor-pointer transition-all duration-300" 
                        }}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                    <Legend 
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ 
                            color: 'hsl(var(--card-foreground))', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            width: '100%', 
                            textAlign: 'center',
                            paddingTop: '10px'
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EnergyLevelsSection; 