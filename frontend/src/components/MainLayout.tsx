import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import { BackgroundParticles } from './BackgroundParticles';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen animated-gradient text-foreground">
      <BackgroundParticles />
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout; 