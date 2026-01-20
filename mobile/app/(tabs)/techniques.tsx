import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TechniqueCard from '../../src/components/TechniqueCard';
import { useProgress } from '../../src/context/ProgressContext';
import techniquesData from '../../src/data/breathing-techniques.json';

type SortOption = 'health-impact' | 'difficulty' | 'name';

export default function TechniquesScreen() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('health-impact');

  const { techniques, categories } = techniquesData;

  const filteredTechniques = useMemo(() => {
    let filtered = [...techniques];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.primaryBenefits?.some(b => b.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'health-impact') return a.healthImpactRank - b.healthImpactRank;
      if (sortBy === 'difficulty') {
        const order: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
        return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return filtered;
  }, [techniques, selectedCategory, searchQuery, sortBy]);

  const handleTechniquePress = (techniqueId: string) => {
    router.push(`/technique/${techniqueId}`);
  };

  const handleFavoritePress = (techniqueId: string) => {
    toggleFavorite(techniqueId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Breathing Techniques</Text>
        <Text style={styles.subtitle}>Sorted by health impact</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search techniques..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === 'all' && styles.categoryTextActive
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort and count */}
      <View style={styles.filterBar}>
        <Text style={styles.countText}>
          {filteredTechniques.length} techniques
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const options: SortOption[] = ['health-impact', 'difficulty', 'name'];
            const currentIndex = options.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % options.length;
            setSortBy(options[nextIndex]);
          }}
        >
          <Ionicons name="swap-vertical" size={16} color="#6b7280" />
          <Text style={styles.sortText}>
            {sortBy === 'health-impact'
              ? 'Health Impact'
              : sortBy === 'difficulty'
              ? 'Difficulty'
              : 'Name'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Techniques list */}
      <FlatList
        data={filteredTechniques}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TechniqueCard
            technique={item}
            isFavorite={isFavorite(item.id)}
            onPress={() => handleTechniquePress(item.id)}
            onFavoritePress={() => handleFavoritePress(item.id)}
            showRank={sortBy === 'health-impact'}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No techniques found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827'
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827'
  },
  categoriesContainer: {
    marginTop: 16,
    maxHeight: 50
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6'
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280'
  },
  categoryTextActive: {
    color: '#fff'
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  countText: {
    fontSize: 14,
    color: '#6b7280'
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  sortText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af'
  }
});
