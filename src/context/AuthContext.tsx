import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences } from '../types';
import { StorageService } from '../services/storage';
import { DEMO_USER } from '../services/mockData';

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setDemoMode: (active: boolean) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  completeOnboarding: (prefs: Partial<UserPreferences>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => StorageService.getCurrentUser());
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => StorageService.isDemoMode());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    StorageService.setCurrentUser(user);
  }, [user]);

  const setDemoMode = (active: boolean) => {
    StorageService.setDemoMode(active);
    setIsDemoModeState(active);
    if (active) {
      setUser(DEMO_USER);
    }
  };

  const login = async (email: string): Promise<boolean> => {
    const registered = StorageService.getRegisteredUsers();
    let existing = registered.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!existing) {
      // Create new user account
      const newUser: User = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
        isOnboarded: false,
        preferences: {
          defaultCurrency: 'INR',
          startingCapital: 100000,
          defaultRiskPercent: 1.0,
          timezone: 'Asia/Kolkata',
          preferredMarkets: ['Indian Indices', 'Indian Equities'],
          tradingStyle: 'Intraday',
          demoMode: false,
          theme: 'dark',
          enableAIInsights: true,
        },
      };
      StorageService.saveRegisteredUser(newUser);
      existing = newUser;
    }

    setUser(existing);
    setIsAuthenticated(true);
    setDemoMode(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    return login('trader@google.com');
  };

  const logout = () => {
    setUser(DEMO_USER);
    setDemoMode(true);
  };

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    const updatedUser: User = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
    };
    setUser(updatedUser);
    StorageService.savePreferences(user.id, updatedUser.preferences);
    StorageService.saveRegisteredUser(updatedUser);
  };

  const completeOnboarding = (prefs: Partial<UserPreferences>) => {
    const updatedUser: User = {
      ...user,
      isOnboarded: true,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
    };
    setUser(updatedUser);
    StorageService.savePreferences(user.id, updatedUser.preferences);
    StorageService.saveRegisteredUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isDemoMode,
        setDemoMode,
        login,
        loginWithGoogle,
        logout,
        updateUserPreferences,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
