import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  options?: { value: string; label: string; emoji: string }[];
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Breathe',
    subtitle: 'Your journey to better breathing starts here',
    icon: 'leaf'
  },
  {
    id: 'goal',
    title: "What's your primary goal?",
    subtitle: "We'll personalize your experience",
    icon: 'flag',
    options: [
      { value: 'stress-reduction', label: 'Reduce stress and anxiety', emoji: '😌' },
      { value: 'sleep', label: 'Improve sleep', emoji: '😴' },
      { value: 'performance', label: 'Enhance focus and performance', emoji: '🎯' },
      { value: 'energy', label: 'Increase energy', emoji: '⚡' },
      { value: 'general', label: 'General wellness', emoji: '✨' }
    ]
  },
  {
    id: 'experience',
    title: "What's your experience level?",
    subtitle: "We'll recommend techniques that fit",
    icon: 'trending-up',
    options: [
      { value: 'beginner', label: "I'm new to breathing exercises", emoji: '🌱' },
      { value: 'intermediate', label: "I've tried some techniques", emoji: '🌿' },
      { value: 'advanced', label: 'I practice regularly', emoji: '🌳' }
    ]
  },
  {
    id: 'duration',
    title: 'How much time can you dedicate daily?',
    subtitle: 'Even 5 minutes makes a difference',
    icon: 'time',
    options: [
      { value: '5', label: '5 minutes', emoji: '⏱️' },
      { value: '10', label: '10 minutes', emoji: '⏱️' },
      { value: '20', label: '20 minutes', emoji: '⏱️' },
      { value: '30', label: '30+ minutes', emoji: '⏱️' }
    ]
  },
  {
    id: 'complete',
    title: "You're all set!",
    subtitle: 'Your personalized program is ready',
    icon: 'checkmark-circle'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    goal: '',
    experience: '',
    duration: ''
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const step = steps[currentStep];

  const handleOptionSelect = async (key: string, value: string) => {
    setSelectedOption(value);
    setAnswers(prev => ({ ...prev, [key]: value }));

    // Auto-advance after selection
    setTimeout(() => {
      setSelectedOption(null);
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data
      await AsyncStorage.setItem('breathe_onboarding', JSON.stringify({
        completed: true,
        answers,
        completedAt: new Date().toISOString()
      }));

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      router.replace('/(tabs)');
    }
  };

  const getRecommendedTechnique = () => {
    // Based on answers, recommend a starting technique
    if (answers.goal === 'stress-reduction' || answers.goal === 'general') {
      return { name: 'Cyclic Sighing', id: 'cyclic-sighing' };
    } else if (answers.goal === 'sleep') {
      return { name: '4-7-8 Breathing', id: '4-7-8-breathing' };
    } else if (answers.goal === 'performance') {
      return { name: 'Box Breathing', id: 'box-breathing' };
    } else if (answers.goal === 'energy') {
      return { name: 'Breath of Fire', id: 'breath-of-fire' };
    }
    return { name: 'Coherent Breathing', id: 'coherent-breathing' };
  };

  return (
    <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted
              ]}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Step */}
          {step.id === 'welcome' && (
            <View style={styles.centerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={step.icon} size={64} color="#fff" />
              </View>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.subtitle}>{step.subtitle}</Text>

              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          )}

          {/* Option Steps */}
          {step.options && (
            <View style={styles.optionsContent}>
              <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>
                  <Ionicons name={step.icon} size={32} color="#fff" />
                </View>
                <Text style={styles.title}>{step.title}</Text>
                <Text style={styles.subtitle}>{step.subtitle}</Text>
              </View>

              <View style={styles.optionsContainer}>
                {step.options.map((option) => {
                  const isSelected = selectedOption === option.value || answers[step.id as keyof typeof answers] === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionButtonSelected
                      ]}
                      onPress={() => handleOptionSelect(step.id, option.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <Text style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected
                      ]}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Complete Step */}
          {step.id === 'complete' && (
            <View style={styles.centerContent}>
              <View style={[styles.iconContainer, styles.successIcon]}>
                <Ionicons name="checkmark" size={64} color="#fff" />
              </View>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.subtitle}>{step.subtitle}</Text>

              {/* Recommended Technique */}
              <View style={styles.recommendationCard}>
                <Text style={styles.recommendationLabel}>Your Recommended Technique</Text>
                <Text style={styles.recommendationName}>
                  {getRecommendedTechnique().name}
                </Text>
                <Text style={styles.recommendationDesc}>
                  Based on your goal: {answers.goal.replace(/-/g, ' ')}
                </Text>
              </View>

              {/* Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Goal</Text>
                  <Text style={styles.summaryValue}>{answers.goal.replace(/-/g, ' ')}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Experience</Text>
                  <Text style={styles.summaryValue}>{answers.experience}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Daily time</Text>
                  <Text style={styles.summaryValue}>{answers.duration} minutes</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
                <Text style={styles.primaryButtonText}>Start Breathing</Text>
                <Ionicons name="arrow-forward" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Skip button for option steps */}
        {step.options && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleNext}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  container: {
    flex: 1
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#fff'
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255,255,255,0.7)'
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32
  },
  successIcon: {
    backgroundColor: '#22c55e'
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32
  },
  optionsContent: {
    flex: 1,
    paddingTop: 20
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  optionsContainer: {
    gap: 12
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  optionButtonSelected: {
    backgroundColor: '#fff'
  },
  optionEmoji: {
    fontSize: 28
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff'
  },
  optionLabelSelected: {
    color: '#1f2937'
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
    width: '100%',
    marginTop: 16
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6'
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16
  },
  skipButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)'
  },
  recommendationCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16
  },
  recommendationLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4
  },
  recommendationName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4
  },
  recommendationDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize'
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize'
  }
});
