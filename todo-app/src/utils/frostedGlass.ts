import { ViewStyle } from 'react-native';

export interface FrostedGlassOptions {
  opacity?: number;
  blur?: number;
  tint?: 'light' | 'dark' | 'auto';
  borderRadius?: number;
  shadowIntensity?: 'light' | 'medium' | 'strong';
}

/**
 * Creates a frosted glass effect that mimics real milky/frosted glass
 * Much more opaque than traditional glassmorphism
 */
export const createFrostedGlass = (
  isDark: boolean,
  options: FrostedGlassOptions = {}
): ViewStyle => {
  const {
    opacity = 0.85,
    borderRadius = 12,
    shadowIntensity = 'medium',
  } = options;

  const baseColor = isDark ? '32, 34, 42' : '248, 248, 252';
  
  const shadowConfig = {
    light: {
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    medium: {
      shadowOpacity: isDark ? 0.3 : 0.12,
      shadowRadius: 12,
      elevation: 5,
    },
    strong: {
      shadowOpacity: isDark ? 0.4 : 0.18,
      shadowRadius: 16,
      elevation: 8,
    },
  };

  const shadow = shadowConfig[shadowIntensity];

  return {
    backgroundColor: `rgba(${baseColor}, ${opacity})`,
    borderRadius,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
    elevation: shadow.elevation,
  };
};

/**
 * Creates a minimal frosted glass card
 */
export const createFrostedCard = (isDark: boolean): ViewStyle => {
  return createFrostedGlass(isDark, {
    opacity: 0.85,
    borderRadius: 12,
    shadowIntensity: 'light',
  });
};

/**
 * Creates a prominent frosted glass surface
 */
export const createFrostedSurface = (isDark: boolean): ViewStyle => {
  return createFrostedGlass(isDark, {
    opacity: 0.90,
    borderRadius: 16,
    shadowIntensity: 'medium',
  });
};

/**
 * Creates a floating frosted glass modal/overlay
 */
export const createFrostedModal = (isDark: boolean): ViewStyle => {
  return createFrostedGlass(isDark, {
    opacity: 0.92,
    borderRadius: 20,
    shadowIntensity: 'strong',
  });
};