import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

interface BackupData {
  version: string;
  timestamp: string;
  dailyUsage: any[];
  settings: any;
  achievements: any[];
  customGoals: any[];
  dailyGoals: any[];
  streaks: any[];
}

export class CloudSyncService {
  private static readonly BACKUP_VERSION = '1.0.0';
  private static readonly BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;

  static async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.BACKUP_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize backup directory:', error);
    }
  }

  static async exportData(): Promise<void> {
    try {
      await this.initialize();
      
      // Collect all data from AsyncStorage
      const dailyUsage = await AsyncStorage.getItem('daily_usage');
      const settings = await AsyncStorage.getItem('settings');
      const achievements = await AsyncStorage.getItem('achievements');
      const customGoals = await AsyncStorage.getItem('custom_goals');
      const dailyGoals = await AsyncStorage.getItem('daily_goals');
      const streaks = await AsyncStorage.getItem('streaks');

      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        dailyUsage: dailyUsage ? JSON.parse(dailyUsage) : [],
        settings: settings ? JSON.parse(settings) : {},
        achievements: achievements ? JSON.parse(achievements) : [],
        customGoals: customGoals ? JSON.parse(customGoals) : [],
        dailyGoals: dailyGoals ? JSON.parse(dailyGoals) : [],
        streaks: streaks ? JSON.parse(streaks) : [],
      };

      const fileName = `screenstreak_backup_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${this.BACKUP_DIR}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));
      
      // Share the backup file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Save ScreenStreak Backup',
        });
      } else {
        Alert.alert(
          'Backup Created',
          `Backup saved to: ${filePath}`,
          [{ text: 'OK' }]
        );
      }

      await AsyncStorage.setItem('last_backup', new Date().toISOString());
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Unable to create backup file. Please try again.');
    }
  }

  static async importData(): Promise<void> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const backupData: BackupData = JSON.parse(fileContent);

      if (backupData.version !== this.BACKUP_VERSION) {
        Alert.alert(
          'Version Mismatch',
          'This backup file was created with a different version of ScreenStreak. Import may not work correctly.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => this.performImport(backupData) }
          ]
        );
      } else {
        await this.performImport(backupData);
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Unable to read backup file. Please check the file format.');
    }
  }

  private static async performImport(backupData: BackupData): Promise<void> {
    try {
      // Restore all data to AsyncStorage
      if (backupData.dailyUsage) {
        await AsyncStorage.setItem('daily_usage', JSON.stringify(backupData.dailyUsage));
      }
      if (backupData.settings) {
        await AsyncStorage.setItem('settings', JSON.stringify(backupData.settings));
      }
      if (backupData.achievements) {
        await AsyncStorage.setItem('achievements', JSON.stringify(backupData.achievements));
      }
      if (backupData.customGoals) {
        await AsyncStorage.setItem('custom_goals', JSON.stringify(backupData.customGoals));
      }
      if (backupData.dailyGoals) {
        await AsyncStorage.setItem('daily_goals', JSON.stringify(backupData.dailyGoals));
      }
      if (backupData.streaks) {
        await AsyncStorage.setItem('streaks', JSON.stringify(backupData.streaks));
      }

      await AsyncStorage.setItem('last_import', new Date().toISOString());
      
      Alert.alert(
        'Import Successful',
        'Your ScreenStreak data has been restored successfully. The app will restart to apply all changes.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Import restoration error:', error);
      Alert.alert('Import Failed', 'Failed to restore data. Please try again.');
    }
  }

  static async createAutoBackup(): Promise<void> {
    try {
      const lastBackup = await AsyncStorage.getItem('last_auto_backup');
      const now = new Date();
      const lastBackupDate = lastBackup ? new Date(lastBackup) : new Date(0);
      
      const daysSinceBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceBackup >= 7) {
        await this.exportData();
        await AsyncStorage.setItem('last_auto_backup', now.toISOString());
      }
    } catch (error) {
      console.error('Auto backup error:', error);
    }
  }

  static async getLastBackupDate(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('last_backup');
    } catch (error) {
      console.error('Failed to get last backup date:', error);
      return null;
    }
  }

  static async getBackupStatus(): Promise<{ lastBackup: string | null; autoBackupEnabled: boolean }> {
    try {
      const lastBackup = await AsyncStorage.getItem('last_backup');
      const autoBackupEnabled = await AsyncStorage.getItem('auto_backup_enabled');
      
      return {
        lastBackup,
        autoBackupEnabled: autoBackupEnabled === 'true'
      };
    } catch (error) {
      console.error('Failed to get backup status:', error);
      return { lastBackup: null, autoBackupEnabled: false };
    }
  }
}