import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: {
    // Primary brand colors - adaptive to theme
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryDeep: string;
    
    // Secondary colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Accent colors
    accent: string;
    accentLight: string;
    accentDark: string;
    
    // Backgrounds - context aware
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceElevated: string;
    surfaceDepressed: string;
    card: string;
    
    // Glass morphism
    glass: {
      background: string;
      backgroundSecondary: string;
      border: string;
      shadow: string;
    };
    
    // Text colors - high contrast
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
      muted: string;
      disabled: string;
      onPrimary: string;
      onSurface: string;
      onBackground: string;
    };
    
    // Status colors - vibrant
    success: string;
    successLight: string;
    successDark: string;
    warning: string;
    warningLight: string;
    warningDark: string;
    error: string;
    errorLight: string;
    errorDark: string;
    info: string;
    infoLight: string;
    infoDark: string;
    
    // Interactive states
    online: string;
    offline: string;
    away: string;
    busy: string;
    
    // Borders and dividers
    border: string;
    borderLight: string;
    borderDark: string;
    divider: string;
    
    // Input states
    inputBackground: string;
    inputBorder: string;
    inputBorderFocused: string;
    inputText: string;
    inputPlaceholder: string;
    
    // Gradients
    gradients: {
      primary: string[];
      primaryVertical: string[];
      secondary: string[];
      accent: string[];
      success: string[];
      warning: string[];
      error: string[];
      glass: string[];
      darkGlass: string[];
      night: string[];
      sunset: string[];
      background: string[];
      surface: string[];
    };
    
    // Shadows
    shadows: {
      primary: string;
      secondary: string;
      neutral: string;
      glass: string;
      card: string;
      modal: string;
    };
  };
}

interface ThemeState {
  theme: Theme;
  systemColorScheme: ColorSchemeName;
}

type ThemeAction = 
  | { type: 'SET_THEME_MODE'; payload: ThemeMode }
  | { type: 'SET_SYSTEM_COLOR_SCHEME'; payload: ColorSchemeName }
  | { type: 'TOGGLE_THEME' };

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = '@theme_mode';

// Light theme colors
const lightColors = {
  // Primary brand colors
  primary: '#A05FFF',
  primaryLight: '#B57FFF',
  primaryDark: '#8A3FFF',
  primaryDeep: '#6B2FE5',
  
  // Secondary colors
  secondary: '#3933C6',
  secondaryLight: '#4F46E5',
  secondaryDark: '#2D1B9B',
  
  // Accent colors
  accent: '#FF6B9D',
  accentLight: '#FF8BB3',
  accentDark: '#E5527A',
  
  // Backgrounds
  background: '#FAFBFC',
  backgroundSecondary: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceDepressed: '#F0F2F5',
  card: '#FFFFFF',
  
  // Glass morphism
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    backgroundSecondary: 'rgba(255, 255, 255, 0.75)',
    border: 'rgba(255, 255, 255, 0.30)',
    shadow: 'rgba(160, 95, 255, 0.15)',
  },
  
  // Text colors
  text: {
    primary: '#1A1D29',
    secondary: '#4A5568',
    tertiary: '#718096',
    inverse: '#FFFFFF',
    muted: '#A0AEC0',
    disabled: '#CBD5E0',
    onPrimary: '#FFFFFF',
    onSurface: '#1A1D29',
    onBackground: '#1A1D29',
  },
  
  // Status colors
  success: '#16A34A',
  successLight: '#22C55E',
  successDark: '#15803D',
  warning: '#EA580C',
  warningLight: '#FB923C',
  warningDark: '#C2410C',
  error: '#DC2626',
  errorLight: '#EF4444',
  errorDark: '#B91C1C',
  info: '#2563EB',
  infoLight: '#3B82F6',
  infoDark: '#1D4ED8',
  
  // Interactive states
  online: '#16A34A',
  offline: '#6B7280',
  away: '#EA580C',
  busy: '#DC2626',
  
  // Borders and dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E0',
  divider: '#E2E8F0',
  
  // Input states
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputBorderFocused: '#A05FFF',
  inputText: '#1A1D29',
  inputPlaceholder: '#A0AEC0',
};

// Dark theme colors
const darkColors = {
  // Primary brand colors (slightly muted for dark theme)
  primary: '#B57FFF',
  primaryLight: '#C798FF',
  primaryDark: '#A05FFF',
  primaryDeep: '#8A3FFF',
  
  // Secondary colors
  secondary: '#4F46E5',
  secondaryLight: '#6366F1',
  secondaryDark: '#3933C6',
  
  // Accent colors
  accent: '#FF8BB3',
  accentLight: '#FFA5C4',
  accentDark: '#FF6B9D',
  
  // Backgrounds
  background: '#0B0D12',
  backgroundSecondary: '#161B22',
  surface: '#1C2128',
  surfaceElevated: '#21262D',
  surfaceDepressed: '#161B22',
  card: '#1C2128',
  
  // Glass morphism
  glass: {
    background: 'rgba(28, 33, 40, 0.85)',
    backgroundSecondary: 'rgba(22, 27, 34, 0.75)',
    border: 'rgba(255, 255, 255, 0.12)',
    shadow: 'rgba(181, 127, 255, 0.25)',
  },
  
  // Text colors
  text: {
    primary: '#F0F6FC',
    secondary: '#B1BAC4',
    tertiary: '#8B949E',
    inverse: '#1A1D29',
    muted: '#6E7681',
    disabled: '#484F58',
    onPrimary: '#FFFFFF',
    onSurface: '#F0F6FC',
    onBackground: '#F0F6FC',
  },
  
  // Status colors (slightly brighter for dark theme)
  success: '#22C55E',
  successLight: '#4ADE80',
  successDark: '#16A34A',
  warning: '#FB923C',
  warningLight: '#FDBA74',
  warningDark: '#EA580C',
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  
  // Interactive states
  online: '#22C55E',
  offline: '#9CA3AF',
  away: '#FB923C',
  busy: '#EF4444',
  
  // Borders and dividers
  border: '#30363D',
  borderLight: '#21262D',
  borderDark: '#484F58',
  divider: '#30363D',
  
  // Input states
  inputBackground: '#0D1117',
  inputBorder: '#30363D',
  inputBorderFocused: '#B57FFF',
  inputText: '#F0F6FC',
  inputPlaceholder: '#8B949E',
};

// Create gradients for both themes
const createGradients = (colors: typeof lightColors) => ({
  primary: [colors.primary, colors.secondary],
  primaryVertical: [colors.primary, colors.primaryDark],
  secondary: [colors.secondaryLight, colors.info],
  accent: [colors.accent, colors.primary],
  success: [colors.success, colors.successLight],
  warning: [colors.warning, colors.warningLight],
  error: [colors.error, colors.errorLight],
  glass: colors.glass.background === 'rgba(255, 255, 255, 0.85)' 
    ? ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']
    : ['rgba(28, 33, 40, 0.15)', 'rgba(22, 27, 34, 0.05)'],
  darkGlass: ['rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.05)'],
  night: colors.glass.background === 'rgba(255, 255, 255, 0.85)'
    ? ['#1a1a2e', '#16213e', '#0f3460']
    : ['#0B0D12', '#161B22', '#1C2128'],
  sunset: [colors.primary, colors.accent, colors.warning],
  background: [colors.background, colors.backgroundSecondary],
  surface: [colors.surface, colors.surfaceElevated],
});

// Create shadows for both themes  
const createShadows = (colors: typeof lightColors) => ({
  primary: colors.primary + '40',
  secondary: colors.secondary + '40',
  neutral: colors.glass.background === 'rgba(255, 255, 255, 0.85)' 
    ? 'rgba(0, 0, 0, 0.10)' 
    : 'rgba(0, 0, 0, 0.25)',
  glass: colors.glass.shadow,
  card: colors.glass.background === 'rgba(255, 255, 255, 0.85)'
    ? 'rgba(0, 0, 0, 0.08)'
    : 'rgba(0, 0, 0, 0.20)',
  modal: colors.glass.background === 'rgba(255, 255, 255, 0.85)'
    ? 'rgba(0, 0, 0, 0.15)'
    : 'rgba(0, 0, 0, 0.35)',
});

const createTheme = (mode: ThemeMode, isDark: boolean): Theme => {
  const colors = isDark ? darkColors : lightColors;
  
  return {
    mode,
    isDark,
    colors: {
      ...colors,
      gradients: createGradients(colors),
      shadows: createShadows(colors),
    },
  };
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME_MODE': {
      const mode = action.payload;
      const isDark = mode === 'dark' || (mode === 'auto' && state.systemColorScheme === 'dark');
      return {
        ...state,
        theme: createTheme(mode, isDark),
      };
    }
    case 'SET_SYSTEM_COLOR_SCHEME': {
      const systemColorScheme = action.payload;
      const isDark = state.theme.mode === 'dark' || 
        (state.theme.mode === 'auto' && systemColorScheme === 'dark');
      return {
        ...state,
        systemColorScheme,
        theme: createTheme(state.theme.mode, isDark),
      };
    }
    case 'TOGGLE_THEME': {
      const newMode = state.theme.isDark ? 'light' : 'dark';
      return {
        ...state,
        theme: createTheme(newMode, newMode === 'dark'),
      };
    }
    default:
      return state;
  }
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = Appearance.getColorScheme();
  
  const [state, dispatch] = useReducer(themeReducer, {
    theme: createTheme('auto', systemColorScheme === 'dark'),
    systemColorScheme,
  });

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
          dispatch({ type: 'SET_THEME_MODE', payload: storedMode as ThemeMode });
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    loadStoredTheme();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch({ type: 'SET_SYSTEM_COLOR_SCHEME', payload: colorScheme });
    });

    return () => subscription?.remove();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      dispatch({ type: 'SET_THEME_MODE', payload: mode });
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
      dispatch({ type: 'SET_THEME_MODE', payload: mode });
    }
  };

  const toggleTheme = async () => {
    const currentMode = state.theme.mode;
    const newMode = state.theme.isDark ? 'light' : 'dark';
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      dispatch({ type: 'TOGGLE_THEME' });
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
      dispatch({ type: 'TOGGLE_THEME' });
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: state.theme,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};