import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface SuccessAnimationProps {
  visible: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function SuccessAnimation({ 
  visible, 
  onComplete, 
  duration = 200 
}: SuccessAnimationProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const checkScaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animation sequence
      Animated.sequence([
        // Initial pop in
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
        ]),
        // Check mark appears
        Animated.spring(checkScaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        // Hold for a moment
        Animated.delay(50),
        // Fade out
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 50,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Reset values
        scaleAnim.setValue(0);
        opacityAnim.setValue(0);
        checkScaleAnim.setValue(0);
        onComplete?.();
      });
    }
  }, [visible, scaleAnim, opacityAnim, checkScaleAnim, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.checkContainer,
            {
              transform: [{ scale: checkScaleAnim }],
            },
          ]}
        >
          <Check size={32} color="white" strokeWidth={3} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2D5016',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D5016',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});