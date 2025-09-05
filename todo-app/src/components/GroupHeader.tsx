import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TodoGroup } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface GroupHeaderProps {
  group: TodoGroup;
  taskCount: number;
}

export default function GroupHeader({ group, taskCount }: GroupHeaderProps) {
  const { theme, isDark } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      paddingVertical: 12,
      paddingHorizontal: 4,
      marginTop: 16,
      marginBottom: 8,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    groupDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
      backgroundColor: group.color,
    },
    groupName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    taskCount: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 24,
      textAlign: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginTop: 8,
      opacity: 0.5,
    },
  }), [theme, group.color]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={styles.groupDot} />
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
        </View>
        <Text style={styles.taskCount}>
          {taskCount}
        </Text>
      </View>
      <View style={styles.divider} />
    </View>
  );
}