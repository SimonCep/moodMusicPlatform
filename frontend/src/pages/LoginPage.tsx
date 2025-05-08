import React from 'react';
import { BackgroundParticles } from '../components/BackgroundParticles';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen animated-gradient p-4">
      <BackgroundParticles />
      <LoginForm />
    </div>
  );
};

export default LoginPage;
