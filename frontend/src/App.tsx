import React from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
// Old auth component imports are already removed

// Import page components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResetPasswordConfirmPage from './pages/ResetPasswordConfirmPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import PlaylistsPage from './pages/PlaylistsPage';
import MoodPage from './pages/MoodPage';
import ReportPage from './pages/ReportPage';
import HelpPage from './pages/HelpPage';
import DiscoveryPage from './pages/DiscoveryPage';
import MainLayout from './components/MainLayout';

// Remove unused imports related to the old MainApp structure
// import { createMoodAndGetPlaylist } from './services/api';
// import { Playlist } from './types';
import { Toaster } from "sonner";
// BackgroundParticles handled in MainLayout and auth pages
// import { MoodTimeline } from './components/MoodTimeline';

// Wrapper for protected routes
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Basic loading indicator
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Wrapper for public routes (redirect if logged in)
const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't show loading indicator here, it might cause a flicker.
  // if (isLoading) {
  //    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  // }

  // Redirect to home page if loading is complete AND user is authenticated.
  if (!isLoading && isAuthenticated) {
    // Redirect to the main home page
    return <Navigate to="/home" replace />;
  }

  // Otherwise, show the public route content (Login/Register).
  return <Outlet />;
};

// Old MainApp component remains commented out for reference if needed
/*
...
*/

function App() {
  return (
    <>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={
            <Navigate to={useAuth().isAuthenticated ? "/home" : "/register"} replace />
          }
        />

        {/* Public routes */}
        <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordConfirmPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/app" element={<Navigate to="/home" replace />} /> {/* Redirect old path */}
            <Route index element={<Navigate to="/home" replace />} /> {/* Default protected route */} 
          </Route>
        </Route>

        {/* 404 Catch-all route */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen animated-gradient text-foreground">
            <h1 className="text-4xl font-bold">404</h1>
             <p>Page Not Found</p>
            <Link to="/" className="mt-4 text-blue-300 hover:underline">Go to App</Link>
           </div>
          } />
      </Routes>
      {/* Global Toaster */}
       <Toaster />
    </>
  );
}

export default App;
