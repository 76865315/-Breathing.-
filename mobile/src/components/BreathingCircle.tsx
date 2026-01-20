import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;

interface BreathingCircleProps {
  phase: 'inhale' | 'exhale' | 'holdFull' | 'holdEmpty' | 'pause' | 'rest';
  phaseDuration: number;
  timeRemaining: number;
  instruction: string;
}

export default function BreathingCircle({
  phase,
  phaseDuration,
  timeRemaining,
  instruction
}: BreathingCircleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Animate based on phase
    const targetScale = phase === 'inhale' || phase === 'inhale1' || phase === 'inhale2'
      ? 1.4
      : phase === 'exhale'
        ? 1
        : phase === 'holdFull'
          ? 1.4
          : 1;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: phaseDuration * 1000,
        useNativeDriver: true
      }),
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: phaseDuration * 1000 - 300,
          useNativeDriver: true
        })
      ])
    ]).start();
  }, [phase, phaseDuration]);

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
      case 'inhale1':
      case 'inhale2':
        return '#60a5fa'; // blue
      case 'exhale':
        return '#a78bfa'; // purple
      case 'holdFull':
      case 'holdEmpty':
      case 'pause':
      case 'rest':
        return '#34d399'; // green
      default:
        return '#60a5fa';
    }
  };

  return (
    <View style={styles.container}>
      {/* Outer ring */}
      <View style={[styles.outerRing, { borderColor: getPhaseColor() }]} />

      {/* Animated breathing circle */}
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: getPhaseColor(),
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Inner glow */}
        <View style={styles.innerGlow} />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.instruction}>{instruction}</Text>
        <Text style={styles.timer}>{timeRemaining}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  outerRing: {
    position: 'absolute',
    width: CIRCLE_SIZE + 30,
    height: CIRCLE_SIZE + 30,
    borderRadius: (CIRCLE_SIZE + 30) / 2,
    borderWidth: 2,
    opacity: 0.3
  },
  circle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerGlow: {
    position: 'absolute',
    width: CIRCLE_SIZE * 0.7,
    height: CIRCLE_SIZE * 0.7,
    borderRadius: (CIRCLE_SIZE * 0.7) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  content: {
    alignItems: 'center',
    zIndex: 10
  },
  instruction: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  timer: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  }
});
