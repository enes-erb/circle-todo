import * as Notifications from 'expo-notifications';
import { logger } from '../utils/logger';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  async scheduleReminder(title: string, body: string, date: Date): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: date as any,
      });
      return notificationId;
    } catch (error) {
      logger.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      logger.error('Failed to cancel notification:', error);
    }
  }

  async scheduleDailyReminder(hour: number, minute: number, pendingCount: number): Promise<string | null> {
    try {
      // Cancel existing daily reminder
      await this.cancelDailyReminder();

      if (pendingCount === 0) {
        return null; // Don't schedule if no pending tasks
      }

      const message = pendingCount === 1 
        ? `${pendingCount} task is waiting for you! 💪🏼`
        : `${pendingCount} tasks are waiting for you! 💪🏼`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Circle Todo",
          body: message,
          data: { type: 'daily_reminder' },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          type: 'calendar' as any,
        },
      });

      // Store the notification ID for later cancellation
      await this.storeDailyReminderId(notificationId);
      return notificationId;
    } catch (error) {
      logger.error('Failed to schedule daily reminder:', error);
      return null;
    }
  }

  async cancelDailyReminder(): Promise<void> {
    try {
      const reminderId = await this.getDailyReminderId();
      if (reminderId) {
        await Notifications.cancelScheduledNotificationAsync(reminderId);
        await this.clearDailyReminderId();
      }
    } catch (error) {
      logger.error('Failed to cancel daily reminder:', error);
    }
  }

  private async storeDailyReminderId(id: string): Promise<void> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('daily_reminder_id', id);
    } catch (error) {
      logger.error('Failed to store daily reminder ID:', error);
    }
  }

  private async getDailyReminderId(): Promise<string | null> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem('daily_reminder_id');
    } catch (error) {
      logger.error('Failed to get daily reminder ID:', error);
      return null;
    }
  }

  private async clearDailyReminderId(): Promise<void> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem('daily_reminder_id');
    } catch (error) {
      logger.error('Failed to clear daily reminder ID:', error);
    }
  }
}

export const notificationService = new NotificationService();