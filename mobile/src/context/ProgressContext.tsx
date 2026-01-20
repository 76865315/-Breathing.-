import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Session {
  id: string;
  techniqueId: string;
  date: string;
  duration: number;
  completed: boolean;
  preMood?: number;
  postMood?: number;
  rating?: number;
}

interface Stats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  favoritesTechniques: string[];
}

interface ProgressContextType {
  sessions: Session[];
  stats: Stats;
  favorites: string[];
  addSession: (session: Omit<Session, 'id'>) => Promise<void>;
  toggleFavorite: (techniqueId: string) => Promise<void>;
  isFavorite: (techniqueId: string) => boolean;
  getTodaysSessions: () => Session[];
  getWeeklyMinutes: () => number[];
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const initialStats: Stats = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null,
  favoritesTechniques: []
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionsData = await AsyncStorage.getItem('breathe_sessions');
      const statsData = await AsyncStorage.getItem('breathe_stats');
      const favoritesData = await AsyncStorage.getItem('breathe_favorites');

      if (sessionsData) setSessions(JSON.parse(sessionsData));
      if (statsData) setStats(JSON.parse(statsData));
      if (favoritesData) setFavorites(JSON.parse(favoritesData));
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const saveData = async (newSessions: Session[], newStats: Stats) => {
    try {
      await AsyncStorage.setItem('breathe_sessions', JSON.stringify(newSessions));
      await AsyncStorage.setItem('breathe_stats', JSON.stringify(newStats));
    } catch (error) {
      console.error('Error saving progress data:', error);
    }
  };

  const addSession = async (sessionData: Omit<Session, 'id'>) => {
    const newSession: Session = {
      ...sessionData,
      id: Date.now().toString()
    };

    const newSessions = [...sessions, newSession];

    // Update stats
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = stats.currentStreak;
    if (stats.lastSessionDate === yesterday) {
      newStreak = stats.currentStreak + 1;
    } else if (stats.lastSessionDate !== today) {
      newStreak = 1;
    }

    const newStats: Stats = {
      totalSessions: stats.totalSessions + 1,
      totalMinutes: stats.totalMinutes + Math.floor(sessionData.duration / 60),
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastSessionDate: today,
      favoritesTechniques: stats.favoritesTechniques
    };

    setSessions(newSessions);
    setStats(newStats);
    await saveData(newSessions, newStats);
  };

  const toggleFavorite = async (techniqueId: string) => {
    let newFavorites: string[];
    if (favorites.includes(techniqueId)) {
      newFavorites = favorites.filter(f => f !== techniqueId);
    } else {
      newFavorites = [...favorites, techniqueId];
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem('breathe_favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (techniqueId: string) => favorites.includes(techniqueId);

  const getTodaysSessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.date.startsWith(today));
  };

  const getWeeklyMinutes = () => {
    const weekData: number[] = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();

    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays < 7) {
        weekData[6 - diffDays] += Math.floor(session.duration / 60);
      }
    });

    return weekData;
  };

  return (
    <ProgressContext.Provider
      value={{
        sessions,
        stats,
        favorites,
        addSession,
        toggleFavorite,
        isFavorite,
        getTodaysSessions,
        getWeeklyMinutes
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
