import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ReportHeaderSection: React.FC = () => {
    return (
        <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
                Mood & Emotional Impact Report
            </CardTitle>
            <CardDescription className="text-card-foreground/90 text-center">
                Review your mood history, energy trends, and get personalized advice.
            </CardDescription>
        </CardHeader>
    );
};

export default ReportHeaderSection; 