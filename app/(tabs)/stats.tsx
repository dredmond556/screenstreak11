import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Calendar, TrendingDown, Share2, Users, Smartphone, Award } from 'lucide-react-native';
import { ScreenTimeService } from '@/services/ScreenTimeService';


export default function StatsScreen() {
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [totalWeeklyUsage, setTotalWeeklyUsage] = useState(0);
  const [goalAchievements, setGoalAchievements] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await ScreenTimeService.getWeeklyData();
    const average = await ScreenTimeService.getWeeklyAverage();
    const achievements = await ScreenTimeService.getGoalAchievements();
    const longest = await ScreenTimeService.getLongestStreak();
    
    setWeeklyData(data);
    setWeeklyAverage(average);
    setTotalWeeklyUsage(data.reduce((sum, day) => sum + day, 0));
    setGoalAchievements(achievements);
    setLongestStreak(longest);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const shareWeeklyStats = async () => {
    try {
      const message = `📱 My ScreenStreak Weekly Report:\n\n` +
        `📊 Weekly Average: ${formatTime(weeklyAverage)}\n` +
        `🎯 Goals Achieved: ${goalAchievements}/7 days\n` +
        `🧠 Current Streak: ${await ScreenTimeService.getCurrentStreak()} days\n` +
        `🏆 Longest Streak: ${longestStreak} days\n\n` +
        `Building better digital habits with ScreenStreak! 💪`;

      await Share.share({
        message,
        title: 'My ScreenStreak Progress'
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share stats at this time.');
    }
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: 28 }]}>
          <View style={styles.headerTitleContainer}>
            <Smartphone size={28} color="#60a5fa" />
            <Text style={styles.headerTitle}>Your ScreenStreak</Text>
          </View>
          <Text style={styles.headerSubtitle}>Track your progress and stay accountable</Text>
        </View>

        {/* Overview removed for simplicity; keep weekly + history */}

        {/* Weekly Chart */}
        <View style={styles.weeklySection}>
          <Text style={styles.sectionTitle}>This Week's Progress</Text>
          <View style={styles.weeklyContainer}>
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyStatItem}>
                <Text style={styles.weeklyStatValue}>{goalAchievements}/7</Text>
                <Text style={styles.weeklyStatLabel}>Goals Met</Text>
              </View>
              <View style={styles.weeklyStatItem}>
                <Text style={styles.weeklyStatValue}>{formatTime(weeklyAverage)}</Text>
                <Text style={styles.weeklyStatLabel}>Daily Average</Text>
              </View>
            </View>
            
            {/* Simple Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Weekly Goal Progress</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${Math.min((goalAchievements / 7) * 100, 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round((goalAchievements / 7) * 100)}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Share Section */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share & Stay Accountable</Text>
          <TouchableOpacity style={styles.shareButton} onPress={shareWeeklyStats}>
            <Share2 size={20} color="#ffffff" />
            <Text style={styles.shareButtonText}>Share Weekly Progress</Text>
          </TouchableOpacity>
          <Text style={styles.shareDescription}>
            Share your weekly average and streak with friends to stay accountable. 
            No personal data or app usage details are shared.
          </Text>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>7-Day History</Text>
          {weeklyData.map((usage, index) => {
            const isToday = index === 6; // Assuming Sunday is current day
            const isUnderAverage = usage < weeklyAverage;
            
            return (
              <View 
                key={index} 
                style={[
                  styles.dayRow,
                  isToday && styles.todayRow
                ]}
              >
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                    {dayLabels[index]} {isToday && '(Today)'}
                  </Text>
                  <View style={styles.dayStatsContainer}>
                    <Text style={[styles.dayUsage, isToday && styles.todayUsage]}>
                      {formatTime(usage)}
                    </Text>
                    {isUnderAverage && (
                      <View style={styles.achievementBadge}>
                        <Text style={styles.achievementText}>✓</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
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
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 160,
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
  statsGrid: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  overviewCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
  },
  cardLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  weeklySection: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 16,
  },
  weeklyContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  weeklyStatItem: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  weeklyStatLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34d399',
    minWidth: 40,
    textAlign: 'right',
  },
  breakdownSection: {
    paddingHorizontal: 24,
  },
  dayRow: {
    backgroundColor: '#1f2937',
    padding: 24,
    borderRadius: 12,
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
  todayRow: {
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
  },
  todayLabel: {
    color: '#60a5fa',
  },
  dayStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayUsage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  todayUsage: {
    color: '#60a5fa',
  },
  achievementBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  shareSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#60a5fa',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareDescription: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});