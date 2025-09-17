import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { CheckCircle2, Circle, X, Calendar, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Todo, TodoGroup } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getFormattedDate } from '../utils/taskSorting';
import { createFrostedCard } from '../utils/frostedGlass';

interface TodoItemProps {
  todo: Todo;
  groups: TodoGroup[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isCompleting?: boolean;
}

const getPriorityColor = (priority: 'low' | 'medium' | 'high', isDark: boolean) => {
  const colors = {
    low: '#22C55E',    // Grün
    medium: '#EAB308', // Gelb  
    high: '#EF4444',   // Rot
  };
  return colors[priority];
};

const TodoItemComponent = React.memo(({ todo, groups, onToggleComplete, onDelete, isCompleting = false }: TodoItemProps) => {
  const { theme, isDark } = useTheme();
  const group = React.useMemo(() => groups.find(g => g.id === todo.groupId), [groups, todo.groupId]);
  const isOverdue = React.useMemo(() => 
    todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed,
    [todo.dueDate, todo.completed]
  );
  
  // Animation values
  const [strikethroughAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(1));
  const [fadeAnim] = React.useState(new Animated.Value(1));
  
  React.useEffect(() => {
    if (isCompleting) {
      // Start strikethrough and fade animation
      Animated.parallel([
        Animated.timing(strikethroughAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      strikethroughAnim.setValue(0);
      fadeAnim.setValue(1);
    }
  }, [isCompleting, strikethroughAnim, fadeAnim]);

  const handlePressIn = React.useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = React.useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [scaleAnim]);

  const handleToggleComplete = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleComplete(todo.id);
  }, [onToggleComplete, todo.id]);

  const handleDelete = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(todo.id);
  }, [onDelete, todo.id]);

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      ...createFrostedCard(isDark),
      marginBottom: theme.spacing.sm,
    },
    innerContainer: {
      padding: theme.spacing.md,
    },
    overdue: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.error,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    checkbox: {
      marginRight: theme.spacing.md,
      marginTop: 2,
    },
    textContent: {
      flex: 1,
    },
    titleContainer: {
      position: 'relative',
    },
    title: {
      fontSize: theme.typography.sizes.md,
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    completedTitle: {
      color: theme.colors.textMuted,
      textDecorationLine: 'line-through',
    },
    completingTitle: {
      color: theme.colors.textSecondary,
    },
    overdueTitle: {
      color: theme.colors.error,
    },
    strikethrough: {
      position: 'absolute',
      top: '50%',
      left: 0,
      height: 1.5,
      backgroundColor: theme.colors.textMuted,
      transform: [{ translateY: -1 }],
    },
    metadata: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      gap: theme.spacing.xs,
    },
    groupDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    metadataText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    overdueText: {
      color: theme.colors.error,
    },
    deleteButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      marginLeft: theme.spacing.sm,
    },
    deleteButtonPressed: {
      backgroundColor: theme.colors.errorBg,
    },
  }), [theme, isDark]);

  return (
    <Animated.View style={[
      { 
        transform: [{ scale: scaleAnim }],
        opacity: todo.completed ? fadeAnim.interpolate({
          inputRange: [0.5, 1],
          outputRange: [0.5, 0.6]
        }) : fadeAnim
      }
    ]}>
      <Pressable 
        onPress={handleToggleComplete}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
        accessibilityRole="button"
        accessibilityLabel={`${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${todo.title}`}
        accessibilityHint={`Task ${todo.completed ? 'completed' : 'pending'}${isOverdue ? ', overdue' : ''}`}
      >
        
        <View style={styles.innerContainer}>
          <View style={styles.content}>
            <View style={styles.leftContent}>
              <View style={styles.checkbox}>
                {todo.completed ? (
                  <CheckCircle2 
                    size={20} 
                    color={theme.colors.success} 
                    strokeWidth={2} 
                  />
                ) : (
                  <Circle 
                    size={20} 
                    color={theme.colors.textMuted} 
                    strokeWidth={1.5} 
                  />
                )}
              </View>
              
              <View style={styles.textContent}>
                <View style={styles.titleContainer}>
                  <Text 
                    style={[
                      styles.title,
                      todo.completed && styles.completedTitle,
                      isCompleting && styles.completingTitle
                    ]}
                    numberOfLines={2}
                  >
                    {todo.title}
                  </Text>
                  {isCompleting && (
                    <Animated.View
                      style={[
                        styles.strikethrough,
                        {
                          width: strikethroughAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                          })
                        }
                      ]}
                    />
                  )}
                </View>
                
                {(todo.dueDate || todo.priority) && (
                  <View style={styles.metadata}>
                    {todo.dueDate && (
                      <View style={styles.metadataItem}>
                        {isOverdue ? (
                          <AlertCircle size={12} color={theme.colors.error} strokeWidth={2} />
                        ) : (
                          <Calendar size={12} color={theme.colors.textMuted} strokeWidth={1.5} />
                        )}
                        <Text style={[
                          styles.metadataText,
                          isOverdue && styles.overdueText
                        ]}>
                          {getFormattedDate(new Date(todo.dueDate))}
                        </Text>
                      </View>
                    )}
                    
                    {todo.priority && !todo.completed && (
                      <View style={[
                        styles.metadataItem,
                        { 
                          backgroundColor: getPriorityColor(todo.priority, isDark) + '20',
                        }
                      ]}>
                        <Text style={[
                          styles.metadataText,
                          { color: getPriorityColor(todo.priority, isDark) }
                        ]}>
                          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
            
            <Pressable 
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed
              ]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={`Delete task: ${todo.title}`}
            >
              <X size={16} color={theme.colors.textMuted} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.completed === nextProps.todo.completed &&
    prevProps.todo.title === nextProps.todo.title &&
    prevProps.todo.priority === nextProps.todo.priority &&
    prevProps.todo.dueDate === nextProps.todo.dueDate &&
    prevProps.todo.groupId === nextProps.todo.groupId &&
    prevProps.isCompleting === nextProps.isCompleting
  );
});

TodoItemComponent.displayName = 'TodoItem';

export default TodoItemComponent;