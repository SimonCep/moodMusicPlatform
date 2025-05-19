import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
    password: string;
    isVisible: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, isVisible }) => {
    const requirements = [
        {
            text: "At least 8 characters long",
            met: password.length >= 8
        },
        {
            text: "Contains uppercase letter",
            met: /[A-Z]/.test(password)
        },
        {
            text: "Contains lowercase letter",
            met: /[a-z]/.test(password)
        },
        {
            text: "Contains a number",
            met: /[0-9]/.test(password)
        },
        {
            text: "Contains special character",
            met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        }
    ];

    if (!isVisible) return null;

    return (
        <div className="mt-2 p-3 rounded-md bg-background/80 dark:bg-background/60 border border-input shadow-sm transition-all duration-200 ease-in-out">
            <h3 className="font-medium text-sm text-foreground/90 mb-2">
                Password Requirements:
            </h3>
            <ul className="space-y-1">
                {requirements.map((req, index) => (
                    <li
                        key={index}
                        className={`flex items-center space-x-2 text-sm ${
                            req.met 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-muted-foreground'
                        }`}
                    >
                        {req.met ? (
                            <Check className="h-3.5 w-3.5" />
                        ) : (
                            <X className="h-3.5 w-3.5" />
                        )}
                        <span>{req.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}; 