import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import TechniqueCard from '../components/TechniqueCard';
import techniques from '../data/breathing-techniques.json';

function Techniques() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('health-impact');

  const categories = useMemo(() => {
    const cats = new Set(techniques.techniques.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredTechniques = useMemo(() => {
    let filtered = techniques.techniques;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.primaryBenefits?.some(b => b.toLowerCase().includes(query))
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'health-impact') return a.healthImpactRank - b.healthImpactRank;
      if (sortBy === 'difficulty') {
        const order = { beginner: 1, intermediate: 2, advanced: 3 };
        return (order[a.difficulty as keyof typeof order] || 0) - (order[b.difficulty as keyof typeof order] || 0);
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Breathing Techniques</h1>
        <p className="text-gray-500 mt-1">Evidence-based techniques sorted by health impact</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search techniques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Sort and Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {filteredTechniques.length} techniques
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500"
        >
          <option value="health-impact">By Health Impact</option>
          <option value="difficulty">By Difficulty</option>
          <option value="name">By Name</option>
        </select>
      </div>

      {/* Techniques List */}
      <div className="space-y-4">
        {filteredTechniques.map((technique) => (
          <TechniqueCard
            key={technique.id}
            technique={technique}
            showRank={sortBy === 'health-impact'}
          />
        ))}
      </div>

      {filteredTechniques.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No techniques found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default Techniques;
