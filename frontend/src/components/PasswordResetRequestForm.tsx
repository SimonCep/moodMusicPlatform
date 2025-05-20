import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from '../services/api';
import { toast } from 'sonner';

const PasswordResetRequestForm = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await requestPasswordReset(email);
            setIsSubmitted(true);
            toast.success("If an account exists with this email, you will receive password reset instructions.");
        } catch (err: any) {
            toast.success("If an account exists with this email, you will receive password reset instructions.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="w-full max-w-sm glass-card text-card-foreground">
                <CardHeader className="text-center">
                    <CardTitle>Check Your Email</CardTitle>
                    <CardDescription className="text-card-foreground/80">
                        If an account exists with the email provided, you will receive instructions to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Button variant="link" asChild>
                        <Link to="/login">Return to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-sm glass-card text-card-foreground">
            <CardHeader className="text-center">
                <CardTitle>Reset Password</CardTitle>
                <CardDescription className="text-card-foreground/80">
                    Enter your email to receive password reset instructions.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-input/50"
                            placeholder="Enter your email address"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                    </Button>
                    <Button variant="link" size="sm" asChild>
                        <Link to="/login">Back to Login</Link>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default PasswordResetRequestForm; 