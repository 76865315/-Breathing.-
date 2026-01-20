import { Link } from 'react-router-dom';
import { Clock, Heart, ChevronRight } from 'lucide-react';
import { useStore } from '../context/store';

interface Technique {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  evidenceLevel: 'high' | 'moderate' | 'emerging';
  healthImpactRank: number;
  pattern: {
    recommendedDuration: number;
  };
  primaryBenefits: string[];
}

interface TechniqueCardProps {
  technique: Technique;
  showRank?: boolean;
}

function TechniqueCard({ technique, showRank = true }: TechniqueCardProps) {
  const { isFavorite, toggleFavorite } = useStore();
  const favorite = isFavorite(technique.id);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-700';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700';
      case 'emerging':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(technique.id);
  };

  return (
    <Link
      to={`/techniques/${technique.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {showRank && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                {technique.healthImpactRank}
              </span>
              <span className="text-xs text-gray-500">Health Impact Rank</span>
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {technique.name}
          </h3>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {technique.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getDifficultyColor(technique.difficulty)}`}>
              {technique.difficulty}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEvidenceColor(technique.evidenceLevel)}`}>
              {technique.evidenceLevel} evidence
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(technique.pattern.recommendedDuration)}
            </span>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap gap-1 mt-2">
            {technique.primaryBenefits?.slice(0, 3).map((benefit) => (
              <span
                key={benefit}
                className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded"
              >
                {benefit.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2 ml-4">
          <button
            onClick={handleFavoriteClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${
                favorite ? 'text-red-500 fill-current' : 'text-gray-400'
              }`}
            />
          </button>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

export default TechniqueCard;
