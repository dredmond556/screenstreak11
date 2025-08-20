import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking, Modal, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Target, TrendingDown, Award, CreditCard as Edit3, Calendar, MessageCircle, Smartphone, ChevronDown, Shield, Bell, ChartBar as BarChart3, Plus, Zap, Snowflake } from 'lucide-react-native';
import { CircularProgress } from '@/components/CircularProgress';
import { AchievementModal } from '@/components/AchievementModal';
import { CustomGoalModal } from '@/components/CustomGoalModal';
import { InsightsModal } from '@/components/InsightsModal';
import { ScreenTimeService } from '@/services/ScreenTimeService';
import { NotificationService } from '@/services/NotificationService';
import { AchievementService, Achievement } from '@/services/AchievementService';
import { CustomGoalService, CustomGoal } from '@/services/CustomGoalService';
import { StreakFreezeService } from '@/services/StreakFreezeService';
// Haptics temporarily disabled to avoid dependency resolution issues on SDK 53

export default function HomeScreen() {
  const [todayUsage, setTodayUsage] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [goalReduction, setGoalReduction] = useState(10);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualTime, setManualTime] = useState('');
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [showReductionModal, setShowReductionModal] = useState(false);
  const [hasScreenTimePermission, setHasScreenTimePermission] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCustomGoals, setShowCustomGoals] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadData();
    checkScreenTimePermission();
    loadAchievements();
    loadCustomGoals();
    checkNotificationPermissions();
    // Update every minute in a real app
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const usage = await ScreenTimeService.getTodayUsage();
    const average = await ScreenTimeService.getWeeklyAverage();
    const goal = await ScreenTimeService.getDailyGoal();
    const streak = await ScreenTimeService.getCurrentStreak();
    const reduction = await ScreenTimeService.getGoalReduction();
    const completed = await ScreenTimeService.getDaysCompleted();

    setTodayUsage(usage);
    setWeeklyAverage(average);
    setDailyGoal(goal);
    setCurrentStreak(streak);
    setGoalReduction(reduction);
    setDaysCompleted(completed);
  };

  const loadAchievements = async () => {
    const achievementData = await AchievementService.getAchievements();
    setAchievements(achievementData);
  };

  const loadCustomGoals = async () => {
    const goals = await CustomGoalService.getActiveGoals();
    setCustomGoals(goals);
  };

  const checkNotificationPermissions = async () => {
    const hasPermission = await NotificationService.requestPermissions();
    setNotificationsEnabled(hasPermission);
  };

  const checkScreenTimePermission = async () => {
    const hasPermission = await ScreenTimeService.hasScreenTimePermission();
    setHasScreenTimePermission(hasPermission);
  };

  const requestScreenTimeAccess = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Screen time tracking is only available on iOS devices.');
      return;
    }

    Alert.alert(
      'Enable Screen Time Tracking',
      'ScreenStreak can provide more accurate tracking by accessing your device\'s screen time data. This data stays on your device and is never shared.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            const granted = await ScreenTimeService.requestScreenTimePermission();
            if (granted) {
              setHasScreenTimePermission(true);
              Alert.alert('Success', 'Screen time access enabled! Your data will now be more accurate.');
              loadData();
            } else {
              Alert.alert('Permission Denied', 'You can enable screen time access later in Settings > Privacy & Security > Screen Time.');
            }
          }
        }
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

  const progressPercentage = dailyGoal > 0 ? Math.min((todayUsage / dailyGoal) * 100, 100) : 0;
  const isOnTrack = todayUsage <= dailyGoal;
  const timeRemaining = Math.max(0, dailyGoal - todayUsage);
  const isNearLimit = timeRemaining <= 10 && timeRemaining > 0;

  const handleManualEntry = async () => {
    const minutes = parseInt(manualTime);
    if (isNaN(minutes) || minutes < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of minutes.');
      return;
    }
    
    await ScreenTimeService.setTodayUsage(minutes);
    setManualTime('');
    setShowManualEntry(false);
    loadData();
    // Haptics disabled
    Alert.alert('Success', 'Your screen time has been updated.');
  };

  const checkWeeklyCompletion = async () => {
    if (daysCompleted >= 7) {
      const failedDays = 7 - await ScreenTimeService.getGoalAchievements();
      
      if (failedDays > 3) {
        Alert.alert(
          'Week Complete - Consider Adjusting Your Pace',
          `You completed the week but missed your goal ${failedDays} out of 7 days. Would you like to continue at a slower pace or keep the same challenge level?`,
          [
            {
              text: 'Slower Pace',
              onPress: () => {
                const newReduction = Math.max(1, goalReduction - 2);
                ScreenTimeService.setGoalReduction(newReduction);
                setGoalReduction(newReduction);
                Alert.alert('Pace Adjusted', `Your daily reduction goal has been lowered to ${newReduction} minutes. Building habits takes time - be patient with yourself!`);
              }
            },
            {
              text: 'Same Pace',
              onPress: () => {
                Alert.alert('Keep Going!', 'Sometimes consistency matters more than perfection. You\'ve got this!');
              }
            },
            {
              text: 'Take a Break',
              style: 'cancel',
              onPress: () => Alert.alert('Rest Well', 'Take the time you need. Your journey toward better digital habits will be here when you\'re ready.')
            }
          ]
        );
      } else {
      Alert.alert(
          'Excellent Week! 🎉',
          `Amazing work! You met your goal ${7 - failedDays} out of 7 days. Ready to continue building your streak?`,
        [
          {
              text: 'Continue Streak',
              onPress: () => {
                Alert.alert('Outstanding!', 'Your discipline is inspiring. Keep building that streak!');
              }
            },
            {
              text: 'Increase Challenge',
              onPress: () => {
                const newReduction = Math.min(15, goalReduction + 2);
                ScreenTimeService.setGoalReduction(newReduction);
                setGoalReduction(newReduction);
                Alert.alert('Challenge Increased!', `Your daily reduction goal has been increased to ${newReduction} minutes. You're ready for the next level!`);
              }
            },
            {
              text: 'Take a Break',
            style: 'cancel',
              onPress: () => Alert.alert('Well Deserved!', 'Enjoy your break. You\'ve earned it with your excellent progress!')
          }
        ]
      );
      }
    }
  };

  const shareProgressWithFriend = () => {
    const message = `📱 ScreenStreak Progress Update!\n\n🧠 Current Streak: ${currentStreak} days\n📊 Daily Goal: ${formatTime(dailyGoal)}\n📈 Today's Usage: ${formatTime(todayUsage)}\n\nTapering off smartphone addiction one day at a time! 💪`;
    const url = `sms:?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open messaging app');
    });
  };

  const handleReductionChange = async (minutes: number) => {
    await ScreenTimeService.setGoalReduction(minutes);
    setGoalReduction(minutes);
    setShowReductionModal(false);
    loadData();
    Alert.alert('Goal Updated', `Your daily reduction goal has been set to ${minutes} minutes.`);
  };

  const handleAchievementPress = async () => {
    setShowAchievements(true);
  };

  const handleCustomGoalCreated = (goal: CustomGoal) => {
    setCustomGoals(prev => [...prev, goal]);
    Alert.alert('Goal Created', `Your custom goal "${goal.title}" has been created!`);
  };

  useEffect(() => {
    checkWeeklyCompletion();
    updateAchievements();
  }, [daysCompleted]);

  const updateAchievements = async () => {
    // Check for new achievements
    const newStreakAchievements = await AchievementService.checkStreakAchievements(currentStreak);
    const newReductionAchievements = await AchievementService.checkReductionAchievements(todayUsage, weeklyAverage);
    
    if (newStreakAchievements.length > 0 || newReductionAchievements.length > 0) {
      await loadAchievements();
      
      // Show achievement notification
      const allNew = [...newStreakAchievements, ...newReductionAchievements];
      if (allNew.length > 0) {
        Alert.alert(
          '🏆 Achievement Unlocked!',
          `You've earned: ${allNew.map(a => a.title).join(', ')}`,
          [{ text: 'View Achievements', onPress: () => setShowAchievements(true) }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Smartphone size={32} color="#60a5fa" />
            <Text style={styles.headerTitle}>ScreenStreak</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Taper off your Smartphone addiction
          </Text>
        </View>

        {/* Main Progress Circle */}
        <View style={styles.progressSection}>
          <CircularProgress
            size={200}
            progress={progressPercentage}
            strokeWidth={12}
            color={isNearLimit ? '#fbbf24' : isOnTrack ? '#34d399' : '#f87171'}
            backgroundColor="#374151"
          />
          <View style={styles.progressContent}>
            <Text style={styles.usageTime}>{formatTime(todayUsage)}</Text>
            <Text style={styles.usageLabel}>used today</Text>
          </View>
        </View>

        {/* Goal Reduction Selector */}
        <View style={styles.goalSelector}>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowReductionModal(true)}>
            <Text style={styles.dropdownText}>Daily Reduction: {goalReduction} minutes</Text>
            <ChevronDown size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Goal Status */}
        <View style={[styles.goalCard, { backgroundColor: isOnTrack ? '#064e3b' : '#7f1d1d' }]}>
          <View style={styles.goalHeader}>
            <Target size={24} color={isOnTrack ? '#34d399' : '#f87171'} />
            <Text style={[styles.goalTitle, { color: isOnTrack ? '#10B981' : '#EF4444' }]}>
              {isOnTrack ? 'Streak Safe! 🧠' : 'Streak at Risk! ⚠️'}
            </Text>
          </View>
          <Text style={styles.goalDescription}>
            {isOnTrack 
              ? `You have ${formatTime(timeRemaining)} remaining today`
              : `You've exceeded your goal by ${formatTime(todayUsage - dailyGoal)}. Don't break the streak!`
            }
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingDown size={20} color="#60a5fa" />
            </View>
            <Text style={styles.statValue}>{formatTime(weeklyAverage)}</Text>
            <Text style={styles.statLabel}>Weekly Average</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Target size={20} color="#34d399" />
            </View>
            <Text style={styles.statValue}>{formatTime(dailyGoal)}</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Award size={20} color="#fbbf24" />
            </View>
            <Text style={styles.statValue}>{currentStreak} 🧠</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Calendar size={20} color="#a78bfa" />
            </View>
            <Text style={styles.statValue}>{daysCompleted}/7</Text>
            <Text style={styles.statLabel}>Days This Week</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {!hasScreenTimePermission && Platform.OS === 'ios' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.permissionButton]} 
              onPress={requestScreenTimeAccess}
            >
              <Shield size={20} color="#34d399" />
              <Text style={[styles.actionButtonText, styles.permissionButtonText]}>Enable Screen Time Tracking</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowManualEntry(!showManualEntry)}
          >
            <Edit3 size={20} color="#60a5fa" />
            <Text style={styles.actionButtonText}>Manual Time Entry</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={shareProgressWithFriend}
          >
            <MessageCircle size={20} color="#60a5fa" />
            <Text style={styles.actionButtonText}>Share Progress with a Friend</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={async () => {
              const ok = await StreakFreezeService.useFreezeForToday();
              if (ok) {
                // Haptics disabled
                Alert.alert('Freeze Used', 'Today will not break your streak. Limited passes per month.');
                loadData();
              } else {
                // Haptics disabled
                Alert.alert('No Passes Left', 'You have used all freeze passes for this month.');
              }
            }}
          >
            <Snowflake size={20} color="#60a5fa" />
            <Text style={styles.actionButtonText}>Use Streak Freeze</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowInsights(true)}
          >
            <Zap size={20} color="#60a5fa" />
            <Text style={styles.actionButtonText}>View Usage Insights</Text>
          </TouchableOpacity>

          {showManualEntry && (
            <View style={styles.manualEntryCard}>
              <Text style={styles.manualEntryTitle}>Enter Today's Screen Time</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.timeInput}
                  value={manualTime}
                  onChangeText={setManualTime}
                  placeholder="Minutes"
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleManualEntry}>
                  <Text style={styles.submitButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <TouchableOpacity style={styles.quickStat} onPress={handleAchievementPress}>
            <Award size={16} color="#fbbf24" />
            <Text style={styles.quickStatValue}>{achievements.filter(a => a.unlockedAt).length}</Text>
            <Text style={styles.quickStatLabel}>Achievements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickStat} onPress={() => setShowInsights(true)}>
            <BarChart3 size={16} color="#60a5fa" />
            <Text style={styles.quickStatValue}>{formatTime(weeklyAverage)}</Text>
            <Text style={styles.quickStatLabel}>Weekly Avg</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickStat} onPress={() => setShowCustomGoals(true)}>
            <Plus size={16} color="#34d399" />
            <Text style={styles.quickStatValue}>{customGoals.length}</Text>
            <Text style={styles.quickStatLabel}>Custom Goals</Text>
          </TouchableOpacity>
        </View>


        {/* Reduction Goal Modal */}
        <Modal
          visible={showReductionModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowReductionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Daily Reduction Goal</Text>
              {[1, 2, 5, 10].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[styles.modalOption, goalReduction === minutes && styles.selectedModalOption]}
                  onPress={() => handleReductionChange(minutes)}
                >
                  <Text style={[styles.modalOptionText, goalReduction === minutes && styles.selectedModalOptionText]}>{minutes} minutes</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Achievement Modal */}
        <AchievementModal
          visible={showAchievements}
          onClose={() => setShowAchievements(false)}
          achievements={achievements}
        />

        {/* Custom Goal Modal */}
        <CustomGoalModal
          visible={showCustomGoals}
          onClose={() => setShowCustomGoals(false)}
          onGoalCreated={handleCustomGoalCreated}
        />

        {/* Insights Modal */}
        <InsightsModal
          visible={showInsights}
          onClose={() => setShowInsights(false)}
        />
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
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#1f2937',
    borderBottomWidth: 0,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f9fafb',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: 40,
    position: 'relative',
  },
  progressContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageTime: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  usageLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  goalSelector: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dropdownText: {
    fontSize: 16,
    color: '#f9fafb',
    fontWeight: '500',
  },
  goalCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualEntryCard: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    borderWidth: 0,
  },
  manualEntryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 0,
    fontSize: 16,
    color: '#f9fafb',
  },
  submitButton: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedModalOption: {
    backgroundColor: '#60a5fa',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  selectedModalOptionText: {
    color: '#1f2937',
  },
  permissionButton: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  permissionButtonText: {
    color: '#34d399',
  },
  quickStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  quickStat: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});