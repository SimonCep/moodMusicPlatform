// components/MoodThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from "./theme-provider";

type MoodTheme = 'happy' | 'melancholy' | 'energetic' | 'calm' | 'default';

interface MoodThemeContextType {
  currentMood: MoodTheme;
  setMood: (mood: MoodTheme) => void;
}

const MoodThemeContext = createContext<MoodThemeContextType>({
  currentMood: 'default',
  setMood: () => {},
});

export const useMoodTheme = () => useContext(MoodThemeContext);

export const MoodThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMood, setCurrentMood] = useState<MoodTheme>('default');

  // Apply CSS variables based on mood
  useEffect(() => {
    const root = document.documentElement;
    
    // Reset to default theme
    root.classList.remove('theme-happy', 'theme-melancholy', 'theme-energetic', 'theme-calm');
    
    // Apply mood-specific theme
    if (currentMood !== 'default') {
      root.classList.add(`theme-${currentMood}`);
    }
  }, [currentMood]);

  return (
    <MoodThemeContext.Provider value={{ currentMood, setMood: setCurrentMood }}>
      <ThemeProvider defaultTheme="light" storageKey="mood-music-theme">
        {children}
      </ThemeProvider>
    </MoodThemeContext.Provider>
  );
};
