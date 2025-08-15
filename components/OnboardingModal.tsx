import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ChevronRight, ChevronLeft, Target, Bell, Award, ChartBar as BarChart3, Smartphone } from 'lucide-react-native';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    icon: <Smartphone size={48} color="#60a5fa" />,
    title: 'Welcome to ScreenStreak',
    description: 'Build self-discipline by gradually reducing your screen time. Small changes lead to big transformations.',
    highlight: 'Your journey to digital wellness starts here.'
  },
  {
    id: 2,
    icon: <Target size={48} color="#34d399" />,
    title: 'Set Your Goals',
    description: 'We\'ll help you create realistic daily goals based on your current usage patterns. Start small and build momentum.',
    highlight: 'Sustainable progress beats perfection every time.'
  },
  {
    id: 3,
    icon: <Award size={48} color="#fbbf24" />,
    title: 'Earn Achievements',
    description: 'Unlock achievements as you hit milestones. From your first week to your 100-day streak, every step counts.',
    highlight: 'Celebrate your wins, no matter how small.'
  },
  {
    id: 4,
    icon: <BarChart3 size={48} color="#a78bfa" />,
    title: 'Track Your Progress',
    description: 'Get detailed insights into your usage patterns, peak hours, and improvement trends to stay motivated.',
    highlight: 'Knowledge is power on your wellness journey.'
  },
  {
    id: 5,
    icon: <Bell size={48} color="#f87171" />,
    title: 'Stay Accountable',
    description: 'Optional reminders and motivational check-ins help you stay on track without being overwhelming.',
    highlight: 'Building habits is easier with gentle guidance.'
  }
];

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.stepIndicator}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  index === currentStep && styles.activeStepDot,
                  index < currentStep && styles.completedStepDot
                ]}
              />
            ))}
          </View>

          <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
              {currentStepData.icon}
            </View>
            
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>
            
            <View style={styles.highlightContainer}>
              <Text style={styles.highlightText}>{currentStepData.highlight}</Text>
            </View>
          </View>
        </View>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, styles.previousButton]}
            onPress={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={20} color={currentStep === 0 ? '#6b7280' : '#f9fafb'} />
            <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={20} color="#1f2937" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: '#60a5fa',
    width: 24,
  },
  completedStepDot: {
    backgroundColor: '#34d399',
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  highlightContainer: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  highlightText: {
    fontSize: 14,
    color: '#dbeafe',
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  previousButton: {
    backgroundColor: '#1f2937',
  },
  nextButton: {
    backgroundColor: '#60a5fa',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginLeft: 8,
  },
  disabledText: {
    color: '#6b7280',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
});