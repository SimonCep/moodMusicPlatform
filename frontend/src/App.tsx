import React from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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
import { Toaster } from "sonner";


const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={
          <Navigate to={useAuth().isAuthenticated ? "/home" : "/register"} replace />
        }
        />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordConfirmPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/app" element={<Navigate to="/home" replace />} />
            <Route index element={<Navigate to="/home" replace />} />
          </Route>
        </Route>
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen animated-gradient text-foreground">
            <h1 className="text-4xl font-bold">404</h1>
            <p>Page Not Found</p>
            <Link to="/" className="mt-4 text-blue-300 hover:underline">Go to App</Link>
          </div>
        } />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
