import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { CheckCircle2, Circle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Todo, TodoGroup } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getFormattedDate } from '../utils/taskSorting';

interface TodoItemProps {
  todo: Todo;
  groups: TodoGroup[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isCompleting?: boolean;
}

const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'low': return '🟢';
    case 'medium': return '🟡';
    case 'high': return '🔴';
    default: return '';
  }
};

export default function TodoItem({ todo, groups, onToggleComplete, onDelete, isCompleting = false }: TodoItemProps) {
  const { theme } = useTheme();
  const group = groups.find(g => g.id === todo.groupId);
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
  
  // Animation for strikethrough effect
  const [strikethroughAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (isCompleting) {
      // Start strikethrough animation
      Animated.timing(strikethroughAnim, {
        toValue: 1,
        duration: 1000, // Animation over 1 second
        useNativeDriver: false,
      }).start();
    } else {
      strikethroughAnim.setValue(0);
    }
  }, [isCompleting, strikethroughAnim]);

  const handleToggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleComplete(todo.id);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(todo.id);
  };

  // Using the shared formatting function from utils

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    overdue: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.danger,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    checkbox: {
      marginRight: 12,
    },
    textContent: {
      flex: 1,
    },
    titleContainer: {
      position: 'relative',
    },
    title: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    completedTitle: {
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    completingTitle: {
      color: theme.colors.textSecondary,
    },
    overdueTitle: {
      color: theme.colors.danger,
    },
    strikethrough: {
      position: 'absolute',
      top: '50%',
      left: 0,
      height: 2,
      backgroundColor: theme.colors.textSecondary,
      transform: [{ translateY: -1 }],
    },
    metadata: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    groupInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    groupDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    dateInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    separator: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginRight: 8,
    },
    metadataText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    overdueText: {
      color: theme.colors.danger,
      fontWeight: '500',
    },
    deleteButton: {
      marginLeft: 12,
      padding: 8,
      borderRadius: 8,
    },
  });

  return (
    <Pressable 
      onPress={handleToggleComplete}
      style={[
        styles.container,
        { opacity: todo.completed ? 0.6 : 1 },
        isOverdue && styles.overdue
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${todo.title}`}
      accessibilityHint={`Task ${todo.completed ? 'completed' : 'pending'}${isOverdue ? ', overdue' : ''}`}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={styles.checkbox}>
            {todo.completed ? (
              <CheckCircle2 
                size={22} 
                color={theme.colors.success} 
                strokeWidth={1.75} 
              />
            ) : (
              <Circle 
                size={22} 
                color={theme.colors.textSecondary} 
                strokeWidth={1.75} 
              />
            )}
          </View>
          
          <View style={styles.textContent}>
            <View style={styles.titleContainer}>
              <Text 
                style={[
                  styles.title,
                  todo.completed && styles.completedTitle,
                  isOverdue && styles.overdueTitle,
                  isCompleting && styles.completingTitle
                ]}
                numberOfLines={2}
              >
{todo.priority && `${getPriorityIcon(todo.priority)} `}{todo.title}
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
            
            {(group || todo.dueDate) && (
              <View style={styles.metadata}>
                {group && (
                  <View style={styles.groupInfo}>
                    <View 
                      style={[styles.groupDot, { backgroundColor: group.color }]}
                    />
                    <Text style={styles.metadataText}>
                      {group.name}
                    </Text>
                  </View>
                )}
                
                {todo.dueDate && (
                  <View style={styles.dateInfo}>
                    {group && <Text style={styles.separator}>•</Text>}
                    <Text style={[
                      styles.metadataText,
                      isOverdue && styles.overdueText
                    ]}>
                      {getFormattedDate(new Date(todo.dueDate))}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        
        <Pressable 
          onPress={handleDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={`Delete task: ${todo.title}`}
        >
          <X size={18} color={theme.colors.textSecondary} strokeWidth={1.75} />
        </Pressable>
      </View>
    </Pressable>
  );
}

