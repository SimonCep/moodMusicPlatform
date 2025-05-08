import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmPasswordReset } from '../services/api'; // Adjusted path for services
import { toast } from 'sonner';

interface ResetPasswordConfirmFormProps {
  uidb64: string;
  token: string;
  onSuccess: () => void;
}

const ResetPasswordConfirmForm: React.FC<ResetPasswordConfirmFormProps> = ({ uidb64, token, onSuccess }) => {
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null); // Local error state can be managed by toast

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(null);

    if (newPassword1 !== newPassword2) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword1.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (!uidb64 || !token) {
      toast.error('Invalid password reset link parameters.');
      // This case should ideally be handled by the parent page before rendering the form
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset({
        uidb64,
        token,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });
      toast.success('Password reset successfully! You can now log in.');
      onSuccess(); // Call the onSuccess prop to handle navigation/state in parent
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Failed to reset password. Link may be invalid/expired or password invalid.';

      if (errorData) {
        const fieldErrors = [];
        if (errorData.new_password1) fieldErrors.push(`Password: ${errorData.new_password1.join(' ')}`);
        if (errorData.new_password2) fieldErrors.push(`Password Confirmation: ${errorData.new_password2.join(' ')}`);
        if (errorData.token) fieldErrors.push(`Token Error: ${errorData.token.join(' ')}`);
        if (errorData.uidb64) fieldErrors.push(`User ID Error: ${errorData.uidb64.join(' ')}`);
        if (errorData.non_field_errors) fieldErrors.push(errorData.non_field_errors.join(' '));
        if (errorData.detail && fieldErrors.length === 0) fieldErrors.push(errorData.detail);

        if (fieldErrors.length > 0) errorMessage = fieldErrors.join(' \n ');
        else if (typeof errorData === 'string') errorMessage = errorData;
        else if (err.response?.statusText) errorMessage = `Error: ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // setError(errorMessage.replace(/\n/g, '; '));
      toast.error("Password Reset Failed", { description: errorMessage.replace(/\n/g, '; ') });
      console.error("Password reset confirmation failed:", errorData || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm glass-card text-card-foreground">
      <CardHeader className="text-center">
        <CardTitle>Set New Password</CardTitle>
        <CardDescription className="text-card-foreground/80">
          Enter and confirm your new password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="Enter new password (min 8 chars)" 
                value={newPassword1}
                onChange={(e) => setNewPassword1(e.target.value)}
                required
                minLength={8}
                className="bg-input/50"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="Confirm new password" 
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Setting Password...' : 'Set New Password'}
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link to="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ResetPasswordConfirmForm; 