import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
}

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

interface OnboardingAnswers {
  goal: string;
  experience: string;
  duration: string;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;

  // Onboarding
  onboardingComplete: boolean;
  onboardingAnswers: OnboardingAnswers | null;
  completeOnboarding: (answers: OnboardingAnswers) => void;

  // Progress
  sessions: Session[];
  favorites: string[];
  addSession: (session: Omit<Session, 'id'>) => void;
  toggleFavorite: (techniqueId: string) => void;
  isFavorite: (techniqueId: string) => boolean;

  // Stats
  getTotalSessions: () => number;
  getTotalMinutes: () => number;
  getCurrentStreak: () => number;
  getWeeklyMinutes: () => number[];
  getTodaysSessions: () => Session[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,

      login: async (email: string, _password: string) => {
        // In production, this would call the API
        const user = { id: Date.now().toString(), email };
        set({ user, isAuthenticated: true });
      },

      register: async (email: string, _password: string, name?: string) => {
        // In production, this would call the API
        const user = { id: Date.now().toString(), email, name };
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      // Onboarding state
      onboardingComplete: false,
      onboardingAnswers: null,

      completeOnboarding: (answers: OnboardingAnswers) => {
        set({ onboardingComplete: true, onboardingAnswers: answers });
      },

      // Progress state
      sessions: [],
      favorites: [],

      addSession: (sessionData: Omit<Session, 'id'>) => {
        const newSession: Session = {
          ...sessionData,
          id: Date.now().toString()
        };
        set(state => ({ sessions: [...state.sessions, newSession] }));
      },

      toggleFavorite: (techniqueId: string) => {
        set(state => {
          if (state.favorites.includes(techniqueId)) {
            return { favorites: state.favorites.filter(f => f !== techniqueId) };
          }
          return { favorites: [...state.favorites, techniqueId] };
        });
      },

      isFavorite: (techniqueId: string) => {
        return get().favorites.includes(techniqueId);
      },

      // Stats calculations
      getTotalSessions: () => get().sessions.length,

      getTotalMinutes: () => {
        return get().sessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
      },

      getCurrentStreak: () => {
        const sessions = get().sessions;
        if (sessions.length === 0) return 0;

        const sortedDates = [...new Set(
          sessions.map(s => s.date.split('T')[0])
        )].sort().reverse();

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
          return 0;
        }

        let streak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
          const current = new Date(sortedDates[i]);
          const next = new Date(sortedDates[i + 1]);
          const diffDays = (current.getTime() - next.getTime()) / 86400000;

          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },

      getWeeklyMinutes: () => {
        const weekData: number[] = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();

        get().sessions.forEach(session => {
          const sessionDate = new Date(session.date);
          const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / 86400000);
          if (diffDays >= 0 && diffDays < 7) {
            weekData[6 - diffDays] += Math.floor(session.duration / 60);
          }
        });

        return weekData;
      },

      getTodaysSessions: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().sessions.filter(s => s.date.startsWith(today));
      }
    }),
    {
      name: 'breathe-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboardingComplete: state.onboardingComplete,
        onboardingAnswers: state.onboardingAnswers,
        sessions: state.sessions,
        favorites: state.favorites
      })
    }
  )
);
