import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
  
  const createStyles = () => StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 25,
      backgroundColor: theme.colors.accentWeak,
    },
    segment: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      flex: 1,
    },
    activeSegment: {
      backgroundColor: theme.colors.accent,
    },
    segmentText: {
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    activeSegmentText: {
      color: theme.colors.textInverse,
    },
  });

  const dynamicStyles = createStyles();

  return (
    <View style={dynamicStyles.container}>
      {items.map((item) => {
        const active = value === item.value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={[
              dynamicStyles.segment,
              active && dynamicStyles.activeSegment
            ]}
            accessibilityState={{ selected: active }}
            accessibilityRole="button"
          >
            <Text style={[
              dynamicStyles.segmentText,
              active && dynamicStyles.activeSegmentText
            ]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

