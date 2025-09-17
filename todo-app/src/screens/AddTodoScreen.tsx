import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Check, Calendar, X, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TodoGroup } from '../types/todo';
import { storageService } from '../services/storage';
import { localizationService } from '../services/localization';
import { TextField } from '../components/ui/TextField';
import { SimpleNotification } from '../components/ui/SimpleNotification';
import { CreateGroupModal } from '../components/ui/CreateGroupModal';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../utils/logger';
import { createFrostedSurface } from '../utils/frostedGlass';

export default function AddTodoScreen({ navigation, route }: any) {
  const { theme, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const feedbackAnimation = useState(new Animated.Value(0))[0];
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const groupId = route?.params?.groupId;
  const selectedDate = route?.params?.selectedDate;

  useEffect(() => {
    loadGroups();
    if (groupId) {
      setSelectedGroupId(groupId);
    }
    // Set the due date if coming from calendar view with a selected date
    if (selectedDate) {
      const date = new Date(selectedDate);
      // Only set as due date if it's a future date or today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date >= today) {
        setDueDate(date);
      }
    }
  }, [groupId, selectedDate]);

  const loadGroups = async () => {
    try {
      const groupsData = await storageService.getGroups();
      setGroups(groupsData);
      if (!selectedGroupId && groupsData.length > 0) {
        setSelectedGroupId(groupsData[0]?.id || '');
      }
    } catch (error) {
      logger.error('Failed to load groups:', error);
    }
  };

  const showSuccessFeedbackAnimation = () => {
    console.log('🎉 Starting success feedback animation');
    setShowSuccessFeedback(true);
    
    // Strong haptic feedback for task creation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Animated.sequence([
      Animated.timing(feedbackAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1200), // Verkürzt von 2000ms auf 1200ms
      Animated.timing(feedbackAnimation, {
        toValue: 0,
        duration: 200, // Verkürzt von 300ms auf 200ms für schnellere Navigation
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('🎉 Animation finished, navigating...');
      setShowSuccessFeedback(false);
      navigation.navigate('Main', { 
        screen: 'Home', 
        params: { showNotification: undefined } // Keine doppelte Benachrichtigung
      });
    });
  };

  const handleCreateGroup = async (groupData: Omit<TodoGroup, 'id' | 'createdAt'>) => {
    try {
      const newGroup = await storageService.addGroup(groupData);
      await loadGroups(); // Reload groups to get the updated list
      setSelectedGroupId(newGroup.id); // Auto-select the newly created group
    } catch (error) {
      logger.error('Failed to create group:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Every task needs a name 😄');
      return;
    }

    // Prevent double-clicks
    if (loading) return;

    setTitleError('');
    setLoading(true);
    try {
      await storageService.addTodo({
        title: title.trim(),
        completed: false,
        ...(priority && { priority }),
        ...(selectedGroupId && { groupId: selectedGroupId }),
        ...(dueDate && { dueDate }),
      });
      
      // Reset loading state and show success feedback animation  
      setLoading(false);
      setSuccessMessage('Task erstellt!');
      showSuccessFeedbackAnimation();
    } catch (error) {
      logger.error('Failed to save todo:', error);
      setLoading(false);
    }
  };


  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const getDateQuickOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: tomorrow },
      { label: 'Next Week', date: nextWeek },
    ];
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerSafeArea: {
      ...createFrostedSurface(isDark),
      borderRadius: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 4,
      minHeight: 44,
    },
    headerButton: {
      padding: 8,
      marginHorizontal: -8,
    },
    disabledButton: {
      opacity: 0.5,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      ...createFrostedSurface(isDark),
      marginHorizontal: 20,
      marginTop: 20,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 16,
    },
    taskInput: {
      minHeight: 80,
    },
    groupsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    createGroupButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      backgroundColor: 'transparent',
      borderStyle: 'dashed',
      flexDirection: 'row',
      alignItems: 'center',
    },
    createGroupText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.accent,
      marginLeft: 4,
    },
    groupChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    unselectedGroupChip: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    groupChipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    unselectedGroupText: {
      color: theme.colors.textPrimary,
    },
    priorityContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    priorityChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    selectedPriorityChip: {
      backgroundColor: theme.colors.accentWeak,
      borderColor: theme.colors.accent,
    },
    unselectedPriorityChip: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    priorityChipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    selectedPriorityText: {
      color: theme.colors.accent,
    },
    unselectedPriorityText: {
      color: theme.colors.textPrimary,
    },
    quickDateContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    dateOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    selectedDateOption: {
      backgroundColor: theme.colors.accentWeak,
      borderColor: theme.colors.accent,
    },
    unselectedDateOption: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    dateOptionText: {
      fontSize: 14,
      fontWeight: '500',
    },
    selectedDateText: {
      color: theme.colors.accent,
    },
    unselectedDateText: {
      color: theme.colors.textPrimary,
    },
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    datePickerText: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      marginLeft: 8,
    },
    clearDateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    clearDateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    bottomSpacing: {
      height: 20,
    },
    successFeedback: {
      position: 'absolute',
      top: 100, // Weiter unten wegen Header
      left: 20,
      right: 20,
      backgroundColor: theme.colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 9999, // Höherer z-index
    },
    successText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 12,
    },
  }), [theme, isDark]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={navigation.goBack}
            style={styles.headerButton}
          >
            <ArrowLeft size={24} color={theme.colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {localizationService.t('todos.addNew')}
          </Text>
          
          <TouchableOpacity
            onPress={handleSave}
            disabled={!title.trim() || loading}
            style={[
              styles.headerButton,
              (!title.trim() || loading) && styles.disabledButton
            ]}
          >
            <Check size={24} color={theme.colors.accent} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Task Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📝 Task Details
            </Text>
            
            <TextField
              label={localizationService.t('todos.placeholder')}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError) setTitleError('');
              }}
              error={titleError}
              multiline
              numberOfLines={3}
              autoFocus={true}
              textAlignVertical="top"
              style={styles.taskInput}
            />
          </View>

          {/* Groups Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📁 {localizationService.t('groups.title')}
            </Text>
            
            <View style={styles.groupsContainer}>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => setSelectedGroupId(group.id)}
                  style={[
                    styles.groupChip,
                    selectedGroupId === group.id 
                      ? { backgroundColor: group.color + '20', borderColor: group.color }
                      : styles.unselectedGroupChip
                  ]}
                >
                  <Text
                    style={[
                      styles.groupChipText,
                      selectedGroupId === group.id 
                        ? { color: group.color }
                        : styles.unselectedGroupText
                    ]}
                  >
                    {group.name}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* Create New Group Button */}
              <TouchableOpacity
                onPress={() => setShowCreateGroupModal(true)}
                style={styles.createGroupButton}
                activeOpacity={0.7}
              >
                <Plus size={16} color={theme.colors.accent} strokeWidth={2} />
                <Text style={styles.createGroupText}>New Group</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Priority Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🚩 Priority
            </Text>
            
            <View style={styles.priorityContainer}>
              {[
                { value: undefined, label: 'None', color: theme.colors.textMuted },
                { value: 'low' as const, label: 'Low', color: '#22C55E' },
                { value: 'medium' as const, label: 'Medium', color: '#EAB308' },
                { value: 'high' as const, label: 'High', color: '#EF4444' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => setPriority(option.value)}
                  style={[
                    styles.priorityChip,
                    priority === option.value 
                      ? styles.selectedPriorityChip
                      : styles.unselectedPriorityChip
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {option.value && (
                      <View style={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: 5, 
                        backgroundColor: option.color 
                      }} />
                    )}
                    <Text
                      style={[
                        styles.priorityChipText,
                        priority === option.value 
                          ? styles.selectedPriorityText
                          : styles.unselectedPriorityText
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📅 {localizationService.t('calendar.dueDate')}
            </Text>

            {/* Quick Date Options */}
            <View style={styles.quickDateContainer}>
              {getDateQuickOptions().map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setDueDate(option.date)}
                  style={[
                    styles.dateOption,
                    dueDate?.toDateString() === option.date.toDateString()
                      ? styles.selectedDateOption
                      : styles.unselectedDateOption
                  ]}
                >
                  <Text
                    style={[
                      styles.dateOptionText,
                      dueDate?.toDateString() === option.date.toDateString()
                        ? styles.selectedDateText
                        : styles.unselectedDateText
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Date Picker Button */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Calendar size={20} color={theme.colors.textSecondary} strokeWidth={1.75} />
              <Text style={styles.datePickerText}>
                {dueDate ? dueDate.toLocaleDateString() : localizationService.t('calendar.selectDate')}
              </Text>
            </TouchableOpacity>

            {/* Clear Date Button */}
            {dueDate && (
              <TouchableOpacity
                onPress={() => setDueDate(null)}
                style={styles.clearDateButton}
              >
                <X size={16} color={theme.colors.textSecondary} strokeWidth={1.75} />
                <Text style={styles.clearDateText}>
                  Clear Date
                </Text>
              </TouchableOpacity>
            )}

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor={theme.colors.textPrimary}
                accentColor={theme.colors.accent}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            )}
          </View>
          
          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>


      <CreateGroupModal
        isVisible={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />

      {/* Success Feedback Animation */}
      {showSuccessFeedback && (
        <Animated.View
          style={[
            styles.successFeedback,
            {
              opacity: feedbackAnimation,
              transform: [{
                translateY: feedbackAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                })
              }]
            }
          ]}
        >
          <Check size={20} color="white" strokeWidth={2} />
          <Text style={styles.successText}>
            {successMessage}
          </Text>
        </Animated.View>
      )}

      <SafeAreaView edges={['bottom']} />
    </View>
  );
}

