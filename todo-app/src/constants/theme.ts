export interface Theme {
  colors: {
    // Main accent color
    accent: string;
    accentWeak: string;
    
    // Core colors
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceSecondary: string;
    border: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    
    // Status colors
    success: string;
    successBg: string;
    error: string;
    errorBg: string;
    danger: string;
    warning: string;
    warningBg: string;
    info: string;
    infoBg: string;
  };
  
  
  // Typography system
  typography: {
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    weights: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  
  // Border radius system
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  
  // Spacing system
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export const lightTheme: Theme = {
  colors: {
    accent: '#007AFF',
    accentWeak: '#E3F2FF',
    
    background: '#FFFFFF',
    backgroundSecondary: '#FFFFFF',
    surface: 'rgba(248, 248, 252, 0.85)',
    surfaceSecondary: 'rgba(240, 242, 247, 0.90)',
    border: 'rgba(0, 0, 0, 0.08)',
    
    textPrimary: '#000000',
    textSecondary: '#333333',
    textMuted: '#666666',
    textInverse: '#FFFFFF',
    
    success: '#22C55E',
    successBg: 'rgba(34, 197, 94, 0.1)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    danger: '#EF4444',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.1)',
  },
  
  
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const darkTheme: Theme = {
  colors: {
    accent: '#007AFF',
    accentWeak: '#1A1A1A',
    
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    surface: 'rgba(32, 34, 42, 0.85)',
    surfaceSecondary: 'rgba(28, 30, 36, 0.90)',
    border: 'rgba(255, 255, 255, 0.12)',
    
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textMuted: '#999999',
    textInverse: '#000000',
    
    success: '#34D399',
    successBg: 'rgba(52, 211, 153, 0.1)',
    error: '#F87171',
    errorBg: 'rgba(248, 113, 113, 0.1)',
    danger: '#F87171',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.1)',
    info: '#60A5FA',
    infoBg: 'rgba(96, 165, 250, 0.1)',
  },
  
  
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const GROUP_COLORS = [
  { name: 'Forest Green', hex: '#2D5016', darkHex: '#4ADE80' },
  { name: 'Ocean Blue', hex: '#1976D2', darkHex: '#60A5FA' },
  { name: 'Sunset Orange', hex: '#FF9800', darkHex: '#FBBF24' },
  { name: 'Purple', hex: '#9C27B0', darkHex: '#C084FC' },
  { name: 'Red', hex: '#F44336', darkHex: '#F87171' },
  { name: 'Teal', hex: '#00BCD4', darkHex: '#22D3EE' },
  { name: 'Brown', hex: '#795548', darkHex: '#A78BFA' },
  { name: 'Blue Grey', hex: '#607D8B', darkHex: '#94A3B8' },
  { name: 'Pink', hex: '#E91E63', darkHex: '#F472B6' },
  { name: 'Indigo', hex: '#3F51B5', darkHex: '#818CF8' },
  { name: 'Cyan', hex: '#009688', darkHex: '#06B6D4' },
  { name: 'Deep Orange', hex: '#FF5722', darkHex: '#FB923C' },
];