import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset } from '../../services/api'; // Assume this will be created
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
    const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
    const navigate = useNavigate();

    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Basic validation of params presence
        if (!uidb64 || !token) {
            setError('Invalid password reset link.');
            toast.error('Invalid password reset link.');
            // Optionally redirect to login or show a more specific error page
        }
    }, [uidb64, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        
        // Client-side password match check
        if (newPassword1 !== newPassword2) {
            setError('Passwords do not match.');
            toast.error('Passwords do not match.');
            return;
        }
        
         // Client-side password length check (optional)
        if (newPassword1.length < 8) {
             setError("Password must be at least 8 characters long.");
             toast.error("Password must be at least 8 characters long.");
             return;
        }

        if (!uidb64 || !token) {
            setError('Invalid password reset link parameters.');
            toast.error('Invalid password reset link parameters.');
            return;
        }

        setIsLoading(true);
        setSuccess(false);

        try {
            await confirmPasswordReset({
                uidb64: uidb64,
                token: token,
                new_password1: newPassword1,
                new_password2: newPassword2,
            });
            setSuccess(true);
            toast.success('Password reset successfully! You can now log in.');
            setTimeout(() => navigate('/login', { replace: true }), 2000);
        } catch (err: any) {
            const errorData = err.response?.data;
            let errorMessage = 'Failed to reset password. The link may be invalid or expired, or the password may not meet requirements.'; // More informative default
            
            if (errorData) {
                const fieldErrors = [];
                // Check for specific DRF validation errors on passwords
                if (errorData.new_password1) {
                    fieldErrors.push(`Password: ${errorData.new_password1.join(' ')}`);
                }
                if (errorData.new_password2) {
                    // Often contains password validation rules errors
                    fieldErrors.push(`Password Confirmation: ${errorData.new_password2.join(' ')}`);
                }
                if (errorData.token) {
                   fieldErrors.push(`Token Error: ${errorData.token.join(' ')}`);
                }
                if (errorData.uidb64) {
                    fieldErrors.push(`User ID Error: ${errorData.uidb64.join(' ')}`);
                }
                // Handle non_field_errors (e.g., from custom validation)
                if (errorData.non_field_errors) {
                     fieldErrors.push(errorData.non_field_errors.join(' '));
                }
                // Handle simple detail string
                if (errorData.detail && fieldErrors.length === 0) {
                     fieldErrors.push(errorData.detail);
                }

                if (fieldErrors.length > 0) {
                    errorMessage = fieldErrors.join(' \n '); // Join errors with newline
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData; // Generic string error
                } else if (err.response?.statusText) {
                     errorMessage = `Error: ${err.response.statusText}`;
                }
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast.error("Password Reset Failed", { 
                description: errorMessage.replace(/\n/g, '; ')
            });
            console.error("Password reset confirmation failed:", errorData || err);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-8 rounded-lg shadow-lg max-w-md w-full bg-card text-center">
                    <h2 className="text-2xl font-bold mb-4 text-green-600">Password Reset Successful</h2>
                    <p>Your password has been changed. Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-8 rounded-lg shadow-lg max-w-md w-full bg-card">
                <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
                {error === 'Invalid password reset link.' ? (
                     <div className="text-red-500 text-center mb-4">
                        <p>{error}</p>
                        <Link to="/login" className="text-primary hover:underline">Go to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="newPassword1" className="block text-sm font-medium mb-1">New Password</label>
                            <input 
                                type="password" 
                                id="newPassword1"
                                value={newPassword1}
                                onChange={(e) => setNewPassword1(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-input text-foreground"
                                required 
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="newPassword2" className="block text-sm font-medium mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                id="newPassword2"
                                value={newPassword2}
                                onChange={(e) => setNewPassword2(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-input text-foreground"
                                required 
                            />
                        </div>
                        {error && 
                            <div className="text-red-500 text-sm mb-4 text-center whitespace-pre-line">
                                {error}
                            </div>
                        }
                        <button 
                            type="submit" 
                            disabled={isLoading || !uidb64 || !token}
                            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-opacity duration-200"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword; 