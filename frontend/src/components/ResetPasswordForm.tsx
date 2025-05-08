import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset } from '../services/api'; // Adjusted path for services
import { toast } from 'sonner';

interface ResetPasswordFormProps {
  // Props can be added here if needed
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      toast.success('Password reset email sent', {
        description: 'If an account with that email exists, please check your inbox (and spam folder).'
      });
      setEmail('');
    } catch (err: any) {
      const errorMessage = 'Failed to send reset email. Please try again later.';
      toast.error("Request Failed", { description: errorMessage });
      console.error("Password reset request failed:", err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm glass-card text-card-foreground">
      <CardHeader className="text-center">
        <CardTitle>Reset Password</CardTitle>
        <CardDescription className="text-card-foreground/80">
          Enter your email to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link to="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ResetPasswordForm; 