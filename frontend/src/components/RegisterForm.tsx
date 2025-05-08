import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface RegisterFormProps {
  // Props can be added here if needed, e.g., onRegisterSuccess
}

const RegisterForm: React.FC<RegisterFormProps> = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
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
      console.error("Registration failed API details:", errorData || err.message);
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
        <CardContent>
          <div className="grid w-full items-center gap-4">
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
                placeholder="Create a password (min 8 chars)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-input/50"
              />
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
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link to="/login">Already have an account? Log In</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm; 