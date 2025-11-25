import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Función para obtener el tema inicial
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remover ambas clases primero
    root.classList.remove('dark', 'light');
    
    // Agregar la clase correspondiente
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    // Guardar en localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('No se pudo guardar el tema en localStorage:', e);
    }
    
    console.log('Tema aplicado:', theme, 'Clases:', root.className);
  }, [theme]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentTheme = theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    console.log('Toggle: cambiando de', currentTheme, 'a', newTheme);
    console.log('Clases antes:', root.className);
    
    // Aplicar inmediatamente para que se vea el cambio
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    console.log('Clases después:', root.className);
    console.log('Tiene clase dark?', root.classList.contains('dark'));
    
    // Actualizar el estado
    setTheme(newTheme);
    
    // Forzar re-render si es necesario
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('themechange'));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

