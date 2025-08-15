import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  Dumbbell, 
  BookOpen, 
  Heart, 
  Palette, 
  Users, 
  Flower2, 
  Music, 
  ChefHat,
  PenTool,
  Puzzle,
  MapPin,
  Camera,
  Gamepad2,
  Headphones,
  Mountain,
  Coffee
} from 'lucide-react-native';

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  benefits: string[];
  timeNeeded: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const activities: Activity[] = [
  {
    id: 'exercise',
    title: 'Exercise & Fitness',
    description: 'Get your body moving and boost your energy levels',
    icon: <Dumbbell size={24} color="#f87171" />,
    color: '#fef2f2',
    benefits: ['Improved mood', 'Better sleep', 'Increased energy', 'Stress relief'],
    timeNeeded: '15-60 minutes',
    difficulty: 'Medium'
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Dive into books, articles, or audiobooks',
    icon: <BookOpen size={24} color="#60a5fa" />,
    color: '#eff6ff',
    benefits: ['Knowledge gain', 'Vocabulary expansion', 'Mental stimulation', 'Relaxation'],
    timeNeeded: '20-120 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'meditation',
    title: 'Meditation & Mindfulness',
    description: 'Practice mindfulness and inner peace',
    icon: <Heart size={24} color="#34d399" />,
    color: '#f0fdf4',
    benefits: ['Reduced anxiety', 'Better focus', 'Emotional balance', 'Self-awareness'],
    timeNeeded: '5-30 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'art',
    title: 'Art & Creativity',
    description: 'Express yourself through painting, drawing, or crafts',
    icon: <Palette size={24} color="#a78bfa" />,
    color: '#f5f3ff',
    benefits: ['Creative expression', 'Stress relief', 'Skill development', 'Sense of accomplishment'],
    timeNeeded: '30-180 minutes',
    difficulty: 'Medium'
  },
  {
    id: 'social',
    title: 'Social Activities',
    description: 'Spend quality time with friends and family',
    icon: <Users size={24} color="#fbbf24" />,
    color: '#fffbeb',
    benefits: ['Stronger relationships', 'Emotional support', 'Shared experiences', 'Communication skills'],
    timeNeeded: '60-240 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'gardening',
    title: 'Gardening',
    description: 'Connect with nature and grow something beautiful',
    icon: <Flower2 size={24} color="#22c55e" />,
    color: '#f0fdf4',
    benefits: ['Connection with nature', 'Physical activity', 'Fresh produce', 'Patience development'],
    timeNeeded: '30-120 minutes',
    difficulty: 'Medium'
  },
  {
    id: 'music',
    title: 'Learn an Instrument',
    description: 'Master a musical instrument or learn to sing',
    icon: <Music size={24} color="#ec4899" />,
    color: '#fdf2f8',
    benefits: ['Cognitive improvement', 'Creative outlet', 'Discipline', 'Cultural appreciation'],
    timeNeeded: '30-90 minutes',
    difficulty: 'Hard'
  },
  {
    id: 'cooking',
    title: 'Cooking & Baking',
    description: 'Experiment with new recipes and cuisines',
    icon: <ChefHat size={24} color="#f97316" />,
    color: '#fff7ed',
    benefits: ['Practical skills', 'Creativity', 'Healthier eating', 'Cost savings'],
    timeNeeded: '30-180 minutes',
    difficulty: 'Medium'
  },
  {
    id: 'journaling',
    title: 'Writing & Journaling',
    description: 'Document your thoughts and experiences',
    icon: <PenTool size={24} color="#6366f1" />,
    color: '#eef2ff',
    benefits: ['Self-reflection', 'Emotional processing', 'Memory preservation', 'Writing skills'],
    timeNeeded: '15-60 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'puzzles',
    title: 'Puzzles & Games',
    description: 'Challenge your mind with puzzles and board games',
    icon: <Puzzle size={24} color="#8b5cf6" />,
    color: '#f5f3ff',
    benefits: ['Problem-solving', 'Memory improvement', 'Patience', 'Strategic thinking'],
    timeNeeded: '30-120 minutes',
    difficulty: 'Medium'
  },
  {
    id: 'walking',
    title: 'Walking & Hiking',
    description: 'Explore your neighborhood or nature trails',
    icon: <Mountain size={24} color="#059669" />,
    color: '#ecfdf5',
    benefits: ['Physical fitness', 'Fresh air', 'Vitamin D', 'Mental clarity'],
    timeNeeded: '20-180 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'volunteering',
    title: 'Volunteering',
    description: 'Give back to your community and help others',
    icon: <Heart size={24} color="#dc2626" />,
    color: '#fef2f2',
    benefits: ['Sense of purpose', 'Community connection', 'Skill development', 'Personal fulfillment'],
    timeNeeded: '60-480 minutes',
    difficulty: 'Medium'
  }
];

export default function AlternativesScreen() {
  const openResourceLink = (activity: string) => {
    const urls: { [key: string]: string } = {
      exercise: 'https://www.youtube.com/results?search_query=beginner+workout+routines',
      reading: 'https://www.goodreads.com/',
      meditation: 'https://www.headspace.com/',
      art: 'https://www.youtube.com/results?search_query=beginner+art+tutorials',
      social: 'https://www.meetup.com/',
      gardening: 'https://www.almanac.com/gardening',
      music: 'https://www.youtube.com/results?search_query=learn+instrument+beginner',
      cooking: 'https://www.allrecipes.com/',
      journaling: 'https://www.youtube.com/results?search_query=journaling+for+beginners',
      puzzles: 'https://www.puzzle-warehouse.com/',
      walking: 'https://www.alltrails.com/',
      volunteering: 'https://www.volunteermatch.org/'
    };

    const url = urls[activity];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open link');
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
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
          <Text style={styles.headerTitle}>Screen-Free Activities</Text>
          <Text style={styles.headerSubtitle}>
            Discover meaningful alternatives to screen time
          </Text>
        </View>

        {/* Activities Grid */}
        <View style={styles.activitiesContainer}>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={[styles.iconContainer, { backgroundColor: activity.color }]}>
                  {activity.icon}
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
              </View>

              <View style={styles.activityMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Time Needed:</Text>
                  <Text style={styles.metaValue}>{activity.timeNeeded}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Difficulty:</Text>
                  <Text style={[styles.metaValue, { color: getDifficultyColor(activity.difficulty) }]}>
                    {activity.difficulty}
                  </Text>
                </View>
              </View>

              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>Benefits:</Text>
                <View style={styles.benefitsList}>
                  {activity.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Text style={styles.benefitText}>• {benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.resourceButton}
                onPress={() => openResourceLink(activity.id)}
              >
                <Text style={styles.resourceButtonText}>Find Resources</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activitiesContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  activityCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: '#f9fafb',
    fontWeight: '600',
  },
  benefitsSection: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 8,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitItem: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  benefitText: {
    fontSize: 12,
    color: '#d1d5db',
  },
  resourceButton: {
    backgroundColor: '#60a5fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resourceButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
});