import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useProgress } from '../../src/context/ProgressContext';
import techniquesData from '../../src/data/breathing-techniques.json';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { stats, getTodaysSessions } = useProgress();
  const [greeting, setGreeting] = useState('Good morning');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Get recommendations
    loadRecommendations(hour);
  }, []);

  const loadRecommendations = (hour: number) => {
    const techniques = techniquesData.techniques;

    // Time-based recommendation
    let timeBasedId = 'cyclic-sighing';
    if (hour < 10) timeBasedId = 'breath-of-fire';
    else if (hour < 14) timeBasedId = 'box-breathing';
    else if (hour < 18) timeBasedId = 'coherent-breathing';
    else if (hour < 21) timeBasedId = 'extended-exhale';
    else timeBasedId = 'pre-sleep-breathing';

    const timeBased = techniques.find(t => t.id === timeBasedId);
    const topRated = techniques[0]; // Cyclic sighing

    const recs = [];
    if (timeBased) {
      recs.push({
        type: 'time',
        title: getTimeTitle(hour),
        reason: getTimeReason(hour),
        technique: timeBased
      });
    }
    if (topRated && topRated.id !== timeBasedId) {
      recs.push({
        type: 'top',
        title: 'Most Effective',
        reason: 'Ranked #1 for health impact',
        technique: topRated
      });
    }

    setRecommendations(recs);
  };

  const getTimeTitle = (hour: number) => {
    if (hour < 10) return '🌅 Morning Energy';
    if (hour < 14) return '🎯 Midday Focus';
    if (hour < 18) return '🧘 Afternoon Calm';
    if (hour < 21) return '🌆 Evening Wind-Down';
    return '🌙 Sleep Preparation';
  };

  const getTimeReason = (hour: number) => {
    if (hour < 10) return 'Start your day with energy';
    if (hour < 14) return 'Stay focused and alert';
    if (hour < 18) return 'Balance your afternoon';
    if (hour < 21) return 'Transition into relaxation';
    return 'Prepare for restful sleep';
  };

  const todaysSessions = getTodaysSessions();
  const todayMinutes = todaysSessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          style={styles.welcomeGradient}
        >
          <View style={styles.welcomeContent}>
            <Ionicons name="leaf" size={64} color="#fff" />
            <Text style={styles.welcomeTitle}>Breathe</Text>
            <Text style={styles.welcomeSubtitle}>
              Master your breath, transform your life
            </Text>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{user?.name || 'there'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color="#f97316" />
            <Text style={styles.streakText}>{stats.currentStreak}</Text>
          </View>
        </View>

        {/* Today's Progress */}
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>Today's Progress</Text>
          <View style={styles.todayStats}>
            <View style={styles.todayStat}>
              <Text style={styles.todayStatValue}>{todaysSessions.length}</Text>
              <Text style={styles.todayStatLabel}>Sessions</Text>
            </View>
            <View style={styles.todayStatDivider} />
            <View style={styles.todayStat}>
              <Text style={styles.todayStatValue}>{todayMinutes}</Text>
              <Text style={styles.todayStatLabel}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* Quick Start */}
        <TouchableOpacity
          style={styles.quickStartButton}
          onPress={() => router.push('/session/cyclic-sighing')}
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quickStartGradient}
          >
            <View style={styles.quickStartContent}>
              <View>
                <Text style={styles.quickStartTitle}>Quick Start</Text>
                <Text style={styles.quickStartSubtitle}>5 min · Cyclic Sighing</Text>
              </View>
              <View style={styles.quickStartIcon}>
                <Ionicons name="play" size={24} color="#3b82f6" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          {recommendations.map((rec, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recCard}
              onPress={() => router.push(`/technique/${rec.technique.id}`)}
            >
              <View style={styles.recHeader}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recReason}>{rec.reason}</Text>
              </View>
              <View style={styles.recTechnique}>
                <Text style={styles.recTechniqueName}>{rec.technique.name}</Text>
                <View style={styles.recMeta}>
                  <View style={styles.recTag}>
                    <Text style={styles.recTagText}>{rec.technique.difficulty}</Text>
                  </View>
                  <Text style={styles.recDuration}>
                    {Math.floor(rec.technique.pattern.recommendedDuration / 60)} min
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9ca3af"
                style={styles.recChevron}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Browse All */}
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/techniques')}
        >
          <Text style={styles.browseText}>Browse All Techniques</Text>
          <Ionicons name="arrow-forward" size={20} color="#3b82f6" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollView: {
    flex: 1,
    padding: 20
  },
  // Welcome screen for non-authenticated users
  welcomeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcomeContent: {
    alignItems: 'center',
    padding: 40
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 40
  },
  getStartedButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6'
  },
  loginLink: {
    marginTop: 20
  },
  loginLinkText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15
  },
  // Authenticated home screen
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280'
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827'
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f97316',
    marginLeft: 6
  },
  todayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  todayTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 16
  },
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  todayStat: {
    alignItems: 'center',
    flex: 1
  },
  todayStatValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827'
  },
  todayStatLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  todayStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb'
  },
  quickStartButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden'
  },
  quickStartGradient: {
    padding: 20
  },
  quickStartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  quickStartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff'
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4
  },
  quickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  recCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  recHeader: {
    flex: 1
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 2
  },
  recReason: {
    fontSize: 12,
    color: '#9ca3af'
  },
  recTechnique: {
    flex: 1.5
  },
  recTechniqueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  recMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  recTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8
  },
  recTagText: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'capitalize'
  },
  recDuration: {
    fontSize: 12,
    color: '#9ca3af'
  },
  recChevron: {
    marginLeft: 8
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12
  },
  browseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginRight: 8
  }
});
