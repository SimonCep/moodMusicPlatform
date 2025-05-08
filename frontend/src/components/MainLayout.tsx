import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar'; // Assuming NavBar is in the same directory
import { BackgroundParticles } from './BackgroundParticles'; // Assuming this is used for the background
// Toaster is likely handled globally in App.tsx
// import { Toaster } from "sonner";

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen animated-gradient text-foreground">
      <BackgroundParticles /> {/* Keep particles if desired */}
      {/* NavBar will now include the Logout button */}
      <NavBar />
      {/* Re-added 'container' and 'mx-auto' for centered max-width content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* Renders the active page component */}
      </main>
      {/* Toaster might be better placed globally in App.tsx or here, depending on need */}
      {/* <Toaster /> */}
    </div>
  );
};

export default MainLayout; 