import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Modal,
  Pressable
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useProgress } from '../../src/context/ProgressContext';
import techniquesData from '../../src/data/breathing-techniques.json';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.55;

type SessionStatus = 'setup' | 'active' | 'paused' | 'completed';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addSession } = useProgress();

  const technique = techniquesData.techniques.find(t => t.id === id);

  const [status, setStatus] = useState<SessionStatus>('setup');
  const [duration, setDuration] = useState(300); // 5 minutes default
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [preMood, setPreMood] = useState<number | null>(null);
  const [postMood, setPostMood] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (technique) {
      setDuration(technique.pattern.recommendedDuration);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [technique]);

  const phases = technique?.pattern.phases || [];
  const currentPhase = phases[currentPhaseIndex];

  const getPhaseInstruction = () => {
    if (!currentPhase) return '';
    const name = currentPhase.name.toLowerCase();
    if (name.includes('inhale')) return 'Breathe In';
    if (name.includes('exhale')) return 'Breathe Out';
    if (name.includes('hold') || name.includes('pause') || name.includes('rest')) return 'Hold';
    return currentPhase.instruction || currentPhase.name;
  };

  const animateCircle = useCallback((phaseName: string, phaseDuration: number) => {
    const name = phaseName.toLowerCase();
    let toValue = 1;

    if (name.includes('inhale')) {
      toValue = 1.4;
    } else if (name.includes('exhale')) {
      toValue = 1;
    } else if (name.includes('hold')) {
      // Keep current scale
      return;
    }

    Animated.timing(scaleAnim, {
      toValue,
      duration: phaseDuration * 1000,
      useNativeDriver: true
    }).start();
  }, [scaleAnim]);

  const startSession = () => {
    if (!technique) return;

    setStatus('active');
    setPhaseTime(phases[0]?.duration || 4);
    setCurrentPhaseIndex(0);
    setCycleCount(0);
    setTotalTime(0);

    animateCircle(phases[0]?.name || 'inhale', phases[0]?.duration || 4);

    timerRef.current = setInterval(() => {
      setTotalTime(prev => {
        if (prev + 1 >= duration) {
          completeSession();
          return prev;
        }
        return prev + 1;
      });

      setPhaseTime(prev => {
        if (prev <= 1) {
          // Move to next phase
          setCurrentPhaseIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % phases.length;
            if (nextIndex === 0) {
              setCycleCount(c => c + 1);
            }

            // Trigger haptic and animate
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const nextPhase = phases[nextIndex];
            animateCircle(nextPhase?.name || '', nextPhase?.duration || 4);

            return nextIndex;
          });

          // Return next phase duration
          return phases[(currentPhaseIndex + 1) % phases.length]?.duration || 4;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const togglePause = () => {
    if (status === 'active') {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('active');
      // Resume timer
      timerRef.current = setInterval(() => {
        setTotalTime(prev => {
          if (prev + 1 >= duration) {
            completeSession();
            return prev;
          }
          return prev + 1;
        });

        setPhaseTime(prev => {
          if (prev <= 1) {
            setCurrentPhaseIndex(prevIndex => {
              const nextIndex = (prevIndex + 1) % phases.length;
              if (nextIndex === 0) setCycleCount(c => c + 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const nextPhase = phases[nextIndex];
              animateCircle(nextPhase?.name || '', nextPhase?.duration || 4);
              return nextIndex;
            });
            return phases[(currentPhaseIndex + 1) % phases.length]?.duration || 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const completeSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('completed');
    setShowCompletion(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const saveAndExit = async () => {
    await addSession({
      techniqueId: id!,
      date: new Date().toISOString(),
      duration: totalTime,
      completed: true,
      preMood: preMood || undefined,
      postMood: postMood || undefined,
      rating: rating || undefined
    });
    router.back();
  };

  const cancelSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!technique) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Technique not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Setup screen
  if (status === 'setup') {
    return (
      <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradientContainer}>
        <SafeAreaView style={styles.setupContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={cancelSession}>
            <Ionicons name="close" size={28} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          <View style={styles.setupContent}>
            <Text style={styles.setupTitle}>{technique.name}</Text>
            <Text style={styles.setupSubtitle}>{formatTime(duration)} session</Text>

            {/* Duration selector */}
            <View style={styles.durationSelector}>
              <Text style={styles.durationLabel}>Duration</Text>
              <View style={styles.durationOptions}>
                {[180, 300, 600, 900].map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.durationOption,
                      duration === d && styles.durationOptionActive
                    ]}
                    onPress={() => setDuration(d)}
                  >
                    <Text
                      style={[
                        styles.durationOptionText,
                        duration === d && styles.durationOptionTextActive
                      ]}
                    >
                      {Math.floor(d / 60)} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pre-session mood */}
            <View style={styles.moodSelector}>
              <Text style={styles.moodLabel}>How do you feel?</Text>
              <View style={styles.moodOptions}>
                {[1, 2, 3, 4, 5].map(mood => (
                  <TouchableOpacity
                    key={mood}
                    style={[
                      styles.moodOption,
                      preMood === mood && styles.moodOptionActive
                    ]}
                    onPress={() => setPreMood(mood)}
                  >
                    <Text style={styles.moodEmoji}>
                      {mood === 1 && '😔'}
                      {mood === 2 && '😕'}
                      {mood === 3 && '😐'}
                      {mood === 4 && '🙂'}
                      {mood === 5 && '😊'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startSession}>
              <Ionicons name="play" size={24} color="#3b82f6" />
              <Text style={styles.startButtonText}>Begin Session</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Active/Paused session screen
  return (
    <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradientContainer}>
      <SafeAreaView style={styles.sessionContainer}>
        {/* Header */}
        <View style={styles.sessionHeader}>
          <TouchableOpacity onPress={cancelSession}>
            <Ionicons name="close" size={28} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTechnique}>{technique.name}</Text>
            <Text style={styles.sessionCycle}>Cycle {cycleCount + 1}</Text>
          </View>
          <TouchableOpacity onPress={togglePause}>
            <Ionicons
              name={status === 'paused' ? 'play' : 'pause'}
              size={28}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
        </View>

        {/* Breathing circle */}
        <View style={styles.circleContainer}>
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressFill,
                {
                  transform: [
                    { rotate: `${(totalTime / duration) * 360}deg` }
                  ]
                }
              ]}
            />
          </View>

          <Animated.View
            style={[
              styles.breathingCircle,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.circleInner} />
          </Animated.View>

          <View style={styles.circleContent}>
            <Text style={styles.instruction}>{getPhaseInstruction()}</Text>
            <Text style={styles.timer}>{phaseTime}</Text>
          </View>

          {/* Paused overlay */}
          {status === 'paused' && (
            <View style={styles.pausedOverlay}>
              <Ionicons name="pause" size={64} color="#fff" />
              <Text style={styles.pausedText}>Paused</Text>
              <TouchableOpacity style={styles.resumeButton} onPress={togglePause}>
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Phase indicators */}
        <View style={styles.phaseIndicators}>
          {phases.map((phase, index) => (
            <View
              key={index}
              style={[
                styles.phaseIndicator,
                currentPhaseIndex === index && styles.phaseIndicatorActive
              ]}
            >
              <Text
                style={[
                  styles.phaseIndicatorText,
                  currentPhaseIndex === index && styles.phaseIndicatorTextActive
                ]}
              >
                {phase.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Progress */}
        <View style={styles.progressInfo}>
          <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.progressText}>
            {formatTime(totalTime)} / {formatTime(duration)}
          </Text>
        </View>

        {/* Completion Modal */}
        <Modal visible={showCompletion} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.completionModal}>
              <View style={styles.completionIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              </View>
              <Text style={styles.completionTitle}>Well Done!</Text>
              <Text style={styles.completionSubtitle}>
                You completed {formatTime(totalTime)} of {technique.name}
              </Text>

              {/* Post mood */}
              <View style={styles.postMoodSection}>
                <Text style={styles.postMoodLabel}>How do you feel now?</Text>
                <View style={styles.moodOptions}>
                  {[1, 2, 3, 4, 5].map(mood => (
                    <TouchableOpacity
                      key={mood}
                      style={[
                        styles.postMoodOption,
                        postMood === mood && styles.postMoodOptionActive
                      ]}
                      onPress={() => setPostMood(mood)}
                    >
                      <Text style={styles.moodEmoji}>
                        {mood === 1 && '😔'}
                        {mood === 2 && '😕'}
                        {mood === 3 && '😐'}
                        {mood === 4 && '🙂'}
                        {mood === 5 && '😊'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rating */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Rate this session</Text>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={32}
                        color={star <= rating ? '#eab308' : '#d1d5db'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.completeButton} onPress={saveAndExit}>
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280'
  },
  backLink: {
    fontSize: 16,
    color: '#3b82f6',
    marginTop: 12
  },
  gradientContainer: {
    flex: 1
  },
  // Setup screen
  setupContainer: {
    flex: 1
  },
  closeButton: {
    padding: 16
  },
  setupContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8
  },
  setupSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40
  },
  durationSelector: {
    marginBottom: 32,
    width: '100%'
  },
  durationLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 12
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  durationOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  durationOptionActive: {
    backgroundColor: '#fff'
  },
  durationOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff'
  },
  durationOptionTextActive: {
    color: '#3b82f6'
  },
  moodSelector: {
    marginBottom: 40
  },
  moodLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 12
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12
  },
  moodOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  moodOptionActive: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.1 }]
  },
  moodEmoji: {
    fontSize: 24
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6'
  },
  // Session screen
  sessionContainer: {
    flex: 1
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  sessionInfo: {
    alignItems: 'center'
  },
  sessionTechnique: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)'
  },
  sessionCycle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressRing: {
    position: 'absolute',
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    borderRadius: (CIRCLE_SIZE + 40) / 2,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  progressFill: {
    position: 'absolute',
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40
  },
  breathingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleInner: {
    position: 'absolute',
    width: CIRCLE_SIZE * 0.7,
    height: CIRCLE_SIZE * 0.7,
    borderRadius: (CIRCLE_SIZE * 0.7) / 2,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center'
  },
  instruction: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  timer: {
    fontSize: 64,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  pausedOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CIRCLE_SIZE / 2
  },
  pausedText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12
  },
  resumeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6'
  },
  phaseIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20
  },
  phaseIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  phaseIndicatorActive: {
    backgroundColor: '#fff'
  },
  phaseIndicatorText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize'
  },
  phaseIndicatorTextActive: {
    color: '#3b82f6'
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 40
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)'
  },
  // Completion modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  completionModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center'
  },
  completionIcon: {
    marginBottom: 16
  },
  completionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },
  completionSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24
  },
  postMoodSection: {
    marginBottom: 24,
    alignItems: 'center'
  },
  postMoodLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12
  },
  postMoodOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  postMoodOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#3b82f6'
  },
  ratingSection: {
    marginBottom: 24,
    alignItems: 'center'
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8
  },
  completeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%'
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center'
  }
});
