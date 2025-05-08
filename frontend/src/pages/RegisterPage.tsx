import React from 'react';
import { BackgroundParticles } from '../components/BackgroundParticles';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen animated-gradient p-4">
      <BackgroundParticles />
      <RegisterForm />
    </div>
  );
};

export default RegisterPage; 