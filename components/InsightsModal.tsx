import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, ChartBar as BarChart3, Clock, TrendingDown, TrendingUp, Calendar, Smartphone } from 'lucide-react-native';
import { ScreenTimeService } from '@/services/ScreenTimeService';

interface InsightsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface UsageInsight {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

export function InsightsModal({ visible, onClose }: InsightsModalProps) {
  const [insights, setInsights] = useState<UsageInsight[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadInsights();
    }
  }, [visible]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const weeklyData = await ScreenTimeService.getWeeklyData();
      const weeklyAverage = await ScreenTimeService.getWeeklyAverage();
      const todayUsage = await ScreenTimeService.getTodayUsage();
      const goalAchievements = await ScreenTimeService.getGoalAchievements();
      const currentStreak = await ScreenTimeService.getCurrentStreak();

      setWeeklyData(weeklyData);

      // Calculate insights
      const validData = weeklyData.filter(usage => usage > 0);
      const previousWeekAverage = validData.length > 3 ? 
        validData.slice(0, 3).reduce((sum, usage) => sum + usage, 0) / 3 : weeklyAverage;
      const recentAverage = validData.length > 3 ? 
        validData.slice(-3).reduce((sum, usage) => sum + usage, 0) / 3 : weeklyAverage;

      const weeklyChange = previousWeekAverage > 0 ? 
        ((recentAverage - previousWeekAverage) / previousWeekAverage) * 100 : 0;

      const peakUsageDay = Math.max(...validData);
      const lowUsageDay = Math.min(...validData.filter(usage => usage > 0));
      const usageVariability = peakUsageDay - lowUsageDay;

      const insightsData: UsageInsight[] = [
        {
          title: 'Weekly Trend',
          value: formatTime(weeklyAverage),
          change: `${Math.abs(weeklyChange).toFixed(1)}% ${weeklyChange < 0 ? 'decrease' : 'increase'}`,
          trend: weeklyChange < 0 ? 'down' : weeklyChange > 0 ? 'up' : 'neutral',
          description: weeklyChange < 0 ? 
            'Great progress! Your usage is trending downward.' :
            'Your usage has increased. Consider adjusting your goals.'
        },
        {
          title: 'Today vs Average',
          value: formatTime(todayUsage),
          change: `${Math.abs(todayUsage - weeklyAverage)} min ${todayUsage < weeklyAverage ? 'below' : 'above'} average`,
          trend: todayUsage < weeklyAverage ? 'down' : todayUsage > weeklyAverage ? 'up' : 'neutral',
          description: todayUsage < weeklyAverage ?
            'You\'re doing well today! Keep it up.' :
            'Today\'s usage is higher than usual. Stay mindful.'
        },
        {
          title: 'Goal Success Rate',
          value: `${Math.round((goalAchievements / 7) * 100)}%`,
          change: `${goalAchievements}/7 days achieved`,
          trend: goalAchievements >= 5 ? 'down' : goalAchievements >= 3 ? 'neutral' : 'up',
          description: goalAchievements >= 5 ?
            'Excellent consistency! You\'re building strong habits.' :
            'Room for improvement. Small steps lead to big changes.'
        },
        {
          title: 'Usage Consistency',
          value: formatTime(usageVariability),
          change: usageVariability < 60 ? 'Very consistent' : usageVariability < 120 ? 'Moderately consistent' : 'Highly variable',
          trend: usageVariability < 60 ? 'down' : usageVariability < 120 ? 'neutral' : 'up',
          description: usageVariability < 60 ?
            'Your usage patterns are very consistent.' :
            'Your usage varies significantly day to day.'
        }
      ];

      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color="#f87171" />;
      case 'down':
        return <TrendingDown size={16} color="#34d399" />;
      default:
        return <BarChart3 size={16} color="#60a5fa" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '#f87171';
      case 'down':
        return '#34d399';
      default:
        return '#60a5fa';
    }
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <BarChart3 size={28} color="#60a5fa" />
            <Text style={styles.headerTitle}>Usage Insights</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Analyzing your usage patterns...</Text>
            </View>
          ) : (
            <>
              {/* Weekly Overview */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly Overview</Text>
                <View style={styles.weeklyChart}>
                  {weeklyData.map((usage, index) => {
                    const maxUsage = Math.max(...weeklyData.filter(u => u > 0));
                    const height = maxUsage > 0 ? (usage / maxUsage) * 80 : 0;
                    
                    return (
                      <View key={index} style={styles.chartDay}>
                        <View style={styles.chartBarContainer}>
                          <View 
                            style={[
                              styles.chartBar, 
                              { height: Math.max(height, 4) }
                            ]} 
                          />
                        </View>
                        <Text style={styles.chartLabel}>{dayLabels[index]}</Text>
                        <Text style={styles.chartValue}>{formatTime(usage)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Insights Cards */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Insights</Text>
                {insights.map((insight, index) => (
                  <View key={index} style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <View style={styles.trendContainer}>
                        {getTrendIcon(insight.trend)}
                      </View>
                    </View>
                    <Text style={styles.insightValue}>{insight.value}</Text>
                    <Text style={[styles.insightChange, { color: getTrendColor(insight.trend) }]}>
                      {insight.change}
                    </Text>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                  </View>
                ))}
              </View>

              {/* Tips Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personalized Tips</Text>
                <View style={styles.tipCard}>
                  <Clock size={20} color="#60a5fa" />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Peak Usage Time</Text>
                    <Text style={styles.tipDescription}>
                      Most people use their phones heavily between 7-9 PM. Consider setting a reminder to put your phone away during this time.
                    </Text>
                  </View>
                </View>
                <View style={styles.tipCard}>
                  <Smartphone size={20} color="#34d399" />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Mindful Usage</Text>
                    <Text style={styles.tipDescription}>
                      Before picking up your phone, pause and ask: "What am I looking for?" This simple question can reduce mindless scrolling.
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    height: 140,
  },
  chartDay: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartBar: {
    width: 20,
    backgroundColor: '#60a5fa',
    borderRadius: 2,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 10,
    color: '#6b7280',
  },
  insightCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
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
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  trendContainer: {
    padding: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  insightChange: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
});