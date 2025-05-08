import React from 'react';
import { BackgroundParticles } from '../components/BackgroundParticles';
import ResetPasswordForm from '../components/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen animated-gradient p-4">
      <BackgroundParticles />
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPasswordPage; 