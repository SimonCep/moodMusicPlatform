import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      toast.success("Login Successful!");
    } catch (err: any) {
      let errorMessage = 'Login failed. Please check your username and password.';
      const errorDetail = err.response?.data?.detail;
      const errorStatus = err.response?.status;

      if (errorDetail && errorStatus === 401) {
          errorMessage = errorDetail;
      } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
      } else if (err.message) {
          errorMessage = err.message;
      }
      toast.error("Login Failed", { description: errorMessage });
    }
  };

  return (
    <Card className="w-full max-w-sm glass-card text-card-foreground">
      <CardHeader className="text-center">
        <CardTitle>Login</CardTitle>
        <CardDescription className="text-card-foreground/80">
          Enter your credentials to access your account.
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
                  placeholder="Your username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-input/50"
               />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input 
                  id="password" 
                  type="password" 
                  placeholder="Your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input/50"
              />
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
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-primary/20 text-primary hover:bg-primary/10 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md" 
              asChild
            >
                 <Link to="/reset-password">Forgot Password?</Link>
            </Button>
            <Button 
              variant="link" 
              size="sm" 
              className="text-primary hover:text-primary/80 cursor-pointer transform transition-all duration-300 hover:scale-[1.02]" 
              asChild
            >
                 <Link to="/register">Don't have an account? Register</Link>
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm; 