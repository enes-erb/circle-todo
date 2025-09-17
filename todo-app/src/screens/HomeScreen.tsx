import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  Animated,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Search, Plus } from 'lucide-react-native';
import { LottieConfetti } from '../components/ui/LottieConfetti';
import { Todo, TodoGroup } from '../types';
import { storageService } from '../services/storage';
import { localizationService } from '../services/localization';
import { AppHeader } from '../components/ui/AppHeader';
import { TextField } from '../components/ui/TextField';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { FAB } from '../components/ui/FAB';
import { InlineBanner } from '../components/ui/InlineBanner';
import { useTheme } from '../contexts/ThemeContext';
import { useContentPadding } from '../hooks/useContentPadding';
import TodoItem from '../components/TodoItem';
import GroupHeader from '../components/GroupHeader';
import { sortAndGroupTasks, SortedItem } from '../utils/taskSorting';
import { logger } from '../utils/logger';
import { debounce } from '../utils/performance';
import { EmptyState } from '../components/EmptyState';
import { SimpleNotification } from '../components/ui/SimpleNotification';
// Removed - using theme.* properties directly

type FilterType = 'pending' | 'completed';

export default function HomeScreen({ navigation, route }: any) {
  const { theme, isDark } = useTheme();
  const { contentPadding } = useContentPadding();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const celebrationAnimation = useState(new Animated.Value(0))[0];
  const celebrationScale = useState(new Animated.Value(0.8))[0];
  
  // Auto-delete tracking for completed todos
  const completionTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Completion animation tracking
  const [completingTodos, setCompletingTodos] = useState<Set<string>>(new Set());
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Handle navigation params for notifications
  useEffect(() => {
    if (route.params?.showNotification) {
      setNotificationMessage(route.params.showNotification);
      setShowNotification(true);
      // Clear the param to avoid showing again
      navigation.setParams({ showNotification: undefined });
    }
  }, [route.params?.showNotification, navigation]);

  // Debounced search update
  const updateDebouncedSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    updateDebouncedSearch(searchQuery);
  }, [searchQuery, updateDebouncedSearch]);

  const loadData = useCallback(async () => {
    try {
      const [todosData, groupsData] = await Promise.all([
        storageService.getTodos(),
        storageService.getGroups(),
      ]);
      setTodos(todosData);
      setGroups(groupsData);
    } catch (error) {
      logger.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesFilter = 
        (filter === 'completed' && todo.completed) ||
        (filter === 'pending' && !todo.completed);
      
      const matchesSearch = todo.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [todos, filter, debouncedSearchQuery]);

  // Get sorted and grouped items for display
  const sortedItems = useMemo(() => {
    return sortAndGroupTasks(filteredTodos, groups);
  }, [filteredTodos, groups]);

  const completedTodos = todos.filter(todo => todo.completed).length;
  const totalTodos = todos.length;
  const pendingTodos = totalTodos - completedTodos;

  const handleToggleComplete = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const wasCompleted = todo.completed;

      if (!wasCompleted) {
        // Todo is being completed - show completion animation first
        setCompletingTodos(prev => new Set([...prev, id]));
        
        // Add haptic feedback immediately
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Wait 3 seconds with strikethrough animation, then actually complete
        setTimeout(async () => {
          try {
            const updatedTodo = { completed: true, completedAt: new Date() };
            await storageService.updateTodo(id, updatedTodo);
            
            setTodos(prevTodos => 
              prevTodos.map(t => {
                if (t.id === id) {
                  return { ...t, completed: true, completedAt: new Date() };
                }
                return t;
              })
            );

            // Remove from completing set
            setCompletingTodos(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });

            // Start auto-delete timer
            const timer = setTimeout(() => {
              handleAutoDelete(id);
            }, 30000);
            
            completionTimersRef.current.set(id, timer);

            // Check if all todos are completed for celebration
            const updatedTodos = todos.map(t => t.id === id ? { ...t, completed: true } : t);
            const allCompleted = updatedTodos.every(t => t.completed);
            if (allCompleted && updatedTodos.length > 0) {
              triggerCelebration();
            }
          } catch (error) {
            logger.error('Failed to complete todo:', error);
            // Remove from completing set on error
            setCompletingTodos(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          }
        }, 1000); // 1 second delay
      } else {
        // Todo is being uncompleted - immediate action
        const updatedTodo = { completed: false };
        await storageService.updateTodo(id, updatedTodo);
        
        setTodos(prevTodos => 
          prevTodos.map(t => {
            if (t.id === id) {
              const { completedAt, ...todoWithoutCompletedAt } = t;
              return { ...todoWithoutCompletedAt, completed: false };
            }
            return t;
          })
        );

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Cancel auto-delete timer
        const timer = completionTimersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          completionTimersRef.current.delete(id);
        }
      }
    } catch (error) {
      logger.error('Failed to toggle todo:', error);
    }
  };

  const handleAutoDelete = async (id: string) => {
    try {
      await storageService.deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(t => t.id !== id));
      completionTimersRef.current.delete(id);
    } catch (error) {
      logger.error('Failed to auto-delete todo:', error);
    }
  };

  const handleConfettiComplete = useCallback(() => {
    // Only update state if confetti is currently showing
    // This prevents redundant state updates and potential loops
    setShowConfetti(current => {
      if (current) {
        return false;
      }
      return current; // No state change if already false
    });
  }, []);

  const handleDeleteTodo = async (id: string) => {
    Alert.alert(
      localizationService.t('todos.deleteConfirm'),
      '',
      [
        { text: localizationService.t('common.cancel'), style: 'cancel' },
        {
          text: localizationService.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel auto-delete timer if exists
              const timer = completionTimersRef.current.get(id);
              if (timer) {
                clearTimeout(timer);
                completionTimersRef.current.delete(id);
              }
              
              await storageService.deleteTodo(id);
              setTodos(prevTodos => prevTodos.filter(t => t.id !== id));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
              logger.error('Failed to delete todo:', error);
            }
          },
        },
      ]
    );
  };

  const triggerCelebration = () => {
    // Prevent multiple simultaneous celebrations
    if (celebrationVisible || showConfetti) {
      return;
    }
    
    setCelebrationVisible(true);
    setShowConfetti(true);
    
    // Strong haptic feedback when all tasks are completed
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Animated.parallel([
      Animated.timing(celebrationAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Remove the setTimeout that conflicts with onComplete callback
    // Let the CustomConfetti component handle its own completion via onComplete
    
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(celebrationAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationScale, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCelebrationVisible(false);
      });
    }, 2500);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderSortedItem = useCallback(({ item }: { item: SortedItem }) => {
    if (item.type === 'group_header') {
      // Count tasks in this group
      const groupTaskCount = sortedItems.filter(
        sortedItem => sortedItem.type === 'task' && sortedItem.group?.id === item.group.id
      ).length;
      
      return (
        <GroupHeader 
          group={item.group} 
          taskCount={groupTaskCount}
        />
      );
    } else {
      // Render todo item
      return (
        <TodoItem
          todo={item.task}
          groups={groups}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
          isCompleting={completingTodos.has(item.task.id)}
        />
      );
    }
  }, [sortedItems, groups, handleToggleComplete, handleDeleteTodo, completingTodos]);

  const filterItems = [
    { value: 'pending', label: `${localizationService.t('todos.pending')} (${pendingTodos})` },
    { value: 'completed', label: `${localizationService.t('todos.completed')} (${completedTodos})` },
  ];

  const renderEmptyList = () => <EmptyState filter={filter} />;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      gap: 16,
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 24,
      backgroundColor: theme.colors.background,
    },
    celebrationOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    },
    celebrationCard: {
      backgroundColor: isDark ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderRadius: 20,
      padding: 32,
      marginHorizontal: 32,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    celebrationEmoji: {
      fontSize: 48,
      textAlign: 'center',
      marginBottom: 8,
    },
    celebrationTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    celebrationSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  }), [theme]);

  return (
    <View style={styles.container}>
      <AppHeader 
        title={localizationService.t('app.title')}
        subtitle={localizationService.t('app.tagline')}
      />

      <View style={styles.searchContainer}>
        <TextField
          placeholder={localizationService.t('todos.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={Search}
        />

        <SegmentedControl
          value={filter}
          onChange={(value) => setFilter(value as FilterType)}
          items={filterItems}
        />
      </View>

      <View style={styles.listContainer}>
        {filter === 'completed' && filteredTodos.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <InlineBanner
              title="Auto-Delete Info"
              message="Completed tasks are automatically deleted after 30 seconds"
              variant="info"
              showIcon={true}
            />
          </View>
        )}
        
        <FlatList
          data={sortedItems}
          renderItem={renderSortedItem}
          keyExtractor={(item) => {
            if (item.type === 'group_header') {
              return `group_${item.group.id}`;
            } else {
              return `task_${item.task.id}`;
            }
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={{ paddingBottom: contentPadding }}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          disableVirtualization={false}
        />
      </View>

      {celebrationVisible && (
        <Animated.View 
          style={[
            styles.celebrationOverlay,
            {
              opacity: celebrationAnimation,
              transform: [{ scale: celebrationScale }],
            }
          ]}
        >
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>
              Alle Aufgaben erledigt!
            </Text>
            <Text style={styles.celebrationSubtitle}>
              Du bist unaufhaltsam! Bereit für mehr?
            </Text>
          </View>
        </Animated.View>
      )}

      <LottieConfetti
        start={showConfetti}
        onComplete={handleConfettiComplete}
      />

      <FAB 
        onPress={() => navigation.navigate('AddTodo')}
        icon={Plus}
      />

      <SimpleNotification
        visible={showNotification}
        message={notificationMessage}
        onComplete={() => setShowNotification(false)}
      />
    </View>
  );
}