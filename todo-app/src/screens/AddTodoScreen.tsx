import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Check, Calendar, X, Plus } from 'lucide-react-native';
import { TodoGroup } from '../types/todo';
import { storageService } from '../services/storage';
import { localizationService } from '../services/localization';
import { TextField } from '../components/ui/TextField';
import { SuccessAnimation } from '../components/ui/SuccessAnimation';
import { CreateGroupModal } from '../components/ui/CreateGroupModal';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../utils/logger';

export default function AddTodoScreen({ navigation, route }: any) {
  const { theme, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [titleError, setTitleError] = useState('');
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
      
      // Show success animation
      setShowSuccess(true);
    } catch (error) {
      logger.error('Failed to save todo:', error);
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setLoading(false);
    navigation.goBack();
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerSafeArea: {
      backgroundColor: theme.colors.surface,
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
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
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
  });

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
                { value: undefined, label: 'None', icon: '' },
                { value: 'low' as const, label: 'Low', icon: '🟢' },
                { value: 'medium' as const, label: 'Medium', icon: '🟡' },
                { value: 'high' as const, label: 'High', icon: '🔴' }
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
                  <Text
                    style={[
                      styles.priorityChipText,
                      priority === option.value 
                        ? styles.selectedPriorityText
                        : styles.unselectedPriorityText
                    ]}
                  >
                    {option.icon ? `${option.icon} ${option.label}` : option.label}
                  </Text>
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

      <SuccessAnimation
        visible={showSuccess}
        onComplete={handleSuccessComplete}
      />

      <CreateGroupModal
        isVisible={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />

      <SafeAreaView edges={['bottom']} />
    </View>
  );
}

