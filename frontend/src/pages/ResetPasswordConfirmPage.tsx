import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackgroundParticles } from '../components/BackgroundParticles';
import ResetPasswordConfirmForm from '../components/ResetPasswordConfirmForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

const ResetPasswordConfirmPage: React.FC = () => {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!uidb64 || !token) {
      toast.error('Invalid password reset link.', { description: 'UID or Token missing.' });
      navigate('/login', { replace: true });
    }
  }, [uidb64, token, navigate]);

  const handleSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => navigate('/login', { replace: true }), 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animated-gradient p-4">
        <BackgroundParticles />
        <Card className="w-full max-w-sm glass-card text-card-foreground">
          <CardHeader className="text-center">
            <CardTitle className="text-green-500">Success!</CardTitle>
            <CardDescription className="text-card-foreground/80">Your password has been reset.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen animated-gradient p-4">
      <BackgroundParticles />
      {uidb64 && token && (
        <ResetPasswordConfirmForm 
          uidb64={uidb64} 
          token={token} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};

export default ResetPasswordConfirmPage; 