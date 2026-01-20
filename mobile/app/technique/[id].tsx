import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgress } from '../../src/context/ProgressContext';
import techniquesData from '../../src/data/breathing-techniques.json';

export default function TechniqueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useProgress();

  const technique = techniquesData.techniques.find(t => t.id === id);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    instructions: true,
    science: false,
    outcomes: false,
    safety: false,
    resources: false
  });

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getEvidenceColor = () => {
    switch (technique.evidenceLevel) {
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

  const evidenceColor = getEvidenceColor();
  const durationMins = Math.floor(technique.pattern.recommendedDuration / 60);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleFavorite(id!)} style={styles.favoriteButton}>
          <Ionicons
            name={isFavorite(id!) ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite(id!) ? '#ef4444' : '#6b7280'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{technique.healthImpactRank}</Text>
            <Text style={styles.rankLabel}>Health Impact</Text>
          </View>
          <Text style={styles.title}>{technique.name}</Text>
          <Text style={styles.description}>{technique.description}</Text>

          {/* Tags */}
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: evidenceColor.bg }]}>
              <Text style={[styles.tagText, { color: evidenceColor.text }]}>
                {technique.evidenceLevel} evidence
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{technique.difficulty}</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text style={[styles.tagText, { marginLeft: 4 }]}>{durationMins} min</Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push(`/session/${technique.id}`)}
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Ionicons name="play" size={22} color="#fff" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Best For */}
        {technique.bestFor && technique.bestFor.length > 0 && (
          <View style={styles.bestForSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Best For</Text>
            </View>
            <View style={styles.bestForTags}>
              {technique.bestFor.map((item, index) => (
                <View key={index} style={styles.bestForTag}>
                  <Text style={styles.bestForText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeaderButton}
            onPress={() => toggleSection('instructions')}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="book" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>How to Practice</Text>
            </View>
            <Ionicons
              name={expandedSections.instructions ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
          {expandedSections.instructions && (
            <View style={styles.sectionContent}>
              {technique.instructions?.map((step, index) => (
                <View key={index} style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}

              {/* Pattern info */}
              <View style={styles.patternInfo}>
                <Text style={styles.patternTitle}>Breathing Pattern</Text>
                <View style={styles.patternPhases}>
                  {technique.pattern.phases.map((phase, index) => (
                    <View key={index} style={styles.phaseTag}>
                      <Text style={styles.phaseText}>
                        {phase.name}: {phase.duration}s
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.patternCycles}>
                  ~{technique.pattern.cyclesPerMinute.toFixed(1)} cycles per minute
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Science */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeaderButton}
            onPress={() => toggleSection('science')}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="flask" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>The Science</Text>
            </View>
            <Ionicons
              name={expandedSections.science ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
          {expandedSections.science && (
            <View style={styles.sectionContent}>
              <Text style={styles.scienceText}>{technique.science}</Text>
              {technique.researchReferences && technique.researchReferences.length > 0 && (
                <View style={styles.references}>
                  <Text style={styles.referencesTitle}>References</Text>
                  {technique.researchReferences.map((ref, index) => (
                    <Text key={index} style={styles.referenceText}>
                      {ref}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Expected Outcomes */}
        {technique.expectedOutcomes && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderButton}
              onPress={() => toggleSection('outcomes')}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={20} color="#22c55e" />
                <Text style={styles.sectionTitle}>Expected Outcomes</Text>
              </View>
              <Ionicons
                name={expandedSections.outcomes ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
            {expandedSections.outcomes && (
              <View style={styles.sectionContent}>
                <View style={styles.outcomeGroup}>
                  <Text style={styles.outcomeLabel}>Immediate</Text>
                  {technique.expectedOutcomes.immediate?.map((item, i) => (
                    <View key={i} style={styles.outcomeItem}>
                      <Ionicons name="checkmark" size={16} color="#22c55e" />
                      <Text style={styles.outcomeText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.outcomeGroup}>
                  <Text style={styles.outcomeLabel}>Short Term (2-4 weeks)</Text>
                  {technique.expectedOutcomes.shortTerm?.map((item, i) => (
                    <View key={i} style={styles.outcomeItem}>
                      <Ionicons name="checkmark" size={16} color="#22c55e" />
                      <Text style={styles.outcomeText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.outcomeGroup}>
                  <Text style={styles.outcomeLabel}>Long Term</Text>
                  {technique.expectedOutcomes.longTerm?.map((item, i) => (
                    <View key={i} style={styles.outcomeItem}>
                      <Ionicons name="checkmark" size={16} color="#22c55e" />
                      <Text style={styles.outcomeText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Safety */}
        {(technique.contraindications?.length > 0 || technique.safetyWarnings?.length > 0) && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderButton}
              onPress={() => toggleSection('safety')}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Safety</Text>
              </View>
              <Ionicons
                name={expandedSections.safety ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
            {expandedSections.safety && (
              <View style={styles.sectionContent}>
                {technique.safetyWarnings?.map((warning, i) => (
                  <View key={i} style={styles.warningItem}>
                    <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
                {technique.contraindications?.map((item, i) => (
                  <View key={i} style={styles.contraindicationItem}>
                    <Ionicons name="close-circle" size={16} color="#ef4444" />
                    <Text style={styles.contraindicationText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Video Resources */}
        {technique.youtubeResources && technique.youtubeResources.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderButton}
              onPress={() => toggleSection('resources')}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="videocam" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Video Resources</Text>
              </View>
              <Ionicons
                name={expandedSections.resources ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
            {expandedSections.resources && (
              <View style={styles.sectionContent}>
                {technique.youtubeResources.map((resource, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.resourceCard}
                    onPress={() => Linking.openURL(resource.url)}
                  >
                    <View style={styles.resourceInfo}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceCreator}>{resource.creator}</Text>
                      {resource.description && (
                        <Text style={styles.resourceDesc}>{resource.description}</Text>
                      )}
                    </View>
                    <Ionicons name="open-outline" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

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
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 100
  },
  backLink: {
    fontSize: 16,
    color: '#3b82f6',
    textAlign: 'center',
    marginTop: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16
  },
  backButton: {
    padding: 8
  },
  favoriteButton: {
    padding: 8
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20
  },
  titleSection: {
    marginBottom: 20
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden'
  },
  rankLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'capitalize'
  },
  startButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden'
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  bestForSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  bestForTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12
  },
  bestForTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  bestForText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden'
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 12
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6'
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22
  },
  patternInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginTop: 8
  },
  patternTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 10
  },
  patternPhases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  phaseTag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  phaseText: {
    fontSize: 12,
    color: '#374151'
  },
  patternCycles: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 10
  },
  scienceText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24
  },
  references: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  referencesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8
  },
  referenceText: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
    lineHeight: 16
  },
  outcomeGroup: {
    marginBottom: 16
  },
  outcomeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8
  },
  outcomeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8
  },
  outcomeText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 8
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20
  },
  contraindicationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8
  },
  contraindicationText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10
  },
  resourceInfo: {
    flex: 1
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  resourceCreator: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2
  },
  resourceDesc: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4
  }
});
