// Legacy static colors for backward compatibility
export const Colors = {
  // Primary brand colors - refined purple gradient
  primary: '#A05FFF',
  primaryLight: '#B57FFF',
  primaryDark: '#8A3FFF',
  primaryDeep: '#6B2FE5',
  
  // Secondary brand colors - complementary blues
  secondary: '#3933C6',
  secondaryLight: '#4F46E5',
  secondaryDark: '#2D1B9B',
  
  // Accent colors
  accent: '#FF6B9D',
  accentLight: '#FF8BB3',
  accentDark: '#E5527A',
  
  // Surfaces and backgrounds
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FEFEFE',
  surfaceDepressed: '#F5F7FA',
  
  // Glass morphism colors
  glass: {
    background: 'rgba(255, 255, 255, 0.15)',
    backgroundSecondary: 'rgba(255, 255, 255, 0.10)',
    border: 'rgba(255, 255, 255, 0.20)',
    shadow: 'rgba(160, 95, 255, 0.20)',
  },
  
  // Purple spectrum - refined
  purple: {
    50: '#FAF7FF',
    100: '#F3EDFF',
    200: '#E8D8FF',
    300: '#D4B8FF',
    400: '#B57FFF',
    500: '#A05FFF',
    600: '#8A3FFF',
    700: '#7228E8',
    800: '#5A1FB5',
    900: '#471A8C',
  },
  
  // Blue spectrum - for secondary elements
  blue: {
    50: '#F0F4FF',
    100: '#E0EAFF',
    200: '#C7D8FF',
    300: '#9FB8FF',
    400: '#6B8AFF',
    500: '#4F46E5',
    600: '#3933C6',
    700: '#2D1B9B',
    800: '#241770',
    900: '#1C1458',
  },
  
  // Gray spectrum - improved contrast
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
  
  // Text colors - enhanced readability
  text: {
    primary: '#18181B',
    secondary: '#52525B',
    tertiary: '#A1A1AA',
    inverse: '#FFFFFF',
    muted: '#71717A',
    disabled: '#D4D4D8',
    onPrimary: '#FFFFFF',
    onSurface: '#18181B',
  },
  
  // Status colors - vibrant and accessible
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
  
  // Gradient definitions
  gradients: {
    primary: ['#A05FFF', '#3933C6'],
    primaryVertical: ['#A05FFF', '#8A3FFF'],
    secondary: ['#4F46E5', '#2563EB'],
    accent: ['#FF6B9D', '#A05FFF'],
    success: ['#16A34A', '#22C55E'],
    warning: ['#EA580C', '#FB923C'],
    error: ['#DC2626', '#EF4444'],
    glass: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'],
    darkGlass: ['rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.05)'],
    night: ['#1a1a2e', '#16213e', '#0f3460'],
    sunset: ['#A05FFF', '#FF6B9D', '#FFA726'],
  },
  
  // Shadow colors
  shadows: {
    primary: 'rgba(160, 95, 255, 0.25)',
    secondary: 'rgba(57, 51, 198, 0.25)',
    neutral: 'rgba(0, 0, 0, 0.10)',
    glass: 'rgba(160, 95, 255, 0.15)',
  },
};

// Design system utilities
export const designTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
  
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },
};