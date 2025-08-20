import { Platform } from 'react-native';
import * as Device from 'expo-device';

const MIN_IOS_MAJOR = 16;

function getIosMajorVersion(): number {
  if (Platform.OS !== 'ios') return 0;
  const versionString = Device.osVersion ?? '';
  const major = parseInt(versionString.split('.')[0] || '0', 10);
  return Number.isNaN(major) ? 0 : major;
}

export const AppleScreenTimeBridge = {
  isSupported(): boolean {
    return Platform.OS === 'ios' && getIosMajorVersion() >= MIN_IOS_MAJOR;
  },

  async requestAuthorization(): Promise<boolean> {
    if (!this.isSupported()) return false;
    // Stub: Simulate async authorization flow
    return new Promise((resolve) => setTimeout(() => resolve(true), 600));
  },

  async presentActivityPicker(): Promise<boolean> {
    if (!this.isSupported()) return false;
    // Stub: In real impl, present FamilyActivityPicker
    return new Promise((resolve) => setTimeout(() => resolve(true), 400));
  },

  async startObservations(): Promise<boolean> {
    if (!this.isSupported()) return false;
    // Stub: In real impl, configure DeviceActivity schedule
    return new Promise((resolve) => setTimeout(() => resolve(true), 300));
  },

  async stopObservations(): Promise<void> {
    return;
  },

  async getTodayUsageFromNative(): Promise<number> {
    if (!this.isSupported()) return 0;
    // Stub: In real impl, read from App Group shared storage
    return 0;
  }
};

