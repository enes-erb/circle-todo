import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TodoGroup } from '../types';
import { useTheme } from '../contexts/ThemeContext';
// Removed - using theme.* properties directly

interface GroupHeaderProps {
  group: TodoGroup;
  taskCount: number;
}

const GroupHeader = React.memo(({ group, taskCount }: GroupHeaderProps) => {
  const { theme, isDark } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
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
    groupIndicator: {
      width: 3,
      height: 20,
      borderRadius: 2,
      backgroundColor: group.color,
      marginRight: theme.spacing.sm,
      opacity: 0.8,
    },
    groupName: {
      fontSize: theme.typography.sizes.md,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      flex: 1,
      letterSpacing: -0.2,
    },
    taskCountBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      minWidth: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    taskCount: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: '600',
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  }), [theme, group.color, isDark]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={styles.groupIndicator} />
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
        </View>
        <View style={styles.taskCountBadge}>
          <Text style={styles.taskCount}>
            {taskCount}
          </Text>
        </View>
      </View>
    </View>
  );
});

GroupHeader.displayName = 'GroupHeader';

export default GroupHeader;