import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CheckCircle2, Clock } from 'lucide-react-native';

interface EmptyStateProps {
  filter: 'pending' | 'completed';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const { theme, isDark } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 32,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      fontSize: 20,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });

  if (filter === 'pending') {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <CheckCircle2 size={60} color={theme.colors.accent} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Keine offenen Aufgaben</Text>
        <Text style={styles.subtitle}>... cheers! 🫰🏻</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Clock size={60} color={theme.colors.accent} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Keine erledigten Aufgaben</Text>
      <Text style={styles.subtitle}>Abgehakte Tasks{'\n'}verschwinden nach 30 Sekunden</Text>
    </View>
  );
};