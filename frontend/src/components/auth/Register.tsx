import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
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
            const statusCode = err.response?.status;

            if (errorData) {
                const fieldErrors = [];
                if (errorData.username) {
                    fieldErrors.push(`Username: ${errorData.username.join(' ')}`);
                }
                if (errorData.email) {
                    fieldErrors.push(`Email: ${errorData.email.join(' ')}`);
                }
                if (errorData.password) {
                    fieldErrors.push(`Password: ${errorData.password.join(' ')}`);
                }
                if (errorData.non_field_errors) {
                     fieldErrors.push(errorData.non_field_errors.join(' '));
                }

                if (fieldErrors.length > 0) {
                    errorMessage = fieldErrors.join(' \n ');
                } else if (statusCode === 400 && typeof errorData === 'object') {
                    errorMessage = "Invalid data provided. Please check the form fields.";
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (err.response?.statusText) {
                    errorMessage = `Error: ${err.response.statusText}`;
                }
            } else if (err.message) {
                 errorMessage = err.message;
             }

            setError(errorMessage);
            toast.error("Registration Failed", { 
                description: errorMessage.replace(/\n/g, '; ') 
            }); 
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-8 rounded-lg shadow-lg max-w-md w-full bg-card">
                <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
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
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            minLength={8}
                        />
                    </div>
                     {error && 
                        <div className="text-red-500 text-sm mb-4 text-center whitespace-pre-line">
                            {error}
                        </div>
                    }
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-opacity duration-200"
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                 <p className="mt-4 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register; 