import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '../../src/context/ProgressContext';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 150;

export default function ProgressScreen() {
  const { stats, getWeeklyMinutes, sessions } = useProgress();
  const weeklyMinutes = getWeeklyMinutes();
  const maxMinutes = Math.max(...weeklyMinutes, 10);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate technique usage
  const techniqueUsage = sessions.reduce((acc: Record<string, number>, session) => {
    acc[session.techniqueId] = (acc[session.techniqueId] || 0) + 1;
    return acc;
  }, {});

  const topTechniques = Object.entries(techniqueUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Achievements
  const achievements = [
    {
      id: 'first-breath',
      name: 'First Breath',
      description: 'Complete your first session',
      icon: 'leaf',
      unlocked: stats.totalSessions >= 1
    },
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: '7-day streak',
      icon: 'flame',
      unlocked: stats.longestStreak >= 7
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      description: 'Complete 30 sessions',
      icon: 'star',
      unlocked: stats.totalSessions >= 30
    },
    {
      id: 'mindful-hour',
      name: 'Mindful Hour',
      description: 'Breathe for 60 total minutes',
      icon: 'time',
      unlocked: stats.totalMinutes >= 60
    },
    {
      id: 'master',
      name: 'Breathwork Master',
      description: 'Complete 100 sessions',
      icon: 'trophy',
      unlocked: stats.totalSessions >= 100
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Progress</Text>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="fitness" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>{stats.totalMinutes}</Text>
            <Text style={styles.statLabel}>Total Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#f97316" />
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#eab308" />
            <Text style={styles.statValue}>{stats.longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>This Week</Text>
          <View style={styles.chart}>
            {weeklyMinutes.map((minutes, index) => (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (minutes / maxMinutes) * CHART_HEIGHT || 4,
                      backgroundColor: minutes > 0 ? '#3b82f6' : '#e5e7eb'
                    }
                  ]}
                />
                <Text style={styles.barLabel}>{dayLabels[index]}</Text>
                <Text style={styles.barValue}>{minutes > 0 ? `${minutes}m` : ''}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Techniques */}
        {topTechniques.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most Practiced</Text>
            {topTechniques.map(([techniqueId, count], index) => (
              <View key={techniqueId} style={styles.techniqueRow}>
                <View style={styles.techniqueRank}>
                  <Text style={styles.techniqueRankText}>{index + 1}</Text>
                </View>
                <Text style={styles.techniqueName}>
                  {techniqueId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Text>
                <Text style={styles.techniqueCount}>{count} sessions</Text>
              </View>
            ))}
          </View>
        )}

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>
              {unlockedCount}/{achievements.length}
            </Text>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.map(achievement => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    achievement.unlocked
                      ? styles.achievementIconUnlocked
                      : styles.achievementIconLocked
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={24}
                    color={achievement.unlocked ? '#fff' : '#9ca3af'}
                  />
                </View>
                <Text
                  style={[
                    styles.achievementName,
                    !achievement.unlocked && styles.achievementNameLocked
                  ]}
                >
                  {achievement.name}
                </Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 50
  },
  barContainer: {
    alignItems: 'center',
    flex: 1
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4
  },
  barLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8
  },
  barValue: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    height: 14
  },
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  achievementCount: {
    fontSize: 14,
    color: '#6b7280'
  },
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  techniqueRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  techniqueRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6'
  },
  techniqueName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    textTransform: 'capitalize'
  },
  techniqueCount: {
    fontSize: 13,
    color: '#6b7280'
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  achievementCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  achievementLocked: {
    opacity: 0.6
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  achievementIconUnlocked: {
    backgroundColor: '#3b82f6'
  },
  achievementIconLocked: {
    backgroundColor: '#e5e7eb'
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center'
  },
  achievementNameLocked: {
    color: '#9ca3af'
  },
  achievementDesc: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4
  }
});
