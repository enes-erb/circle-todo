import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { theme } = useTheme();
  
  const createStyles = () => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 4,
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

