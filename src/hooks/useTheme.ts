import { useContext } from 'react';
import { ThemeContext } from '../context/themeContextStore';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
