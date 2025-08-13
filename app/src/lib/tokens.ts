// Design tokens inspired by shadcn/ui
export const colors = {
  // Base colors
  background: '#FFFFFF',
  foreground: '#0F172A',
  
  // Muted colors
  muted: {
    DEFAULT: '#F1F5F9',
    foreground: '#64748B',
  },
  
  // Accent colors
  accent: {
    DEFAULT: '#F1F5F9',
    foreground: '#0F172A',
  },
  
  // Primary colors
  primary: {
    DEFAULT: '#0F172A',
    foreground: '#F8FAFC',
  },
  
  // Secondary colors
  secondary: {
    DEFAULT: '#F1F5F9',
    foreground: '#0F172A',
  },
  
  // Destructive colors
  destructive: {
    DEFAULT: '#EF4444',
    foreground: '#F8FAFC',
  },
  
  // Border and input
  border: '#E2E8F0',
  input: '#E2E8F0',
  ring: '#94A3B8',
  
  // iOS style colors
  blue: '#007AFF',
  green: '#34C759',
  orange: '#FF9500',
  red: '#FF3B30',
  purple: '#AF52DE',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const borderRadius = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  
  // Font weights
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
};
