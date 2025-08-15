import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Screen Time API types (would be implemented with native modules)
interface ScreenTimeData {
  totalScreenTime: number;
  categoryBreakdown: { [key: string]: number };
  appUsage: { [key: string]: number };
}

// Mock implementation - replace with actual Screen Time API
class ScreenTimeAPI {
  static async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    // In a real implementation, this would use:
    // Native iOS Screen Time API integration would go here
    // This requires custom native module development
    
    // Mock permission request
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  static async getTodayScreenTime(): Promise<number> {
    if (Platform.OS !== 'ios') {
      return 0;
    }

    // In a real implementation, this would use:
    // Native iOS Screen Time API integration would go here
    // This requires custom native module development
    
    // Mock data for now
    const now = new Date();
    const hourOfDay = now.getHours();
    return Math.floor((hourOfDay / 24) * (180 + Math.random() * 120));
  }

  static async getWeeklyScreenTime(): Promise<number[]> {
    if (Platform.OS !== 'ios') {
      return [];
    }

    // Mock weekly data
    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const baseUsage = 240 + Math.random() * 180;
      weekData.push(Math.floor(baseUsage));
    }
    return weekData;
  }
}

interface DailyUsage {
  date: string;
  usage: number;
}

interface AppSettings {
  goalReduction: number;
  weeklyAverage: number;
  currentStreak: number;
  longestStreak: number;
  daysCompleted: number;
}

export class ScreenTimeService {
  private static readonly STORAGE_KEYS = {
    DAILY_USAGE: 'screentime_daily_usage',
    SETTINGS: 'screentime_settings',
    LAST_UPDATE: 'screentime_last_update',
    PERMISSION_GRANTED: 'screentime_permission_granted',
  };

  static async getLongestStreak(): Promise<number> {
    const settings = await this.getSettings();
    return settings.longestStreak;
  }

  static async getDaysCompleted(): Promise<number> {
    const data = await this.getStoredData();
    return Math.min(data.length, 7);
  }

  static async setTodayUsage(minutes: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const data = await this.getStoredData();
    const todayIndex = data.findIndex(d => d.date === today);
    
    if (todayIndex >= 0) {
      data[todayIndex].usage = minutes;
    } else {
      data.push({ date: today, usage: minutes });
    }
    
    await AsyncStorage.setItem(this.STORAGE_KEYS.DAILY_USAGE, JSON.stringify(data));
  }

  // Initialize with mock data for demonstration
  static async initializeMockData(): Promise<void> {
    const existingData = await this.getStoredData();
    if (existingData.length === 0) {
      // Generate realistic mock data for the past week
      const mockData: DailyUsage[] = [];
      const today = new Date();
      
      // Generate data for the past 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate realistic screentime data (3-7 hours with variation)
        const baseUsage = 240 + Math.random() * 180; // 4-7 hours
        const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 1.2 : 1;
        const usage = Math.floor(baseUsage * weekendMultiplier);
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          usage,
        });
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.DAILY_USAGE, JSON.stringify(mockData));
    }

    // Initialize settings if they don't exist
    const settings = await this.getSettings();
    if (!settings.goalReduction) {
      await this.setGoalReduction(10);
    }
  }

  static async getStoredData(): Promise<DailyUsage[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.DAILY_USAGE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading stored data:', error);
      return [];
    }
  }

  static async getSettings(): Promise<AppSettings> {
    try {
      const settings = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : { 
        goalReduction: 10, 
        weeklyAverage: 0, 
        currentStreak: 0, 
        longestStreak: 0,
        daysCompleted: 0 
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { 
        goalReduction: 10, 
        weeklyAverage: 0, 
        currentStreak: 0, 
        longestStreak: 0,
        daysCompleted: 0 
      };
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async getTodayUsage(): Promise<number> {
    await this.initializeMockData();
    
    // Check if we have permission and try to get real data
    const hasPermission = await this.hasScreenTimePermission();
    if (hasPermission) {
      try {
        const realUsage = await ScreenTimeAPI.getTodayScreenTime();
        if (realUsage > 0) {
          return realUsage;
        }
      } catch (error) {
        console.log('Failed to get real screen time data, using mock data');
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    const data = await this.getStoredData();
    const todayData = data.find(d => d.date === today);
    
    if (!todayData) {
      // Simulate current day usage (growing throughout the day)
      const now = new Date();
      const hourOfDay = now.getHours();
      const simulatedUsage = Math.floor((hourOfDay / 24) * (180 + Math.random() * 120)); // 3-5 hours max
      
      // Store today's simulated usage
      const newData = [...data, { date: today, usage: simulatedUsage }];
      await AsyncStorage.setItem(this.STORAGE_KEYS.DAILY_USAGE, JSON.stringify(newData));
      
      return simulatedUsage;
    }
    
    return todayData.usage;
  }

  static async getWeeklyData(): Promise<number[]> {
    await this.initializeMockData();
    
    // Try to get real data if permission is granted
    const hasPermission = await this.hasScreenTimePermission();
    if (hasPermission) {
      try {
        const realWeeklyData = await ScreenTimeAPI.getWeeklyScreenTime();
        if (realWeeklyData.length === 7) {
          return realWeeklyData;
        }
      } catch (error) {
        console.log('Failed to get real weekly data, using mock data');
      }
    }
    
    const data = await this.getStoredData();
    const last7Days = data.slice(-7);
    
    // Ensure we have 7 days of data
    while (last7Days.length < 7) {
      last7Days.unshift({ date: '', usage: 0 });
    }
    
    return last7Days.map(d => d.usage);
  }

  static async getWeeklyAverage(): Promise<number> {
    const weeklyData = await this.getWeeklyData();
    const validData = weeklyData.filter(usage => usage > 0);
    
    if (validData.length === 0) return 0;
    
    const average = validData.reduce((sum, usage) => sum + usage, 0) / validData.length;
    return Math.floor(average);
  }

  static async getDailyGoal(): Promise<number> {
    const average = await this.getWeeklyAverage();
    const settings = await this.getSettings();
    return Math.max(0, average - settings.goalReduction);
  }

  static async getCurrentStreak(): Promise<number> {
    const data = await this.getStoredData();
    const goal = await this.getDailyGoal();
    
    if (goal === 0) return 0;
    
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].usage <= goal) {
        streak++;
      } else {
        break;
      }
    }
    
    // Update longest streak if current is higher
    const settings = await this.getSettings();
    if (streak > settings.longestStreak) {
      settings.longestStreak = streak;
      await this.saveSettings(settings);
    }
    
    return streak;
  }

  static async getGoalAchievements(): Promise<number> {
    const weeklyData = await this.getWeeklyData();
    const goal = await this.getDailyGoal();
    
    if (goal === 0) return 0;
    
    return weeklyData.filter(usage => usage > 0 && usage <= goal).length;
  }

  static async getGoalReduction(): Promise<number> {
    const settings = await this.getSettings();
    return settings.goalReduction;
  }

  static async setGoalReduction(minutes: number): Promise<void> {
    const settings = await this.getSettings();
    settings.goalReduction = minutes;
    await this.saveSettings(settings);
  }

  static async resetAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.DAILY_USAGE,
        this.STORAGE_KEYS.SETTINGS,
        this.STORAGE_KEYS.LAST_UPDATE,
      ]);
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }

  // Simulate daily usage updates (in a real app, this would be called by background tasks)
  static async updateTodayUsage(additionalMinutes: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const data = await this.getStoredData();
    const todayIndex = data.findIndex(d => d.date === today);
    
    if (todayIndex >= 0) {
      data[todayIndex].usage += additionalMinutes;
    } else {
      data.push({ date: today, usage: additionalMinutes });
    }
    
    await AsyncStorage.setItem(this.STORAGE_KEYS.DAILY_USAGE, JSON.stringify(data));
  }

  static async requestScreenTimePermission(): Promise<boolean> {
    try {
      const granted = await ScreenTimeAPI.requestPermission();
      await AsyncStorage.setItem(this.STORAGE_KEYS.PERMISSION_GRANTED, granted.toString());
      return granted;
    } catch (error) {
      console.error('Error requesting screen time permission:', error);
      return false;
    }
  }

  static async hasScreenTimePermission(): Promise<boolean> {
    try {
      const permission = await AsyncStorage.getItem(this.STORAGE_KEYS.PERMISSION_GRANTED);
      return permission === 'true';
    } catch (error) {
      return false;
    }
  }
}