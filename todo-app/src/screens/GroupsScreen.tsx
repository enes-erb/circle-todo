import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Alert,
  Text,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Edit2, Trash2, Plus, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TodoGroup } from '../types';
import { storageService } from '../services/storage';
import { localizationService } from '../services/localization';
import { AppHeader } from '../components/ui/AppHeader';
import { FAB } from '../components/ui/FAB';
import { useTheme } from '../contexts/ThemeContext';
import { useContentPadding } from '../hooks/useContentPadding';

import { GROUP_COLORS } from '../constants/colors';
import { logger } from '../utils/logger';
import { createFrostedCard, createFrostedSurface } from '../utils/frostedGlass';

export default function GroupsScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const { contentPadding } = useContentPadding();
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TodoGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]?.hex || '#2D5016');
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const feedbackAnimation = useState(new Animated.Value(0))[0];

  const loadGroups = useCallback(async () => {
    try {
      const groupsData = await storageService.getGroups();
      setGroups(groupsData);
    } catch (error) {
      logger.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups])
  );

  const handleAddGroup = () => {
    setEditingGroup(null);
    setGroupName('');
    setSelectedColor(GROUP_COLORS[0]?.hex || '#2D5016');
    setModalVisible(true);
  };

  const handleEditGroup = (group: TodoGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedColor(group.color);
    setModalVisible(true);
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const groupData = {
        name: groupName.trim(),
        color: selectedColor || GROUP_COLORS[0]?.hex || '#2D5016',
        createdAt: new Date(),
      };

      if (editingGroup) {
        const updatedGroups = groups.map(g =>
          g.id === editingGroup.id ? { ...g, ...groupData } as TodoGroup : g
        );
        await storageService.saveGroups(updatedGroups);
        setGroups(updatedGroups);
      } else {
        const newGroup: TodoGroup = {
          id: Date.now().toString(),
          icon: 'folder', // Default icon
          name: groupData.name,
          color: selectedColor as string,
          createdAt: groupData.createdAt,
        };
        const updatedGroups = [...groups, newGroup];
        await storageService.saveGroups(updatedGroups);
        setGroups(updatedGroups);
      }

      setModalVisible(false);
      
      // Show success feedback
      const message = editingGroup ? 'Group updated successfully!' : 'Group created successfully!';
      setSuccessMessage(message);
      showSuccessFeedbackAnimation();
    } catch (error) {
      logger.error('Failed to save group:', error);
    }
  };

  const showSuccessFeedbackAnimation = () => {
    setShowSuccessFeedback(true);
    
    // Strong haptic feedback for group creation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Animated.sequence([
      Animated.timing(feedbackAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(feedbackAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessFeedback(false);
    });
  };

  const handleDeleteGroup = (group: TodoGroup) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"?`,
      [
        { text: localizationService.t('common.cancel'), style: 'cancel' },
        {
          text: localizationService.t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedGroups = groups.filter(g => g.id !== group.id);
              await storageService.saveGroups(updatedGroups);
              setGroups(updatedGroups);
            } catch (error) {
              logger.error('Failed to delete group:', error);
            }
          },
        },
      ]
    );
  };

  const renderGroupItem = ({ item }: { item: TodoGroup }) => (
    <View style={groupStyles.groupItem}>
      <View style={groupStyles.groupContent}>
        <View style={groupStyles.groupInfo}>
          <View 
            style={[groupStyles.colorIndicator, { backgroundColor: item.color }]}
          />
          <Text style={groupStyles.groupName}>
            {item.name}
          </Text>
        </View>
      </View>

      <View style={groupStyles.actionsContainer}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleEditGroup(item);
          }}
          style={groupStyles.actionButton}
        >
          <Edit2 size={16} color="#6B7280" strokeWidth={1.5} />
          <Text style={groupStyles.actionText}>
            {localizationService.t('common.edit')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleDeleteGroup(item);
          }}
          style={groupStyles.actionButton}
        >
          <Trash2 size={16} color="#E24A4A" strokeWidth={1.5} />
          <Text style={[groupStyles.actionText, { color: '#E24A4A' }]}>
            {localizationService.t('common.delete')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderColorOption = ({ name, hex }: { name: string; hex: string }) => (
    <Pressable
      key={hex}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedColor(hex);
      }}
      style={[
        styles.colorOption,
        {
          backgroundColor: hex,
          opacity: selectedColor === hex ? 1 : 0.6,
        }
      ]}
    >
      {selectedColor === hex && (
        <Check size={20} color="white" strokeWidth={2} />
      )}
    </Pressable>
  );

  const groupStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: 20,
      paddingBottom: contentPadding,
    },
    groupItem: {
      ...createFrostedCard(isDark),
      marginBottom: theme.spacing.md,
    },
    groupContent: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    groupInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    colorIndicator: {
      width: 3,
      height: 24,
      borderRadius: 2,
      marginRight: 16,
    },
    groupName: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 8,
      paddingBottom: 8,
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.md,
      backgroundColor: 'transparent',
    },
    actionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      ...createFrostedSurface(isDark),
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.textPrimary,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputSection: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.textPrimary,
    },
    colorSection: {
      marginBottom: 24,
    },
    colorLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    colorsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    cancelText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    saveButton: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    saveText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textInverse,
    },
    saveTextDisabled: {
      color: theme.colors.textSecondary,
    },
    successFeedback: {
      position: 'absolute',
      top: 60,
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
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
    },
    successText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 12,
    },
  });

  return (
    <View style={groupStyles.container}>
      <AppHeader
        title={localizationService.t('groups.title')}
        subtitle="Organize your tasks"
      />

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        style={groupStyles.list}
        contentContainerStyle={groupStyles.listContent}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        initialNumToRender={8}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={
          <View style={groupStyles.emptyState}>
            <Text style={groupStyles.emptyTitle}>
              No groups yet
            </Text>
            <Text style={groupStyles.emptySubtitle}>
              Create groups to organize your tasks
            </Text>
          </View>
        }
      />

      <FAB onPress={handleAddGroup} />

      {/* Success Feedback */}
      {showSuccessFeedback && (
        <Animated.View
          style={[
            groupStyles.successFeedback,
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
          <Text style={groupStyles.successText}>
            {successMessage}
          </Text>
        </Animated.View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={groupStyles.modalOverlay}>
          <View style={groupStyles.modalContent}>
            <Text style={groupStyles.modalTitle}>
              {editingGroup ? 'Edit Group' : localizationService.t('groups.addGroup')}
            </Text>

            <View style={groupStyles.inputSection}>
              <Text style={groupStyles.inputLabel}>
                {localizationService.t('groups.groupName')}
              </Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder={localizationService.t('groups.groupNamePlaceholder')}
                style={groupStyles.textInput}
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={groupStyles.colorSection}>
              <Text style={groupStyles.colorLabel}>
                Color
              </Text>
              <View style={groupStyles.colorsGrid}>
                {GROUP_COLORS.map(renderColorOption)}
              </View>
            </View>

            <View style={groupStyles.modalActions}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setModalVisible(false);
                }}
                style={groupStyles.cancelButton}
              >
                <Text style={groupStyles.cancelText}>
                  {localizationService.t('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleSaveGroup();
                }}
                disabled={!groupName.trim()}
                style={[
                  groupStyles.saveButton,
                  !groupName.trim() && groupStyles.saveButtonDisabled
                ]}
              >
                <Text style={[
                  groupStyles.saveText,
                  !groupName.trim() && groupStyles.saveTextDisabled
                ]}>
                  {localizationService.t('common.save')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


