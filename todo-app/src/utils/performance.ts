import { InteractionManager, Platform } from 'react-native';

/**
 * Utility functions for performance optimization in production builds
 */

/**
 * Delays execution until interaction is complete for better UX
 * Useful for heavy operations that should not block UI
 */
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(callback);
};

/**
 * Creates a debounced version of a function to prevent excessive calls
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Creates a throttled version of a function to limit call frequency
 * @param func Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Platform-specific optimization configurations
 */
export const PERFORMANCE_CONFIG = {
  // Optimized list configurations
  LIST_OPTIMIZATION: {
    windowSize: Platform.OS === 'ios' ? 10 : 5,
    initialNumToRender: Platform.OS === 'ios' ? 10 : 5,
    maxToRenderPerBatch: Platform.OS === 'ios' ? 5 : 3,
    updateCellsBatchingPeriod: 50,
    removeClippedSubviews: Platform.OS === 'android',
  },
  
  // Image loading optimizations
  IMAGE_OPTIMIZATION: {
    resizeMode: 'cover' as const,
    progressiveRenderingEnabled: true,
    shouldRasterizeIOS: true,
    renderToHardwareTextureAndroid: true,
  },
  
  // Navigation optimizations
  NAVIGATION_OPTIMIZATION: {
    lazy: true,
    unmountOnBlur: false, // Keep screens mounted for faster switching
    freezeOnBlur: true, // Freeze inactive screens to save resources
  },
  
  // Animation optimizations
  ANIMATION_CONFIG: {
    useNativeDriver: true,
    duration: Platform.OS === 'ios' ? 300 : 250,
  },
} as const;