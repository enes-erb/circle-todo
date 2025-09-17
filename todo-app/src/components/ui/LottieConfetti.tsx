import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieConfettiProps {
  start?: boolean;
  onComplete?: () => void;
}

export const LottieConfetti = React.memo(({
  start = false,
  onComplete
}: LottieConfettiProps) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (start && animationRef.current) {
      // Reset and play the animation
      animationRef.current.reset();
      animationRef.current.play();
    }
  }, [start]);

  const handleAnimationFinish = React.useCallback(() => {
    if (onComplete) {
      // Small delay to ensure clean completion
      setTimeout(() => {
        onComplete();
      }, 100);
    }
  }, [onComplete]);

  if (!start) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <LottieView
        ref={animationRef}
        source={require('../../../assets/animations/thumbs-up.json')}
        style={styles.animation}
        loop={false}
        autoPlay={false}
        onAnimationFinish={handleAnimationFinish}
        resizeMode="contain"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Highest z-index to ensure visibility
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});