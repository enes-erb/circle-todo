import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface FABProps extends Omit<PressableProps, 'style'> {
  onPress?: () => void;
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  style?: any;
}

export function FAB({ onPress, icon: Icon = Plus, style, ...props }: FABProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.fab, style]}
      accessibilityRole="button"
      accessibilityLabel="Neue Aufgabe"
      {...props}
    >
      <Icon size={22} color="white" strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    backgroundColor: '#2D5016',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});