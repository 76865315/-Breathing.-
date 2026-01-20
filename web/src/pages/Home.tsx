import { Link } from 'react-router-dom';
import { Play, Flame, Clock, TrendingUp } from 'lucide-react';
import { useStore } from '../context/store';
import techniques from '../data/breathing-techniques.json';

function Home() {
  const { user, onboardingAnswers, getCurrentStreak, getTotalMinutes, getTodaysSessions } = useStore();
  const todaysSessions = getTodaysSessions();
  const streak = getCurrentStreak();
  const totalMinutes = getTotalMinutes();

  // Get recommended technique based on onboarding
  const getRecommendedTechnique = () => {
    const goal = onboardingAnswers?.goal || 'general';
    if (goal === 'stress-reduction' || goal === 'general') {
      return techniques.techniques.find(t => t.id === 'cyclic-sighing');
    } else if (goal === 'sleep') {
      return techniques.techniques.find(t => t.id === '4-7-8-breathing');
    } else if (goal === 'performance') {
      return techniques.techniques.find(t => t.id === 'box-breathing');
    } else if (goal === 'energy') {
      return techniques.techniques.find(t => t.id === 'breath-of-fire');
    }
    return techniques.techniques[0];
  };

  const recommendedTechnique = getRecommendedTechnique();

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Time-based technique suggestion
  const getTimeSuggestion = () => {
    const hour = new Date().getHours();
    if (hour < 10) return { text: 'Start your day with calm focus', technique: techniques.techniques.find(t => t.id === 'box-breathing') };
    if (hour < 14) return { text: 'Maintain your focus and energy', technique: techniques.techniques.find(t => t.id === 'coherent-breathing') };
    if (hour < 18) return { text: 'Beat the afternoon slump', technique: techniques.techniques.find(t => t.id === 'cyclic-sighing') };
    if (hour < 21) return { text: 'Wind down your evening', technique: techniques.techniques.find(t => t.id === 'extended-exhale') };
    return { text: 'Prepare for restful sleep', technique: techniques.techniques.find(t => t.id === '4-7-8-breathing') };
  };

  const timeSuggestion = getTimeSuggestion();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.name || 'there'}!
        </h1>
        <p className="text-gray-500 mt-1">Ready to breathe?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <Flame className="h-6 w-6 mb-2" />
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-white/80 text-xs">Day streak</p>
        </div>
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <Clock className="h-6 w-6 mb-2" />
          <p className="text-2xl font-bold">{totalMinutes}</p>
          <p className="text-white/80 text-xs">Total minutes</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <TrendingUp className="h-6 w-6 mb-2" />
          <p className="text-2xl font-bold">{todaysSessions.length}</p>
          <p className="text-white/80 text-xs">Today</p>
        </div>
      </div>

      {/* Quick Start */}
      {recommendedTechnique && (
        <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-2xl p-6 text-white">
          <p className="text-white/70 text-sm mb-2">Recommended for you</p>
          <h2 className="text-xl font-bold mb-1">{recommendedTechnique.name}</h2>
          <p className="text-white/80 text-sm mb-4 line-clamp-2">
            {recommendedTechnique.description}
          </p>
          <Link
            to={`/session/${recommendedTechnique.id}`}
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold"
          >
            <Play className="h-5 w-5" />
            <span>Start Session</span>
          </Link>
        </div>
      )}

      {/* Time-based Suggestion */}
      {timeSuggestion.technique && (
        <div className="card">
          <p className="text-gray-500 text-sm mb-2">{timeSuggestion.text}</p>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{timeSuggestion.technique.name}</h3>
              <p className="text-sm text-gray-500">
                {Math.floor(timeSuggestion.technique.pattern.recommendedDuration / 60)} minutes
              </p>
            </div>
            <Link
              to={`/session/${timeSuggestion.technique.id}`}
              className="p-3 bg-primary-100 text-primary-600 rounded-xl hover:bg-primary-200 transition-colors"
            >
              <Play className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Popular Techniques */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Techniques</h2>
          <Link to="/techniques" className="text-primary-600 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {techniques.techniques.slice(0, 4).map((technique) => (
            <Link
              key={technique.id}
              to={`/techniques/${technique.id}`}
              className="flex items-center space-x-4 bg-white rounded-xl p-4 border border-gray-100"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                {technique.healthImpactRank}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{technique.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{technique.difficulty}</p>
              </div>
              <Play className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
