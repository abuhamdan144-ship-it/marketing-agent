import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'office' | 'outdoor';

export interface ThemeTokens {
  mode: ThemeMode;
  isOutdoor: boolean;
  
  // Backgrounds
  bgPage: string;
  bgSidebar: string;
  bgHeader: string;
  bgCard: string;
  bgDarkCard: string;
  bgSubtle: string;
  
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textHeader: string;
  textAccent: string;
  
  // Borders
  borderColor: string;
  borderThick: string;
  
  // Accents
  accent: string;
  accentBg: string;
  
  // Semantic Status Colors
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;
  
  // Helpers
  cardClass: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  isOutdoor: boolean;
  toggleTheme: () => void;
  theme: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved === 'outdoor' || saved === 'office') ? saved : 'office';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', mode);
    if (mode === 'outdoor') {
      document.documentElement.classList.add('outdoor-mode');
      document.body.classList.add('outdoor-mode');
    } else {
      document.documentElement.classList.remove('outdoor-mode');
      document.body.classList.remove('outdoor-mode');
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'office' ? 'outdoor' : 'office'));
  };

  const isOutdoor = mode === 'outdoor';

  const theme: ThemeTokens = {
    mode,
    isOutdoor,
    
    // Backgrounds
    bgPage: isOutdoor ? '#FFFFFF' : '#EEF0F3',
    bgSidebar: isOutdoor ? '#FFFFFF' : '#0F1B33',
    bgHeader: isOutdoor ? '#000000' : '#0F1B33',
    bgCard: isOutdoor ? '#FFFFFF' : '#FFFFFF',
    bgDarkCard: isOutdoor ? '#F5F5F5' : '#0F1B33',
    bgSubtle: isOutdoor ? '#F0F0F0' : '#EEF0F3',
    
    // Text Colors
    textPrimary: isOutdoor ? '#000000' : '#0F1B33',
    textSecondary: isOutdoor ? '#111111' : '#5B6478',
    textMuted: isOutdoor ? '#222222' : '#8891A3',
    textHeader: isOutdoor ? '#FFFFFF' : '#FFFFFF',
    textAccent: isOutdoor ? '#000000' : '#C9A227',
    
    // Borders
    borderColor: isOutdoor ? '#000000' : '#E2E5E1',
    borderThick: isOutdoor ? '2px solid #000000' : '1px solid #E2E5E1',
    
    // Accents
    accent: isOutdoor ? '#000000' : '#C9A227',
    accentBg: isOutdoor ? '#000000' : 'rgba(201, 162, 39, 0.12)',
    
    // Semantic Status Colors
    success: isOutdoor ? '#0F6B3D' : '#2F9E77',
    successBg: isOutdoor ? '#0F6B3D' : 'rgba(47, 158, 119, 0.1)',
    error: isOutdoor ? '#B91C1C' : '#D64545',
    errorBg: isOutdoor ? '#B91C1C' : 'rgba(214, 69, 69, 0.1)',
    warning: isOutdoor ? '#B45309' : '#C9A227',
    warningBg: isOutdoor ? '#B45309' : 'rgba(201, 162, 39, 0.12)',
    info: isOutdoor ? '#1D4ED8' : '#2E4B8F',
    infoBg: isOutdoor ? '#1D4ED8' : 'rgba(46, 75, 143, 0.1)',
    
    // Helpers
    cardClass: isOutdoor ? 'ops-card-outdoor' : 'ops-card',
    fontWeightNormal: isOutdoor ? 'font-semibold' : 'font-normal',
    fontWeightMedium: isOutdoor ? 'font-bold' : 'font-medium',
    fontWeightBold: isOutdoor ? 'font-extrabold' : 'font-bold',
  };

  return (
    <ThemeContext.Provider value={{ mode, isOutdoor, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
