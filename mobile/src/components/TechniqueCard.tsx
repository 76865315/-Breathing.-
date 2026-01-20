import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TechniqueCardProps {
  technique: {
    id: string;
    name: string;
    description: string;
    healthImpactRank: number;
    difficulty: string;
    evidenceLevel: string;
    primaryBenefits: string[];
    pattern: {
      recommendedDuration: number;
    };
  };
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
  showRank?: boolean;
}

export default function TechniqueCard({
  technique,
  isFavorite,
  onPress,
  onFavoritePress,
  showRank = true
}: TechniqueCardProps) {
  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return { bg: '#dcfce7', text: '#166534' };
      case 'moderate':
        return { bg: '#fef9c3', text: '#854d0e' };
      case 'emerging':
        return { bg: '#dbeafe', text: '#1e40af' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return { bg: '#dcfce7', text: '#166534' };
      case 'intermediate':
        return { bg: '#fef9c3', text: '#854d0e' };
      case 'advanced':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const evidenceColors = getEvidenceColor(technique.evidenceLevel);
  const difficultyColors = getDifficultyColor(technique.difficulty);
  const durationMins = Math.floor(technique.pattern.recommendedDuration / 60);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {showRank && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{technique.healthImpactRank}</Text>
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {technique.name}
            </Text>
          </View>
        </View>
        <Pressable onPress={onFavoritePress} hitSlop={10}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#ef4444' : '#9ca3af'}
          />
        </Pressable>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {technique.description}
      </Text>

      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: difficultyColors.bg }]}>
          <Text style={[styles.tagText, { color: difficultyColors.text }]}>
            {technique.difficulty}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: evidenceColors.bg }]}>
          <Text style={[styles.tagText, { color: evidenceColors.text }]}>
            {technique.evidenceLevel} evidence
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: '#f3f4f6' }]}>
          <Ionicons name="time-outline" size={12} color="#6b7280" />
          <Text style={[styles.tagText, { color: '#6b7280', marginLeft: 4 }]}>
            {durationMins} min
          </Text>
        </View>
      </View>

      <View style={styles.benefits}>
        {technique.primaryBenefits?.slice(0, 3).map((benefit, index) => (
          <View key={index} style={styles.benefitTag}>
            <Text style={styles.benefitText}>
              {benefit.replace(/-/g, ' ')}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap to learn more</Text>
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3b82f6'
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827'
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  benefitTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  benefitText: {
    fontSize: 11,
    color: '#3b82f6',
    textTransform: 'capitalize'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 4
  }
});
