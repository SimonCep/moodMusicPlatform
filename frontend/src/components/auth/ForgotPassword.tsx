import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../services/api';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');
        try {
            await requestPasswordReset(email);
            setMessage('If an account with that email exists, a password reset link has been sent. Please check your inbox and spam folder.');
            toast.success('Password reset email sent', { 
                 description: 'Please check your inbox and spam folder.' 
            });
            setEmail('');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.response?.data?.email?.[0] || 'Failed to send reset email. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-8 rounded-lg shadow-lg max-w-md w-full bg-card">
                <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
                <p className="text-center text-sm text-muted-foreground mb-4">
                    Enter your email address and we will send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit}>
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
                    {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-opacity duration-200"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Remembered your password? <Link to="/login" className="text-primary hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword; 