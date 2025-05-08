import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login({ username, password });
            // No need to navigate here, AuthProvider state change handles redirect via Protected/Public Routes
            // navigate('/app', { replace: true }); 
        } catch (err: any) {
             let errorMessage = 'Login failed. Please check your username and password.'; // Default message
             const errorDetail = err.response?.data?.detail;
             const errorStatus = err.response?.status;

            if (errorDetail && errorStatus === 401) {
                errorMessage = errorDetail; 
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error; // Other potential error structures
            } else if (err.message) {
                errorMessage = err.message; // Network error, etc.
            }

            setError(errorMessage);
            toast.error("Login Failed", { description: errorMessage });
            console.error("Login failed API details:", err.response?.data || err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-8 rounded-lg shadow-lg max-w-md w-full bg-card">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                        <input 
                            type="text" 
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-input text-foreground"
                            required 
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password"className="block text-sm font-medium mb-1">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-input text-foreground"
                            required 
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-opacity duration-200"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here</Link>
                </p>
                <p className="mt-2 text-center text-sm">
                    <Link to="/forgot-password" className="text-muted-foreground hover:text-primary hover:underline">Forgot Password?</Link>
                </p>
            </div>
        </div>
    );
};

export default Login; 