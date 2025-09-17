import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Appearance } from 'react-native';
import { Theme, lightTheme, darkTheme } from '../constants/theme';
import { storageService } from '../services/storage';
import { logger } from '../utils/logger';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');
  const [systemColorScheme, setSystemColorScheme] = useState(Appearance.getColorScheme());

  // Determine if dark mode should be active
  const isDark = useMemo(() => 
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark'), 
    [themeMode, systemColorScheme]
  );
  const theme = useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);

  useEffect(() => {
    // Load saved theme preference
    loadThemePreference();

    // Listen for system color scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const settings = await storageService.getSettings();
      if (settings?.themeMode) {
        setThemeModeState(settings.themeMode);
      }
    } catch (error) {
      logger.error('Failed to load theme preference:', error);
    }
  };

  const setThemeMode = async (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    try {
      const settings = await storageService.getSettings();
      if (settings) {
        await storageService.updateSettings({
          ...settings,
          themeMode: mode,
        });
      }
    } catch (error) {
      logger.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const contextValue = useMemo(() => ({
    theme,
    isDark,
    toggleTheme,
    setThemeMode,
    themeMode,
  }), [theme, isDark, toggleTheme, setThemeMode, themeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};