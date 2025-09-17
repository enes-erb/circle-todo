import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  ScrollView, 
  Dimensions,
  Pressable,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react-native';

import { Todo, TodoGroup } from '../types';
import TodoItem from '../components/TodoItem';
import { storageService } from '../services/storage';
import { localizationService } from '../services/localization';
import { FAB } from '../components/ui/FAB';
import { useTheme } from '../contexts/ThemeContext';
import { useContentPadding } from '../hooks/useContentPadding';
import { logger } from '../utils/logger';
import { createFrostedCard } from '../utils/frostedGlass';

// Removed fixed width - using flexbox instead

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  todos: Todo[];
}

export default function CalendarScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const { contentPadding } = useContentPadding();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [todosData, groupsData] = await Promise.all([
        storageService.getTodos(),
        storageService.getGroups()
      ]);
      setTodos(todosData);
      setGroups(groupsData);
    } catch (error) {
      logger.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodosForDate = useCallback((date: Date): Todo[] => {
    return todos.filter(todo => 
      todo.dueDate && 
      todo.dueDate.toDateString() === date.toDateString()
    );
  }, [todos]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    
    // Fill in days from previous month to complete the first week
    const prevMonth = new Date(year, month, 0);
    const daysFromPrevMonth = firstDayOfWeek;
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        todos: getTodosForDate(date),
      });
    }
    
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        todos: getTodosForDate(date),
      });
    }
    
    const remainingSlots = 42 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        todos: getTodosForDate(date),
      });
    }
    
    return days;
  }, [currentDate, getTodosForDate]);

  const selectedDateTodos = useMemo(() => {
    return getTodosForDate(selectedDate);
  }, [selectedDate, todos]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTodo = () => {
    navigation.navigate('AddTodo', { selectedDate: selectedDate.toISOString() });
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      await storageService.updateTodo(id, { completed: !todo.completed });
      setTodos(prev => prev.map(t => 
        t.id === id ? { ...t, completed: !todo.completed } : t
      ));
    } catch (error) {
      logger.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await storageService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      logger.error('Failed to delete todo:', error);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarDay = (day: CalendarDay, index: number) => {
    const isSelected = day.date.toDateString() === selectedDate.toDateString();
    const hasTodos = day.todos.length > 0;
    const overdueCount = day.todos.filter(todo => 
      !todo.completed && todo.dueDate && new Date() > todo.dueDate
    ).length;

    const dayStyle = [
      styles.calendarDay,
      !day.isCurrentMonth && styles.inactiveDay,
    ];

    const dayNumberContainerStyle = [
      styles.dayNumberContainer,
      day.isToday && styles.todayDay,
      isSelected && styles.selectedDay,
    ];

    const textStyle = [
      styles.dayText,
      isSelected
        ? styles.selectedDayText
        : day.isToday
        ? styles.todayText
        : styles.normalDayText,
    ];

    return (
      <Pressable
        key={index}
        style={dayStyle}
        onPress={() => handleDateSelect(day.date)}
      >
        <View style={dayNumberContainerStyle}>
          <Text style={textStyle}>
            {day.date.getDate()}
          </Text>
        </View>
        
        {hasTodos && (
          <View style={styles.todoIndicators}>
            {overdueCount > 0 && (
              <View style={[styles.todoIndicator, styles.overdueTodo]} />
            )}
            {day.todos.filter(todo => !todo.completed).length > overdueCount && (
              <View style={[styles.todoIndicator, styles.pendingTodo]} />
            )}
            {day.todos.filter(todo => todo.completed).length > 0 && (
              <View style={[styles.todoIndicator, styles.completedTodo]} />
            )}
          </View>
        )}
      </Pressable>
    );
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      groups={groups}
      onToggleComplete={handleToggleComplete}
      onDelete={handleDeleteTodo}
    />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      marginTop: 16,
    },
    headerSection: {
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 16,
    },
    headerCard: {
      ...createFrostedCard(isDark),
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    calendarSection: {
      marginHorizontal: 20,
      marginBottom: 16,
    },
    calendarCard: {
      ...createFrostedCard(isDark),
      padding: 20,
    },
    monthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    monthNavButton: {
      padding: 8,
      borderRadius: theme.borderRadius.md,
      backgroundColor: 'transparent',
    },
    monthTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.textPrimary,
    },
    dayHeadersRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    dayHeader: {
      flex: 1,
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.textMuted,
      textAlign: 'center',
      paddingVertical: 8,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarDay: {
      width: '14.28%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
      position: 'relative',
    },
    dayNumberContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayDay: {
      backgroundColor: theme.colors.accentWeak,
    },
    selectedDay: {
      backgroundColor: theme.colors.accent,
    },
    inactiveDay: {
      opacity: 0.3,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '500',
    },
    selectedDayText: {
      color: theme.colors.textInverse,
    },
    todayText: {
      color: theme.colors.accent,
    },
    normalDayText: {
      color: theme.colors.textPrimary,
    },
    todoIndicators: {
      position: 'absolute',
      bottom: 4,
      flexDirection: 'row',
      gap: 2,
    },
    todoIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    overdueTodo: {
      backgroundColor: theme.colors.error,
    },
    pendingTodo: {
      backgroundColor: theme.colors.accent,
    },
    completedTodo: {
      backgroundColor: theme.colors.success,
    },
    tasksSection: {
      marginHorizontal: 20,
      marginBottom: 16,
    },
    tasksCard: {
      ...createFrostedCard(isDark),
      padding: 20,
    },
    tasksHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    tasksTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.textPrimary,
    },
    tasksBadge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
      minWidth: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tasksBadgeText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 12,
    },
    taskSeparator: {
      height: 8,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: contentPadding }}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>
              {localizationService.t('calendar.title')}
            </Text>
            <Text style={styles.headerSubtitle}>
              Plan your tasks
            </Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarCard}>
            {/* Month Header */}
            <View style={styles.monthHeader}>
              <Pressable 
                onPress={handlePrevMonth} 
                style={styles.monthNavButton}
              >
                <ChevronLeft size={24} color={theme.colors.textPrimary} strokeWidth={1.75} />
              </Pressable>
              
              <Text style={styles.monthTitle}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              
              <Pressable 
                onPress={handleNextMonth} 
                style={styles.monthNavButton}
              >
                <ChevronRight size={24} color={theme.colors.textPrimary} strokeWidth={1.75} />
              </Pressable>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeadersRow}>
              {dayNames.map(day => (
                <Text
                  key={day}
                  style={styles.dayHeader}
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map(renderCalendarDay)}
            </View>
          </View>
        </View>

        {/* Selected Date Tasks */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksCard}>
            <View style={styles.tasksHeader}>
              <Text style={styles.tasksTitle}>
                Tasks for {selectedDate.toLocaleDateString()}
              </Text>
              <View style={styles.tasksBadge}>
                <Text style={styles.tasksBadgeText}>
                  {selectedDateTodos.length}
                </Text>
              </View>
            </View>

            {selectedDateTodos.length === 0 ? (
              <View style={styles.emptyState}>
                <CalendarCheck size={48} color={theme.colors.border} strokeWidth={1.5} />
                <Text style={styles.emptyStateText}>
                  No tasks for this date
                </Text>
              </View>
            ) : (
              <FlatList
                data={selectedDateTodos}
                renderItem={renderTodoItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
                // Performance optimizations
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                initialNumToRender={5}
                windowSize={3}
                updateCellsBatchingPeriod={50}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <FAB onPress={handleAddTodo} />
    </SafeAreaView>
  );
}


