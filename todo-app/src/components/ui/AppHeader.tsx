import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { theme, isDark } = useTheme();
  
  const createStyles = () => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: '400',
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs / 2,
    },
  });

  const dynamicStyles = createStyles();

  return (
    <SafeAreaView edges={['top']} style={dynamicStyles.container}>
      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text style={dynamicStyles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}