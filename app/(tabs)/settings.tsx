import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Target, Trash2, Info, Smartphone, TriangleAlert as AlertTriangle, Shield } from 'lucide-react-native';
import { ScreenTimeService } from '@/services/ScreenTimeService';

const REDUCTION_OPTIONS = [1, 2, 5, 10];

export default function SettingsScreen() {
  const [goalReduction, setGoalReduction] = useState(10);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hasScreenTimePermission, setHasScreenTimePermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkScreenTimePermission();
  }, []);

  const loadSettings = async () => {
    const reduction = await ScreenTimeService.getGoalReduction();
    const average = await ScreenTimeService.getWeeklyAverage();
    const streak = await ScreenTimeService.getCurrentStreak();
    
    setGoalReduction(reduction);
    setWeeklyAverage(average);
    setCurrentStreak(streak);
  };

  const handleReductionChange = async (minutes: number) => {
    setGoalReduction(minutes);
    await ScreenTimeService.setGoalReduction(minutes);
    Alert.alert(
      'Goal Updated',
      `Your daily reduction goal has been set to ${minutes} minutes less than your weekly average.`
    );
  };

  const checkScreenTimePermission = async () => {
    const granted = await ScreenTimeService.hasScreenTimePermission();
    setHasScreenTimePermission(granted);
  };

  const enableScreenTimeAccess = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Screen time tracking is only available on iOS devices.');
      return;
    }
    const granted = await ScreenTimeService.requestScreenTimePermission();
    if (granted) {
      setHasScreenTimePermission(true);
      Alert.alert('Success', 'Screen time access enabled! Your data will now be more accurate.');
    } else {
      Alert.alert('Permission Denied', 'You can enable screen time access later in iOS Settings.');
    }
  };

  const openSystemSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert('Unavailable', 'Unable to open system settings on this device.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your tracking data and start fresh. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await ScreenTimeService.resetAllData();
            setCurrentStreak(0);
            Alert.alert('Success', 'All data has been reset.');
            loadSettings();
          },
        },
      ]
    );
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const currentGoal = Math.max(0, weeklyAverage - goalReduction);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Smartphone size={28} color="#60a5fa" />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <Text style={styles.headerSubtitle}>Customize your streak goals</Text>
        </View>

        {/* Current Goal Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Info size={24} color="#60a5fa" />
            <Text style={styles.infoTitle}>Your Streak Goal</Text>
          </View>
          <Text style={styles.infoText}>
            Stay under <Text style={styles.highlight}>{formatTime(currentGoal)}</Text> daily to maintain your streak!
            {'\n'}({formatTime(weeklyAverage)} average - {goalReduction} minutes)
          </Text>
        </View>

        {/* Goal Reduction Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={24} color="#f9fafb" />
            <Text style={styles.sectionTitle}>Streak Challenge Level</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Choose how many minutes less than your weekly average you need to stay under to keep your streak alive.
          </Text>

          <View style={styles.optionsGrid}>
            {REDUCTION_OPTIONS.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.optionCard,
                  goalReduction === minutes && styles.selectedOption
                ]}
                onPress={() => handleReductionChange(minutes)}
              >
                <Text style={[
                  styles.optionValue,
                  goalReduction === minutes && styles.selectedOptionText
                ]}>
                  {minutes}
                </Text>
                <Text style={[
                  styles.optionLabel,
                  goalReduction === minutes && styles.selectedOptionText
                ]}>
                  minutes
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{currentStreak}</Text>
              <Text style={styles.summaryLabel}>Day Streak</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{formatTime(weeklyAverage)}</Text>
              <Text style={styles.summaryLabel}>Weekly Average</Text>
            </View>
          </View>
        </View>

        {/* Screen Time Access (iOS) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color="#34d399" />
            <Text style={styles.sectionTitle}>Screen Time Access</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Enable iOS Screen Time access to auto-populate your daily usage. Your data stays on device.
          </Text>
          {Platform.OS === 'ios' ? (
            <>
              {!hasScreenTimePermission && (
                <TouchableOpacity style={[styles.actionButton, styles.permissionButton]} onPress={enableScreenTimeAccess}>
                  <Shield size={20} color="#34d399" />
                  <Text style={[styles.actionButtonText, styles.permissionButtonText]}>Enable Screen Time Access</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionButton} onPress={openSystemSettings}>
                <Smartphone size={20} color="#60a5fa" />
                <Text style={styles.actionButtonText}>Open iOS Settings</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>Screen Time integration is available on iOS devices.</Text>
            </View>
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleResetData}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.actionButtonText}>Reset All Data</Text>
          </TouchableOpacity>
          
          <Text style={styles.warningText}>
            This will permanently delete all your tracking data and reset your streak.
          </Text>
        </View>

        {/* Building Self-Discipline Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Building Self-Discipline</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Start Small:</Text> Replace just minutes of screen time with a meaningful activity. Small wins build lasting discipline.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Schedule It:</Text> Treat these activities as important appointments with yourself. Self-discipline thrives on structure.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Stay Accountable:</Text> Share your progress with friends. External accountability strengthens internal discipline.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Celebrate Wins:</Text> Acknowledge every moment you choose a meaningful activity over mindless scrolling. You're building a better life.
            </Text>
          </View>
        </View>

        {/* Health Disclaimer */}
        <View style={styles.section}>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              ⚠️ <Text style={styles.disclaimerBold}>Health Notice:</Text> ScreenStreak helps reduce screen time through self-discipline. If you experience withdrawal symptoms that interfere with daily life, consult a healthcare professional.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#1f2937',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f9fafb',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  infoCard: {
    marginHorizontal: 24,
    marginTop: 24,
    padding: 20,
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    borderWidth: 0,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dbeafe',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#bfdbfe',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedOption: {
    borderColor: '#60a5fa',
    backgroundColor: '#1e3a8a',
  },
  optionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#dbeafe',
  },
  optionLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  permissionButton: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  permissionButtonText: {
    color: '#34d399',
  },
  warningText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tipCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#60a5fa',
  },
  tipText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '700',
    color: '#f9fafb',
  },
  disclaimerCard: {
    backgroundColor: '#7f1d1d',
    padding: 20,
    borderRadius: 12,
    borderWidth: 0,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#fecaca',
    lineHeight: 20,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: '#fef2f2',
  },
});