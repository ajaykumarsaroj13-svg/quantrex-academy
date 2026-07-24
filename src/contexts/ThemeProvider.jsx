import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('quantrex_theme') || 'system');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('quantrex_font_size') || 'normal');
  const [borderRadius, setBorderRadius] = useState(() => localStorage.getItem('quantrex_border_radius') || 'default');
  const [animationSpeed, setAnimationSpeed] = useState(() => localStorage.getItem('quantrex_animation_speed') || 'normal');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('quantrex_accent_color') || 'blue');

  useEffect(() => {
    const root = document.documentElement;

    // Handle Theme (Light / Dark)
    const applyTheme = (t) => {
      let isDark = false;
      if (t === 'dark') {
        isDark = true;
      } else if (t === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };
    applyTheme(theme);
    localStorage.setItem('quantrex_theme', theme);

    // Handle Font Size
    localStorage.setItem('quantrex_font_size', fontSize);
    let scale = 1;
    if (fontSize === 'small') scale = 0.875;
    if (fontSize === 'large') scale = 1.125;
    if (fontSize === 'xl') scale = 1.25;
    root.style.setProperty('--font-scale', scale);

    // Handle Border Radius
    localStorage.setItem('quantrex_border_radius', borderRadius);
    let radiusConfig = { card: '16px', button: '8px', input: '6px' };
    if (borderRadius === 'compact') {
      radiusConfig = { card: '8px', button: '4px', input: '4px' };
    } else if (borderRadius === 'comfortable') {
      radiusConfig = { card: '24px', button: '12px', input: '12px' };
    }
    root.style.setProperty('--radius-card', radiusConfig.card);
    root.style.setProperty('--radius-button', radiusConfig.button);
    root.style.setProperty('--radius-input', radiusConfig.input);

    // Handle Animation Speed
    localStorage.setItem('quantrex_animation_speed', animationSpeed);
    root.style.setProperty('--animation-multiplier', animationSpeed === 'off' ? '0' : animationSpeed === 'reduced' ? '2' : '1');
    root.style.setProperty('--transition-fast', `calc(0.15s * var(--animation-multiplier))`);
    root.style.setProperty('--transition-normal', `calc(0.3s * var(--animation-multiplier))`);
    root.style.setProperty('--transition-slow', `calc(0.5s * var(--animation-multiplier))`);

    // Handle Accent Color
    localStorage.setItem('quantrex_accent_color', accentColor);
    const accents = {
      blue: { primary: '#3B82F6', hover: '#2563EB', bg: 'rgba(59, 130, 246, 0.1)' },
      gold: { primary: '#F59E0B', hover: '#D97706', bg: 'rgba(245, 158, 11, 0.1)' },
      emerald: { primary: '#10B981', hover: '#059669', bg: 'rgba(16, 185, 129, 0.1)' },
      purple: { primary: '#8B5CF6', hover: '#7C3AED', bg: 'rgba(139, 92, 246, 0.1)' },
    };
    const activeAccent = accents[accentColor] || accents.blue;
    root.style.setProperty('--accent-primary', activeAccent.primary);
    root.style.setProperty('--accent-hover', activeAccent.hover);
    root.style.setProperty('--accent-bg', activeAccent.bg);

  }, [theme, fontSize, borderRadius, animationSpeed, accentColor]);

  // System theme listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = document.documentElement;
        if (mediaQuery.matches) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme, setTheme,
    fontSize, setFontSize,
    borderRadius, setBorderRadius,
    animationSpeed, setAnimationSpeed,
    accentColor, setAccentColor,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
