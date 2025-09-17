import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface SimpleNotificationProps {
  visible: boolean;
  message: string;
  onComplete?: () => void;
}

export function SimpleNotification({ 
  visible, 
  message,
  onComplete
}: SimpleNotificationProps) {
  const { theme } = useTheme();
  const translateYAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Slide down from top
      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 2 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateYAnim, {
            toValue: -100,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          translateYAnim.setValue(-100);
          opacityAnim.setValue(0);
          onComplete?.();
        });
      }, 2000);
    }
  }, [visible, translateYAnim, opacityAnim, onComplete]);

  if (!visible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      zIndex: 1000,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    text: {
      fontSize: theme.typography.sizes.md,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <View style={styles.icon}>
        <Check size={16} color={theme.colors.accent} strokeWidth={2} />
      </View>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}