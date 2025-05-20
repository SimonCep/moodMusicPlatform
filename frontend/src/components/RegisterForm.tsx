import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { PasswordRequirements } from './PasswordRequirements';
import { X } from 'lucide-react';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRequirements = [
      { test: password.length >= 8, message: "Password must be at least 8 characters long." },
      { test: /[A-Z]/.test(password), message: "Password must contain at least one uppercase letter." },
      { test: /[a-z]/.test(password), message: "Password must contain at least one lowercase letter." },
      { test: /[0-9]/.test(password), message: "Password must contain at least one number." },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: "Password must contain at least one special character." }
    ];

    const failedRequirements = passwordRequirements.filter(req => !req.test);
    if (failedRequirements.length > 0) {
      toast.error("Password Requirements Not Met", {
        description: failedRequirements.map(req => req.message).join('\n')
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await register({ username, email, password });
      toast.success("Registration successful! Please log in.");
      navigate('/login', { replace: true });
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please check your input and try again.';
      const errorData = err.response?.data;

      if (errorData) {
        const fieldErrors = [];
        if (errorData.username) fieldErrors.push(`Username: ${errorData.username.join(' ')}`);
        if (errorData.email) fieldErrors.push(`Email: ${errorData.email.join(' ')}`);
        if (errorData.password) fieldErrors.push(`Password: ${errorData.password.join(' ')}`);
        if (errorData.non_field_errors) fieldErrors.push(errorData.non_field_errors.join(' '));
        if (errorData.detail) fieldErrors.push(errorData.detail);
        
        if (fieldErrors.length > 0) errorMessage = fieldErrors.join(' \n ');
        else if (typeof errorData === 'string') errorMessage = errorData;
        else if (err.response?.statusText) errorMessage = `Error: ${err.response.statusText}`;
      }
      else if (err.message) {
        errorMessage = err.message;
      }

      toast.error("Registration Failed", { description: errorMessage.replace(/\n/g, '; ') });
    }
  };

  return (
    <Card className="w-full max-w-sm glass-card text-card-foreground">
      <CardHeader className="text-center">
        <CardTitle>Register</CardTitle>
        <CardDescription className="text-card-foreground/80">
          Create your new account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder="Choose a username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-input/50"
            />
          </div>
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
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Create a password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              required
              minLength={8}
              className="bg-input/50"
            />
            <PasswordRequirements password={password} isVisible={isPasswordFocused} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              placeholder="Confirm your password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-input/50"
            />
            {password !== confirmPassword && confirmPassword && (
              <div className="mt-2 p-3 rounded-md bg-background/80 dark:bg-background/60 border border-input shadow-sm transition-all duration-200 ease-in-out">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                  <span>Passwords do not match</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            variant="outline"
            className="w-full text-primary border-primary hover:bg-primary/10 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md" 
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary hover:text-primary/80 cursor-pointer transform transition-all duration-300 hover:scale-[1.02]" 
            asChild
          >
            <Link to="/login">Already have an account? Log In</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm; 