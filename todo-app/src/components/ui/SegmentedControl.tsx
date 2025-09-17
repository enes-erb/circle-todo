import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
// Removed - using theme.* properties directly
import * as Haptics from 'expo-haptics';

interface SegmentItem {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  items: SegmentItem[];
}

export function SegmentedControl({ value, onChange, items }: SegmentedControlProps) {
  const { theme, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);
  const [containerWidth, setContainerWidth] = useState(300);
  
  useEffect(() => {
    const activeIndex = items.findIndex(item => item.value === value);
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [value, items, slideAnim]);
  
  const handlePress = (itemValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(itemValue);
  };

  const onLayout = (event: any) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };
  
  const createStyles = () => StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 3,
      borderRadius: theme.borderRadius.md,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    slideIndicator: {
      position: 'absolute',
      top: 3,
      bottom: 3,
      left: 3,
      borderRadius: theme.borderRadius.md - 2,
      backgroundColor: theme.colors.accent,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    segment: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md - 2,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentText: {
      fontSize: theme.typography.sizes.sm,
      textAlign: 'center',
      fontWeight: '500',
      color: theme.colors.textSecondary,
      zIndex: 2,
    },
    activeSegmentText: {
      color: theme.colors.textInverse,
      fontWeight: '600',
    },
  });

  const dynamicStyles = createStyles();
  const segmentWidth = 100 / items.length;

  return (
    <View style={dynamicStyles.container} onLayout={onLayout}>
      <Animated.View 
        style={[
          dynamicStyles.slideIndicator,
          {
            width: `${segmentWidth}%`,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: items.map((_, index) => index),
                outputRange: items.map((_, index) => {
                  return (containerWidth / items.length) * index;
                }),
              }),
            }],
          },
        ]}
      />
      
      {items.map((item) => {
        const active = value === item.value;
        return (
          <Pressable
            key={item.value}
            onPress={() => handlePress(item.value)}
            style={dynamicStyles.segment}
            accessibilityState={{ selected: active }}
            accessibilityRole="button"
          >
            <Animated.Text 
              style={[
                dynamicStyles.segmentText,
                active && dynamicStyles.activeSegmentText,
              ]}
            >
              {item.label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
}