import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext';
import { cn } from "@/lib/utils";

const NavBar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/playlists', label: 'Your Music' },
    { path: '/mood', label: 'Mood Check-in' },
    { path: '/discovery', label: 'Discovery' },
    { path: '/report', label: 'Mood Tracker' },
    { path: '/help', label: 'Need Help?' },
  ];

  const filteredNavItems = navItems.filter(item => item.label !== 'Your Profile');

  return (
    <nav className="bg-background/70 backdrop-filter backdrop-blur-md sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1 sm:space-x-3">
            {filteredNavItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "transition-colors hover:bg-accent/50 hover:text-accent-foreground",
                    location.pathname === item.path 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <Link 
                key="/profile"
                to="/profile"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent-foreground",
                  location.pathname === '/profile' 
                    ? "text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {user.username}
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 