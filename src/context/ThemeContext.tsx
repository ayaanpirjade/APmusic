import React, { createContext, useContext } from 'react';
import { useSystemTheme, ThemeMode, ResolvedTheme, UseThemeReturn } from '../hooks/useTheme';

const ThemeContext = createContext<UseThemeReturn | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeValues = useSystemTheme();

  return <ThemeContext.Provider value={themeValues}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): UseThemeReturn => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

export { useTheme } from '../hooks/useTheme';
export type { ThemeMode, ResolvedTheme };
