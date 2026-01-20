import { Flame, Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '../context/store';
import techniques from '../data/breathing-techniques.json';

function Progress() {
  const {
    sessions,
    getTotalSessions,
    getTotalMinutes,
    getCurrentStreak,
    getWeeklyMinutes
  } = useStore();

  const totalSessions = getTotalSessions();
  const totalMinutes = getTotalMinutes();
  const currentStreak = getCurrentStreak();
  const weeklyMinutes = getWeeklyMinutes();

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxWeeklyMinutes = Math.max(...weeklyMinutes, 1);

  // Calculate average mood improvement
  const sessionsWithMood = sessions.filter(s => s.preMood && s.postMood);
  const avgMoodImprovement = sessionsWithMood.length > 0
    ? sessionsWithMood.reduce((acc, s) => acc + ((s.postMood || 0) - (s.preMood || 0)), 0) / sessionsWithMood.length
    : 0;

  // Get most practiced technique
  const techniqueCount: Record<string, number> = {};
  sessions.forEach(s => {
    techniqueCount[s.techniqueId] = (techniqueCount[s.techniqueId] || 0) + 1;
  });
  const mostPracticedId = Object.entries(techniqueCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0];
  const mostPracticed = techniques.techniques.find(t => t.id === mostPracticedId);

  // Recent sessions
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500 mt-1">Track your breathing journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <Flame className="h-6 w-6 mb-2" />
          <p className="text-3xl font-bold">{currentStreak}</p>
          <p className="text-white/80 text-sm">Day streak</p>
        </div>
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <Clock className="h-6 w-6 mb-2" />
          <p className="text-3xl font-bold">{totalMinutes}</p>
          <p className="text-white/80 text-sm">Total minutes</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <Target className="h-6 w-6 mb-2" />
          <p className="text-3xl font-bold">{totalSessions}</p>
          <p className="text-white/80 text-sm">Sessions</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <TrendingUp className="h-6 w-6 mb-2" />
          <p className="text-3xl font-bold">
            {avgMoodImprovement >= 0 ? '+' : ''}{avgMoodImprovement.toFixed(1)}
          </p>
          <p className="text-white/80 text-sm">Avg mood change</p>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary-600" />
          This Week
        </h2>
        <div className="flex items-end justify-between h-32">
          {weeklyMinutes.map((minutes, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-8 bg-primary-200 rounded-t transition-all"
                style={{
                  height: `${(minutes / maxWeeklyMinutes) * 100}%`,
                  minHeight: minutes > 0 ? '8px' : '4px',
                  backgroundColor: minutes > 0 ? '#3b82f6' : '#e5e7eb'
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{weekDays[index]}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          {weeklyMinutes.reduce((a, b) => a + b, 0)} minutes this week
        </p>
      </div>

      {/* Most Practiced */}
      {mostPracticed && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Most Practiced</h2>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-primary-700 font-bold">
                #{mostPracticed.healthImpactRank}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{mostPracticed.name}</h3>
              <p className="text-sm text-gray-500">
                {techniqueCount[mostPracticedId]} sessions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const technique = techniques.techniques.find(t => t.id === session.techniqueId);
              const date = new Date(session.date);
              const moodChange = (session.postMood || 0) - (session.preMood || 0);

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {technique?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {date.toLocaleDateString()} · {Math.floor(session.duration / 60)} min
                    </p>
                  </div>
                  <div className="text-right">
                    {session.rating && (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < session.rating! ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    {moodChange !== 0 && (
                      <p className={`text-sm ${moodChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {moodChange > 0 ? '+' : ''}{moodChange} mood
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {totalSessions === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No sessions yet. Start your first breathing session!</p>
        </div>
      )}
    </div>
  );
}

export default Progress;
