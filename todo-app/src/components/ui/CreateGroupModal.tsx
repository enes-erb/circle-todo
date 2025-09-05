import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { BottomSheet } from './BottomSheet';
import { TextField } from './TextField';
import { Button } from './Button';
import { useTheme } from '../../contexts/ThemeContext';
import { TodoGroup } from '../../types/todo';
import * as Haptics from 'expo-haptics';

interface CreateGroupModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreateGroup: (group: Omit<TodoGroup, 'id' | 'createdAt'>) => void;
}

const GROUP_COLORS = [
  '#2D5016', // Forest Green
  '#1976D2', // Blue
  '#388E3C', // Green
  '#F57C00', // Orange
  '#7B1FA2', // Purple
  '#D32F2F', // Red
  '#455A64', // Blue Grey
  '#5D4037', // Brown
  '#C2185B', // Pink
  '#00796B', // Teal
  '#FBC02D', // Yellow
  '#512DA8', // Deep Purple
];


export function CreateGroupModal({
  isVisible,
  onClose,
  onCreateGroup,
}: CreateGroupModalProps) {
  const { theme } = useTheme();
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(GROUP_COLORS[0] || '#2D5016');
  const [nameError, setNameError] = useState('');

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setNameError('Group name is required');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (groupName.trim().length < 2) {
      setNameError('Group name must be at least 2 characters');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const newGroup = {
      name: groupName.trim(),
      color: selectedColor,
      icon: 'folder', // Default icon
    };

    onCreateGroup(newGroup);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Reset form
    setGroupName('');
    setSelectedColor(GROUP_COLORS[0] || '#2D5016');
    setNameError('');
    
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setGroupName('');
    setSelectedColor(GROUP_COLORS[0] || '#2D5016');
    setNameError('');
    onClose();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    colorOption: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'transparent',
    },
    selectedColorOption: {
      borderColor: theme.colors.accent,
      borderWidth: 3,
    },
    colorInner: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    previewSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    preview: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      borderWidth: 2,
    },
    previewText: {
      fontSize: 16,
      fontWeight: '600',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
  });

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={handleClose}
      title="Create New Group"
      subtitle="Organize your tasks with custom groups"
      height="auto"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Group Name */}
        <View style={styles.section}>
          <TextField
            label="Group Name"
            value={groupName}
            onChangeText={(text) => {
              setGroupName(text);
              if (nameError) setNameError('');
            }}
            error={nameError}
            placeholder="e.g. Work Projects, Personal Goals"
            maxLength={30}
          />
        </View>

        {/* Preview */}
        {groupName.trim() && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View
              style={[
                styles.preview,
                {
                  backgroundColor: selectedColor + '20',
                  borderColor: selectedColor,
                },
              ]}
            >
              <Text style={[styles.previewText, { color: selectedColor }]}>
                {groupName.trim()}
              </Text>
            </View>
          </View>
        )}

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎨 Color
          </Text>
          <View style={styles.colorGrid}>
            {GROUP_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  setSelectedColor(color);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.colorOption,
                  selectedColor === color && styles.selectedColorOption,
                ]}
              >
                <View
                  style={[
                    styles.colorInner,
                    { backgroundColor: color },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="secondary"
            size="md"
            fullWidth={false}
            accessibilityLabel="Cancel group creation"
          />
          <View style={{ flex: 1 }}>
            <Button
              title="Create Group"
              onPress={handleCreateGroup}
              variant="primary"
              size="md"
              fullWidth
              icon={Plus}
              disabled={!groupName.trim()}
              accessibilityLabel="Create new group"
            />
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}