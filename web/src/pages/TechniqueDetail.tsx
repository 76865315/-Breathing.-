import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Play, Clock, Heart, AlertTriangle,
  ChevronDown, ChevronUp, ExternalLink, BookOpen,
  Target, CheckCircle, XCircle, Star
} from 'lucide-react';
import { useStore } from '../context/store';
import techniques from '../data/breathing-techniques.json';

function TechniqueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useStore();
  const [expandedSections, setExpandedSections] = useState({
    instructions: true,
    science: false,
    outcomes: false,
    safety: false,
    resources: false
  });

  const technique = techniques.techniques.find(t => t.id === id);
  const favorite = isFavorite(id || '');

  if (!technique) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Technique not found.</p>
        <Link to="/techniques" className="text-primary-600 mt-2 inline-block">
          View all techniques
        </Link>
      </div>
    );
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'emerging': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <button
          onClick={() => toggleFavorite(technique.id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Heart className={`h-6 w-6 ${favorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Title and Overview */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
            #{technique.healthImpactRank}
          </span>
          <span className="text-sm text-gray-500">Health Impact Ranking</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{technique.name}</h1>
        <p className="text-gray-600 mt-2">{technique.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getEvidenceColor(technique.evidenceLevel)}`}>
            {technique.evidenceLevel} evidence
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 capitalize">
            {technique.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formatDuration(technique.pattern.recommendedDuration)}
          </span>
        </div>
      </div>

      {/* Start Session Button */}
      <Link
        to={`/session/${technique.id}`}
        className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 hover:bg-primary-700 transition-colors"
      >
        <Play className="h-5 w-5" />
        <span>Start Session</span>
      </Link>

      {/* Best For */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary-600" />
          Best For
        </h2>
        <div className="flex flex-wrap gap-2">
          {technique.bestFor?.map((item, i) => (
            <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Instructions Section */}
      <div className="card !p-0 overflow-hidden">
        <button
          onClick={() => toggleSection('instructions')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <h2 className="font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
            How to Practice
          </h2>
          {expandedSections.instructions ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.instructions && (
          <div className="px-4 pb-4 space-y-3">
            {technique.instructions?.map((step, i) => (
              <div key={i} className="flex space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}

            {/* Breathing Pattern */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Breathing Pattern</h3>
              <div className="flex flex-wrap gap-2">
                {technique.pattern.phases.map((phase, i) => (
                  <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm">
                    {phase.name}: {phase.duration}s
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ~{technique.pattern.cyclesPerMinute} cycles per minute
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Science Section */}
      <div className="card !p-0 overflow-hidden">
        <button
          onClick={() => toggleSection('science')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Star className="h-5 w-5 mr-2 text-primary-600" />
            The Science
          </h2>
          {expandedSections.science ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.science && (
          <div className="px-4 pb-4">
            <p className="text-gray-700 leading-relaxed">{technique.science}</p>
            {technique.researchReferences?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">References</h3>
                <ul className="text-sm text-gray-500 space-y-1">
                  {technique.researchReferences.map((ref, i) => (
                    <li key={i} className="text-xs">{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expected Outcomes */}
      <div className="card !p-0 overflow-hidden">
        <button
          onClick={() => toggleSection('outcomes')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <h2 className="font-semibold text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Expected Outcomes
          </h2>
          {expandedSections.outcomes ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.outcomes && technique.expectedOutcomes && (
          <div className="px-4 pb-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Immediate</h3>
              <ul className="space-y-1">
                {technique.expectedOutcomes.immediate?.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Short Term (2-4 weeks)</h3>
              <ul className="space-y-1">
                {technique.expectedOutcomes.shortTerm?.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Long Term</h3>
              <ul className="space-y-1">
                {technique.expectedOutcomes.longTerm?.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Safety Section */}
      {(technique.contraindications?.length > 0 || technique.safetyWarnings?.length > 0) && (
        <div className="card !p-0 overflow-hidden">
          <button
            onClick={() => toggleSection('safety')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <h2 className="font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Safety & Contraindications
            </h2>
            {expandedSections.safety ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.safety && (
            <div className="px-4 pb-4 space-y-4">
              {technique.safetyWarnings?.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Warnings</h3>
                  <ul className="space-y-1">
                    {technique.safetyWarnings.map((item, i) => (
                      <li key={i} className="text-sm text-yellow-700 flex items-start">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {technique.contraindications?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Contraindications</h3>
                  <ul className="space-y-1">
                    {technique.contraindications.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start">
                        <XCircle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* YouTube Resources */}
      {technique.youtubeResources?.length > 0 && (
        <div className="card !p-0 overflow-hidden">
          <button
            onClick={() => toggleSection('resources')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <h2 className="font-semibold text-gray-900 flex items-center">
              <ExternalLink className="h-5 w-5 mr-2 text-primary-600" />
              Video Resources
            </h2>
            {expandedSections.resources ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.resources && (
            <div className="px-4 pb-4 space-y-3">
              {technique.youtubeResources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-500">{resource.creator}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TechniqueDetail;
