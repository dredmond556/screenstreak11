import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { X, Award, Trophy, Star, Target, Calendar, Zap } from 'lucide-react-native';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  category: 'streak' | 'reduction' | 'milestone';
}

interface AchievementModalProps {
  visible: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export function AchievementModal({ visible, onClose, achievements }: AchievementModalProps) {
  const getAchievementIcon = (iconName: string, isUnlocked: boolean) => {
    const color = isUnlocked ? '#fbbf24' : '#6b7280';
    const size = 24;
    
    switch (iconName) {
      case 'trophy':
        return <Trophy size={size} color={color} />;
      case 'star':
        return <Star size={size} color={color} />;
      case 'target':
        return <Target size={size} color={color} />;
      case 'calendar':
        return <Calendar size={size} color={color} />;
      case 'zap':
        return <Zap size={size} color={color} />;
      default:
        return <Award size={size} color={color} />;
    }
  };

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const isUnlocked = !!item.unlockedAt;
    
    return (
      <View style={[styles.achievementCard, !isUnlocked && styles.lockedCard]}>
        <View style={styles.achievementHeader}>
          <View style={[styles.iconContainer, !isUnlocked && styles.lockedIcon]}>
            {getAchievementIcon(item.icon, isUnlocked)}
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementTitle, !isUnlocked && styles.lockedText]}>
              {item.title}
            </Text>
            <Text style={[styles.achievementDescription, !isUnlocked && styles.lockedText]}>
              {item.description}
            </Text>
            {isUnlocked && item.unlockedAt && (
              <Text style={styles.unlockedDate}>
                Unlocked {item.unlockedAt.toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

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
            <Award size={28} color="#fbbf24" />
            <Text style={styles.headerTitle}>Achievements</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {unlockedCount} of {achievements.length} achievements unlocked
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(unlockedCount / achievements.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <FlatList
          data={achievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  statsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  statsText: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  achievementCard: {
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
  lockedCard: {
    opacity: 0.6,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  lockedIcon: {
    backgroundColor: '#1f2937',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  lockedText: {
    color: '#6b7280',
  },
  unlockedDate: {
    fontSize: 12,
    color: '#34d399',
    marginTop: 4,
    fontWeight: '500',
  },
});