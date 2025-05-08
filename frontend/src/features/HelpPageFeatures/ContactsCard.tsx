import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Mail } from 'lucide-react';

const ContactsCard: React.FC = () => {
    return (
        <Card className="glass-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Mail className="h-4 w-4 text-card-foreground/80" />
            </CardHeader>
            <CardContent className="text-xs text-card-foreground/80 space-y-3">
                <div className="text-lg font-bold text-card-foreground">Get In Touch</div>
                <p className="text-sm text-card-foreground/80">
                    If you have any questions, issues, or feedback, please don't hesitate to reach out.
                </p>
                <div className="pt-1">
                    <span className="text-sm font-semibold text-card-foreground">Email: </span>
                    <span className="text-sm text-card-foreground/90">moodmusicplatform@gmail.com</span>
                </div>
                {/* TODO: Add more contact info or a contact form link */}
            </CardContent>
        </Card>
    );
};

export default ContactsCard; 