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
    error: string;
    danger: string;
    warning: string;
    info: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    accent: '#2D5016',
    accentWeak: '#E8F5E8',
    
    background: '#F8F9FA',
    backgroundSecondary: '#F1F3F4',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    border: '#E6E8EB',
    
    textPrimary: '#0B0F14',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    success: '#22C55E',
    error: '#EF4444',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

export const darkTheme: Theme = {
  colors: {
    accent: '#4ADE80', // Lighter green for dark mode
    accentWeak: '#1F2937',
    
    background: '#111827',
    backgroundSecondary: '#0F172A',
    surface: '#1F2937',
    surfaceSecondary: '#374151',
    border: '#374151',
    
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textInverse: '#0B0F14',
    
    success: '#34D399',
    error: '#F87171',
    danger: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
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