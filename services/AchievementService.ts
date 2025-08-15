import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  category: 'streak' | 'reduction' | 'milestone';
}

export class AchievementService {
  private static readonly STORAGE_KEY = 'achievements';

  private static readonly DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_day',
      title: 'First Step',
      description: 'Complete your first day under your goal',
      icon: 'star',
      category: 'streak'
    },
    {
      id: 'week_streak',
      title: 'Week Warrior',
      description: 'Maintain your streak for 7 days',
      icon: 'calendar',
      category: 'streak'
    },
    {
      id: 'month_streak',
      title: 'Monthly Master',
      description: 'Keep your streak alive for 30 days',
      icon: 'trophy',
      category: 'streak'
    },
    {
      id: 'hundred_days',
      title: 'Century Club',
      description: 'Reach a 100-day streak',
      icon: 'trophy',
      category: 'streak'
    },
    {
      id: 'hour_reduction',
      title: 'Hour Saver',
      description: 'Reduce daily usage by 1 hour from your average',
      icon: 'target',
      category: 'reduction'
    },
    {
      id: 'half_usage',
      title: 'Halfway Hero',
      description: 'Cut your usage in half from your starting average',
      icon: 'zap',
      category: 'reduction'
    },
    {
      id: 'consistency_king',
      title: 'Consistency King',
      description: 'Meet your goal 6 out of 7 days in a week',
      icon: 'target',
      category: 'milestone'
    }
  ];

  static async getAchievements(): Promise<Achievement[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const achievements = JSON.parse(stored);
        // Convert date strings back to Date objects
        return achievements.map((achievement: any) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
        }));
      }
      
      // Initialize with default achievements
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.DEFAULT_ACHIEVEMENTS));
      return this.DEFAULT_ACHIEVEMENTS;
    } catch (error) {
      console.error('Error loading achievements:', error);
      return this.DEFAULT_ACHIEVEMENTS;
    }
  }

  static async unlockAchievement(achievementId: string): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (achievement && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date();
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(achievements));
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  static async checkStreakAchievements(currentStreak: number): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    const newlyUnlocked: Achievement[] = [];

    const streakMilestones = [
      { days: 1, id: 'first_day' },
      { days: 7, id: 'week_streak' },
      { days: 30, id: 'month_streak' },
      { days: 100, id: 'hundred_days' }
    ];

    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone.days) {
        const achievement = achievements.find(a => a.id === milestone.id);
        if (achievement && !achievement.unlockedAt) {
          await this.unlockAchievement(milestone.id);
          newlyUnlocked.push(achievement);
        }
      }
    }

    return newlyUnlocked;
  }

  static async checkReductionAchievements(todayUsage: number, weeklyAverage: number): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    const newlyUnlocked: Achievement[] = [];

    // Hour reduction achievement
    if (weeklyAverage - todayUsage >= 60) {
      const achievement = achievements.find(a => a.id === 'hour_reduction');
      if (achievement && !achievement.unlockedAt) {
        await this.unlockAchievement('hour_reduction');
        newlyUnlocked.push(achievement);
      }
    }

    // Half usage achievement
    if (todayUsage <= weeklyAverage / 2) {
      const achievement = achievements.find(a => a.id === 'half_usage');
      if (achievement && !achievement.unlockedAt) {
        await this.unlockAchievement('half_usage');
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  static async checkConsistencyAchievements(goalAchievements: number): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    const newlyUnlocked: Achievement[] = [];

    if (goalAchievements >= 6) {
      const achievement = achievements.find(a => a.id === 'consistency_king');
      if (achievement && !achievement.unlockedAt) {
        await this.unlockAchievement('consistency_king');
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  static async resetAchievements(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.DEFAULT_ACHIEVEMENTS));
    } catch (error) {
      console.error('Error resetting achievements:', error);
    }
  }
}