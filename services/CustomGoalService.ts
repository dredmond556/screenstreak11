import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'minutes' | 'hours' | 'days';
  deadline?: Date;
  createdAt: Date;
  completed: boolean;
}

export class CustomGoalService {
  private static readonly STORAGE_KEY = 'custom_goals';

  static async getActiveGoals(): Promise<CustomGoal[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const goals = JSON.parse(stored);
        // Convert date strings back to Date objects
        return goals.map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          deadline: goal.deadline ? new Date(goal.deadline) : undefined
        })).filter((goal: CustomGoal) => !goal.completed);
      }
      return [];
    } catch (error) {
      console.error('Error loading custom goals:', error);
      return [];
    }
  }

  static async getAllGoals(): Promise<CustomGoal[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const goals = JSON.parse(stored);
        return goals.map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          deadline: goal.deadline ? new Date(goal.deadline) : undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading all goals:', error);
      return [];
    }
  }

  static async createGoal(goal: Omit<CustomGoal, 'id' | 'createdAt' | 'completed'>): Promise<CustomGoal> {
    try {
      const newGoal: CustomGoal = {
        ...goal,
        id: Date.now().toString(),
        createdAt: new Date(),
        completed: false
      };

      const existingGoals = await this.getAllGoals();
      const updatedGoals = [...existingGoals, newGoal];
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedGoals));
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  static async updateGoalProgress(goalId: string, newValue: number): Promise<void> {
    try {
      const goals = await this.getAllGoals();
      const goalIndex = goals.findIndex(g => g.id === goalId);
      
      if (goalIndex >= 0) {
        goals[goalIndex].currentValue = newValue;
        
        // Check if goal is completed
        if (newValue >= goals[goalIndex].targetValue) {
          goals[goalIndex].completed = true;
        }
        
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  }

  static async completeGoal(goalId: string): Promise<void> {
    try {
      const goals = await this.getAllGoals();
      const goalIndex = goals.findIndex(g => g.id === goalId);
      
      if (goalIndex >= 0) {
        goals[goalIndex].completed = true;
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
      }
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  }

  static async deleteGoal(goalId: string): Promise<void> {
    try {
      const goals = await this.getAllGoals();
      const filteredGoals = goals.filter(g => g.id !== goalId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredGoals));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  }

  static async resetAllGoals(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting goals:', error);
    }
  }
}