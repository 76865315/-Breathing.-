import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'https://breathe-api.example.com/api'; // Replace with your deployed API

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('breathe_token');
      const userData = await AsyncStorage.getItem('breathe_user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // For demo/offline mode, accept any credentials
    const demoUser = {
      id: 'demo-user',
      email: email,
      name: email.split('@')[0]
    };

    await AsyncStorage.setItem('breathe_token', 'demo-token');
    await AsyncStorage.setItem('breathe_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const register = async (email: string, password: string, name?: string) => {
    // For demo/offline mode
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      email: email,
      name: name || email.split('@')[0]
    };

    await AsyncStorage.setItem('breathe_token', 'demo-token');
    await AsyncStorage.setItem('breathe_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('breathe_token');
    await AsyncStorage.removeItem('breathe_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
