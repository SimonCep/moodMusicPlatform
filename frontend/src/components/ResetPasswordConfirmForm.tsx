import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmPasswordReset } from '../services/api';
import { toast } from 'sonner';
import { PasswordRequirements } from './PasswordRequirements';
import { X } from 'lucide-react';

interface ResetPasswordConfirmFormProps {
  uidb64: string;
  token: string;
  onSuccess: () => void;
}

const ResetPasswordConfirmForm: React.FC<ResetPasswordConfirmFormProps> = ({ uidb64, token, onSuccess }) => {
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRequirements = [
      { test: newPassword1.length >= 8, message: "Password must be at least 8 characters long." },
      { test: /[A-Z]/.test(newPassword1), message: "Password must contain at least one uppercase letter." },
      { test: /[a-z]/.test(newPassword1), message: "Password must contain at least one lowercase letter." },
      { test: /[0-9]/.test(newPassword1), message: "Password must contain at least one number." },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword1), message: "Password must contain at least one special character." }
    ];

    const failedRequirements = passwordRequirements.filter(req => !req.test);
    if (failedRequirements.length > 0) {
      toast.error("Password Requirements Not Met", {
        description: failedRequirements.map(req => req.message).join('\n')
      });
      return;
    }

    if (newPassword1 !== newPassword2) {
      toast.error('Passwords do not match.');
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
      onSuccess();
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

      toast.error("Password Reset Failed", { description: errorMessage.replace(/\n/g, '; ') });
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
                placeholder="Enter new password" 
                value={newPassword1}
                onChange={(e) => setNewPassword1(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
                minLength={8}
                className="bg-input/50"
              />
              <PasswordRequirements password={newPassword1} isVisible={isPasswordFocused} />
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
              {newPassword1 !== newPassword2 && newPassword2 && (
                <div className="mt-2 p-3 rounded-md bg-background/80 dark:bg-background/60 border border-input shadow-sm transition-all duration-200 ease-in-out">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                    <span>Passwords do not match</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            variant="outline"
            className="w-full text-primary border-primary hover:bg-primary/10 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md" 
            disabled={isLoading}
          >
            {isLoading ? 'Setting Password...' : 'Set New Password'}
          </Button>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary hover:text-primary/80 cursor-pointer transform transition-all duration-300 hover:scale-[1.02]" 
            asChild
          >
            <Link to="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ResetPasswordConfirmForm; 