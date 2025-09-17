import React from 'react';
import { Pressable, PressableProps, StyleSheet, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigationHeight } from '../../contexts/NavigationHeightContext';
// Removed - using theme.* properties directly

interface FABProps extends Omit<PressableProps, 'style'> {
  onPress?: () => void;
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  style?: any;
}

export const FAB = React.memo(({ onPress, icon: Icon = Plus, style, ...props }: FABProps) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: navHeight } = useNavigationHeight();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = React.useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [scaleAnim]);
  
  const handlePressOut = React.useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [scaleAnim]);
  
  const handlePress = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  }, [onPress]);

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: navHeight + insets.bottom + 16, // Dynamic navigation height + safe area + spacing
      right: 24,
      borderRadius: 28,
      backgroundColor: theme.colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      // Glassmorphism effect
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    },
    pressed: {
      backgroundColor: theme.colors.accent,
      opacity: 0.8,
    },
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.pressed,
          style
        ]}
        accessibilityRole="button"
        accessibilityLabel="Neue Aufgabe"
        {...props}
      >
        <Icon size={24} color={theme.colors.textInverse} strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
});

FAB.displayName = 'FAB';