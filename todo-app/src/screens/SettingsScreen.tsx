import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Settings, 
  Globe, 
  Bell, 
  Clock, 
  Palette, 
  Trash2, 
  Info, 
  Shield, 
  ChevronRight, 
  ExternalLink,
  Moon,
  Sun,
  Monitor,
  Check,
  Timer,
} from 'lucide-react-native';
import { AppHeader } from '../components/ui/AppHeader';
import { storageService } from '../services/storage';
import { localizationService } from '../services/localization';
import { AppSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { logger } from '../utils/logger';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingItem({ icon, title, description, rightElement, onPress, destructive = false, theme }: SettingItemProps & { theme: any }) {
  const itemStyles = StyleSheet.create({
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    iconContainer: {
      marginRight: 12,
    },
    contentContainer: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    destructiveText: {
      color: theme.colors.error,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    rightElement: {
      marginLeft: 12,
    },
  });

  return (
    <TouchableOpacity
      style={itemStyles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={itemStyles.iconContainer}>
        {icon}
      </View>
      <View style={itemStyles.contentContainer}>
        <Text style={[itemStyles.settingTitle, destructive && itemStyles.destructiveText]}>
          {title}
        </Text>
        {description && (
          <Text style={itemStyles.settingDescription}>
            {description}
          </Text>
        )}
      </View>
      {rightElement && (
        <View style={itemStyles.rightElement}>
          {rightElement}
        </View>
      )}
    </TouchableOpacity>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children, theme }: SectionProps & { theme: any }) {
  const sectionStyles = StyleSheet.create({
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginHorizontal: 20,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
    },
  });

  return (
    <View style={sectionStyles.section}>
      <View style={sectionStyles.sectionHeader}>
        <Text style={sectionStyles.sectionTitle}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen({ navigation }: any) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingVertical: 16,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 20,
    },
    themeText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 24,
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 8,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accent,
    },
    radioButtonInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.textInverse,
    },
    languageText: {
      fontSize: 16,
      color: theme.colors.textPrimary,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 24,
    },
    cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.accent,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 4,
    },
    themeOptionContent: {
      flex: 1,
      marginLeft: 12,
    },
    themeOptionTitle: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    themeOptionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    privacyModal: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 60,
      maxHeight: '85%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
    privacyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    privacyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCloseText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      fontWeight: '300',
    },
    privacyScrollView: {
      flex: 1,
    },
    privacyContent: {
      padding: 20,
    },
    privacySection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    sectionText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    subsectionTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginTop: 12,
      marginBottom: 8,
    },
    bulletPoints: {
      marginLeft: 8,
    },
    bulletText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    bulletTextNegative: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    highlightText: {
      fontWeight: '600',
      color: theme.colors.accent,
    },
    importantText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.accent,
      fontWeight: '500',
      marginTop: 8,
      fontStyle: 'italic',
    },
    keyPointContainer: {
      backgroundColor: theme.colors.accentWeak,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.accent,
    },
    keyPointText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textPrimary,
      fontWeight: '500',
      textAlign: 'center',
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      const appSettings = await storageService.getSettings();
      setSettings(appSettings);
    } catch (error) {
      logger.error('Failed to load settings:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!settings) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      await storageService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      
      // Update daily reminder if notification settings changed
      if (newSettings.notifications) {
        await updateDailyReminder(updatedSettings);
      }
    } catch (error) {
      logger.error('Failed to update settings:', error);
    }
  };

  const updateDailyReminder = async (currentSettings: AppSettings) => {
    try {
      if (currentSettings.notifications.enabled && currentSettings.notifications.dailyReminder) {
        // Get pending tasks count
        const todos = await storageService.getTodos();
        const pendingCount = todos.filter(t => !t.completed).length;
        
        // Schedule daily reminder
        await notificationService.scheduleDailyReminder(
          currentSettings.notifications.reminderTime.hour,
          currentSettings.notifications.reminderTime.minute,
          pendingCount
        );
      } else {
        // Cancel daily reminder
        await notificationService.cancelDailyReminder();
      }
    } catch (error) {
      logger.error('Failed to update daily reminder:', error);
    }
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    
    if (selectedTime && settings) {
      const newSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          reminderTime: {
            hour: selectedTime.getHours(),
            minute: selectedTime.getMinutes(),
          },
        },
      };
      
      await updateSettings({ notifications: newSettings.notifications });
    }
  };

  const handleLanguageChange = async (language: 'en' | 'de') => {
    await updateSettings({ language });
    await localizationService.setLanguage(language);
    setLanguageModalVisible(false);
    
    // Show restart prompt
    Alert.alert(
      'Language Changed',
      'Please restart the app to apply the new language.',
      [{ text: 'OK' }]
    );
  };

  const getThemeDescription = () => {
    switch (themeMode) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'Follows system setting';
      default:
        return 'Auto';
    }
  };

  const getThemeIcon = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light':
        return <Sun size={20} color="#6B7280" />;
      case 'dark':
        return <Moon size={20} color="#6B7280" />;
      case 'system':
        return <Monitor size={20} color="#6B7280" />;
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your todos and groups. This action cannot be undone.',
      [
        { text: localizationService.t('common.cancel'), style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data
              await storageService.saveTodos([]);
              await storageService.saveGroups([]);
              
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              logger.error('Failed to clear data:', error);
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  if (!settings) {
    return (
      <View style={styles.container}>
        <AppHeader title="Settings" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Settings" 
        subtitle="Customize your experience" 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Section title="Language & Region" theme={theme}>
            <SettingItem
              theme={theme}
              icon={<Globe size={20} color={theme.colors.textSecondary} />}
              title="Language"
              description={settings.language === 'en' ? 'English' : 'Deutsch'}
              rightElement={<ChevronRight size={20} color={theme.colors.textSecondary} />}
              onPress={() => setLanguageModalVisible(true)}
            />
          </Section>

          <Section title="Notifications" theme={theme}>
            <SettingItem
              theme={theme}
              icon={<Bell size={20} color={theme.colors.textSecondary} />}
              title="Enable Notifications"
              description="Get reminded about open tasks"
              rightElement={
                <Switch
                  value={settings.notifications.enabled}
                  onValueChange={(value) =>
                    updateSettings({
                      notifications: { ...settings.notifications, enabled: value }
                    })
                  }
                  trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                  thumbColor={theme.colors.textInverse}
                />
              }
            />
            <View style={styles.separator} />
            <SettingItem
              theme={theme}
              icon={<Clock size={20} color={theme.colors.textSecondary} />}
              title="Daily Reminder"
              description="Daily notification at set time"
              rightElement={
                <Switch
                  value={settings.notifications.dailyReminder}
                  onValueChange={(value) =>
                    updateSettings({
                      notifications: { ...settings.notifications, dailyReminder: value }
                    })
                  }
                  trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                  thumbColor={theme.colors.textInverse}
                />
              }
            />
            {settings.notifications.dailyReminder && (
              <>
                <View style={styles.separator} />
                <SettingItem
                  theme={theme}
                  icon={<Timer size={20} color={theme.colors.textSecondary} />}
                  title="Reminder Time"
                  description={`Daily reminder at ${(settings.notifications.reminderTime?.hour ?? 9).toString().padStart(2, '0')}:${(settings.notifications.reminderTime?.minute ?? 0).toString().padStart(2, '0')}`}
                  onPress={() => setShowTimePicker(true)}
                  rightElement={<ChevronRight size={20} color={theme.colors.textSecondary} />}
                />
              </>
            )}
          </Section>

          <Section title="Appearance" theme={theme}>
            <SettingItem
              theme={theme}
              icon={<Palette size={20} color={theme.colors.textSecondary} />}
              title="Theme"
              description={getThemeDescription()}
              onPress={() => setThemeModalVisible(true)}
              rightElement={
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              }
            />
          </Section>

          <Section title="Data Management" theme={theme}>
            <SettingItem
              theme={theme}
              icon={<Trash2 size={20} color={theme.colors.error} />}
              title="Clear All Data"
              description="Delete all todos and groups"
              onPress={handleClearData}
              destructive
            />
          </Section>

          <Section title="About" theme={theme}>
            <SettingItem
              theme={theme}
              icon={<Info size={20} color={theme.colors.textSecondary} />}
              title={localizationService.t('app.title')}
              description="Version 1.0.0"
            />
            <View style={styles.separator} />
            <SettingItem
              theme={theme}
              icon={<Shield size={20} color={theme.colors.textSecondary} />}
              title="Privacy Policy"
              description="How we protect your data"
              onPress={() => setPrivacyModalVisible(true)}
              rightElement={<ChevronRight size={18} color={theme.colors.textSecondary} />}
            />
          </Section>
        </View>
      </ScrollView>

      {/* Time Picker */}
      {showTimePicker && settings && (
        <DateTimePicker
          value={new Date(2024, 0, 1, settings.notifications.reminderTime?.hour ?? 9, settings.notifications.reminderTime?.minute ?? 0)}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={handleTimeChange}
          textColor={theme.colors.textPrimary}
          accentColor={theme.colors.accent}
        />
      )}

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select Language
            </Text>

            <TouchableOpacity
              style={styles.languageOption}
              onPress={() => handleLanguageChange('en')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radioButton,
                settings.language === 'en' && styles.radioButtonSelected
              ]}>
                {settings.language === 'en' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.languageText}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.languageOption}
              onPress={() => handleLanguageChange('de')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radioButton,
                settings.language === 'de' && styles.radioButtonSelected
              ]}>
                {settings.language === 'de' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.languageText}>Deutsch</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLanguageModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>
                  {localizationService.t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Choose Theme
            </Text>

            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={styles.themeOption}
                onPress={() => {
                  setThemeMode(mode);
                  setThemeModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                {getThemeIcon(mode)}
                <View style={styles.themeOptionContent}>
                  <Text style={styles.themeOptionTitle}>
                    {mode === 'light' && 'Light Mode'}
                    {mode === 'dark' && 'Dark Mode'}
                    {mode === 'system' && 'System Setting'}
                  </Text>
                  <Text style={styles.themeOptionDescription}>
                    {mode === 'light' && 'Always use light theme'}
                    {mode === 'dark' && 'Always use dark theme'}
                    {mode === 'system' && 'Follow your device\'s theme'}
                  </Text>
                </View>
                {themeMode === mode && (
                  <Check size={20} color={theme.colors.accent} strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setThemeModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.privacyModal}>
            <View style={styles.privacyHeader}>
              <Text style={styles.privacyTitle}>
                Privacy Policy
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setPrivacyModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.privacyScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.privacyContent}>
                
                <View style={styles.privacySection}>
                  <Text style={styles.sectionTitle}>Overview</Text>
                  <Text style={styles.sectionText}>
                    Circle Todo is committed to protecting your privacy. This policy explains how we protect your information.
                  </Text>
                </View>

                <View style={styles.privacySection}>
                  <Text style={styles.sectionTitle}>Information We Collect</Text>
                  <Text style={styles.subsectionTitle}>Local Data Only:</Text>
                  <View style={styles.bulletPoints}>
                    <Text style={styles.bulletText}>• Todo tasks - titles and completion status</Text>
                    <Text style={styles.bulletText}>• Task groups - custom categories you create</Text>
                    <Text style={styles.bulletText}>• Due dates - scheduling information</Text>
                    <Text style={styles.bulletText}>• App preferences - language and notification settings</Text>
                  </View>
                  
                  <Text style={styles.subsectionTitle}>We Do NOT Collect:</Text>
                  <View style={styles.bulletPoints}>
                    <Text style={styles.bulletTextNegative}>❌ Personal identification information</Text>
                    <Text style={styles.bulletTextNegative}>❌ Location data</Text>
                    <Text style={styles.bulletTextNegative}>❌ Usage analytics</Text>
                    <Text style={styles.bulletTextNegative}>❌ Crash reports</Text>
                    <Text style={styles.bulletTextNegative}>❌ Device information beyond basic functionality</Text>
                  </View>
                </View>

                <View style={styles.privacySection}>
                  <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                  <Text style={styles.sectionText}>
                    All your data is stored <Text style={styles.highlightText}>locally on your device only</Text>. We:
                  </Text>
                  <View style={styles.bulletPoints}>
                    <Text style={styles.bulletText}>• Store your todos and preferences in local storage</Text>
                    <Text style={styles.bulletText}>• Use notification permissions only for task reminders</Text>
                    <Text style={styles.bulletText}>• Use calendar permissions only to schedule tasks</Text>
                  </View>
                  <Text style={styles.importantText}>
                    We never transmit your data to external servers.
                  </Text>
                </View>

                <View style={styles.privacySection}>
                  <Text style={styles.sectionTitle}>Data Storage</Text>
                  <View style={styles.bulletPoints}>
                    <Text style={styles.bulletText}>• All data stored using secure local storage</Text>
                    <Text style={styles.bulletText}>• No cloud storage or external databases</Text>
                    <Text style={styles.bulletText}>• Your data remains under your control</Text>
                    <Text style={styles.bulletText}>• Uninstalling permanently deletes all data</Text>
                  </View>
                </View>

                <View style={styles.privacySection}>
                  <Text style={styles.sectionTitle}>Third-Party Services</Text>
                  <Text style={styles.sectionText}>
                    Circle Todo does not use any third-party analytics, advertising, or data collection services.
                  </Text>
                </View>

                <View style={styles.privacySection}>
                  <Text style={styles.sectionTitle}>Your Rights</Text>
                  <View style={styles.bulletPoints}>
                    <Text style={styles.bulletText}>• <Text style={styles.highlightText}>Access</Text>: View your data anytime within the app</Text>
                    <Text style={styles.bulletText}>• <Text style={styles.highlightText}>Delete</Text>: Clear all data via Settings → Clear All Data</Text>
                    <Text style={styles.bulletText}>• <Text style={styles.highlightText}>Control</Text>: Full control over all data on your device</Text>
                  </View>
                </View>

                <View style={styles.privacySection}>
                  <Text style={styles.sectionTitle}>Contact Us</Text>
                  <Text style={styles.sectionText}>
                    For privacy questions: <Text style={styles.highlightText}>enes.erbil@icloud.com</Text>
                  </Text>
                </View>

                <View style={styles.keyPointContainer}>
                  <Text style={styles.keyPointText}>
                    🔒 Key Point: Circle Todo is designed with privacy-first principles. Your data never leaves your device.
                  </Text>
                </View>

              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}


