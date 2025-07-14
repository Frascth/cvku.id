
import { create } from 'zustand';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export interface Font {
  id: string;
  name: string;
  family: string;
}

interface ThemeStore {
  currentTheme: Theme;
  currentFont: Font;
  availableThemes: Theme[];
  availableFonts: Font[];
  setTheme: (theme: Theme) => void;
  setFont: (font: Font) => void;
}

const defaultThemes: Theme[] = [
  {
    id: 'blue',
    name: 'Professional Blue',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#0ea5e9',
      background: '#ffffff',
      text: '#1e293b'
    }
  },
  {
    id: 'green',
    name: 'Nature Green',
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  {
    id: 'purple',
    name: 'Creative Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#64748b',
      accent: '#a855f7',
      background: '#ffffff',
      text: '#1e293b'
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      primary: '#3b82f6',
      secondary: '#9ca3af',
      accent: '#06b6d4',
      background: '#111827',
      text: '#f9fafb'
    }
  }
];

const defaultFonts: Font[] = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'open-sans', name: 'Open Sans', family: 'Open Sans, sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif' },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, serif' }
];

export const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: defaultThemes[0],
  currentFont: defaultFonts[0],
  availableThemes: defaultThemes,
  availableFonts: defaultFonts,
  setTheme: (theme) => set({ currentTheme: theme }),
  setFont: (font) => set({ currentFont: font }),
}));
