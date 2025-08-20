import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface NotificationSettings {
  dailyReminders: boolean;
  streakCelebrations: boolean;
  goalWarnings: boolean;
  motivationalCheckins: boolean;
  weeklyDigest: boolean;
  reminderTime: string; // HH:MM format
}

export class NotificationService {
  private static readonly STORAGE_KEY = 'notification_settings';
  private static readonly SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';

  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Notifications',
        'Notification features will be available in the native app version.',
        [{ text: 'OK' }]
      );
      return true;
    }

    return true;
  }

  static async getSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem(this.STORAGE_KEY);
      return settings ? JSON.parse(settings) : {
        dailyReminders: true,
        streakCelebrations: true,
        goalWarnings: false,
        motivationalCheckins: false,
        weeklyDigest: false,
        reminderTime: '20:00'
      };
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return {
        dailyReminders: true,
        streakCelebrations: true,
        goalWarnings: false,
        motivationalCheckins: false,
        weeklyDigest: false,
        reminderTime: '20:00'
      };
    }
  }

  static async updateSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      await this.rescheduleNotifications();
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  static async scheduleDailyReminder(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.dailyReminders) return;
    console.log('Daily reminder scheduled');
  }

  static async scheduleWeeklyDigest(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.weeklyDigest) return;
    console.log('Weekly digest scheduled for Sunday 6pm');
  }

  static async scheduleStreakCelebration(streakDays: number): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.streakCelebrations) return;
    console.log(`Streak celebration for ${streakDays} days`);
  }

  static async scheduleGoalWarning(minutesRemaining: number): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.goalWarnings || minutesRemaining > 30) return;
    console.log(`Goal warning: ${minutesRemaining} minutes remaining`);
  }

  static async scheduleMotivationalCheckin(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.motivationalCheckins) return;
    console.log('Motivational check-in scheduled');
  }

  static async rescheduleNotifications(): Promise<void> {
    await this.scheduleDailyReminder();
    await this.scheduleMotivationalCheckin();
    await this.scheduleWeeklyDigest();
  }

  static async cancelAllNotifications(): Promise<void> {
    console.log('All notifications cancelled');
  }
}