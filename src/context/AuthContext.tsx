import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences } from '../types';
import { StorageService } from '../services/storage';
import { DEMO_USER } from '../services/mockData';

interface RegisterParams {
  name: string;
  email: string;
  mobileNumber: string;
  password?: string;
}

interface AuthContextType {
  user: User;
  currentUser: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setDemoMode: (active: boolean) => void;
  register: (params: RegisterParams) => Promise<{ success: boolean; message: string; user?: User }>;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithDemo: () => void;
  resetPassword: (identifier: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  acceptDisclaimer: () => void;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  completeOnboarding: (prefs: Partial<UserPreferences>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUser, setActiveUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => StorageService.isDemoMode());

  // Keep Storage in sync with active user
  useEffect(() => {
    StorageService.setCurrentUser(activeUser);
  }, [activeUser]);

  const setDemoMode = (active: boolean) => {
    StorageService.setDemoMode(active);
    setIsDemoModeState(active);
    // Preserves activeUser session so user identity is never lost
  };

  const loginWithDemo = () => {
    setDemoMode(true);
    setActiveUser(DEMO_USER);
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setActiveUser(DEMO_USER);
    setDemoMode(false);
    return true;
  };

  const register = async (params: RegisterParams): Promise<{ success: boolean; message: string; user?: User }> => {
    const existing = StorageService.findUser(params.email) || StorageService.findUser(params.mobileNumber);
    if (existing) {
      return {
        success: false,
        message: 'An account with this email address or mobile number already exists. Please log in.',
      };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: params.email.toLowerCase().trim(),
      name: params.name.trim(),
      mobileNumber: params.mobileNumber.trim(),
      isPhoneVerified: true, // Verified through the mandatory OTP step
      hasAcceptedDisclaimer: false, // Must be accepted upon first entry
      passwordHash: params.password || 'user123',
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
    setActiveUser(newUser);
    setDemoMode(false);

    return {
      success: true,
      message: 'Account created successfully.',
      user: newUser,
    };
  };

  const login = async (identifier: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = identifier.trim();
    if (!cleanId) {
      return { success: false, message: 'Please enter your registered email or mobile number.' };
    }

    const found = StorageService.findUser(cleanId);
    if (!found) {
      return {
        success: false,
        message: 'Account not found. Please register first or use the Demo account.',
      };
    }

    // Password verification
    if (password && found.passwordHash && found.passwordHash !== password) {
      return { success: false, message: 'Incorrect password. Please try again or reset password.' };
    }

    setActiveUser(found);
    setDemoMode(false);
    return { success: true, message: 'Welcome back!' };
  };

  const resetPassword = async (identifier: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const found = StorageService.findUser(identifier);
    if (!found) {
      return { success: false, message: 'No registered account found with this email or mobile number.' };
    }

    const updatedUser: User = {
      ...found,
      passwordHash: newPassword,
    };

    StorageService.saveRegisteredUser(updatedUser);
    return { success: true, message: 'Password has been reset successfully. You can now log in.' };
  };

  const acceptDisclaimer = () => {
    if (!activeUser) return;
    const updatedUser: User = {
      ...activeUser,
      hasAcceptedDisclaimer: true,
      disclaimerAcceptedAt: new Date().toISOString(),
    };
    setActiveUser(updatedUser);
    StorageService.saveRegisteredUser(updatedUser);
  };

  const logout = () => {
    setActiveUser(null);
    StorageService.setCurrentUser(null);
    StorageService.setDemoMode(false);
  };

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    const target = activeUser || DEMO_USER;
    const updatedUser: User = {
      ...target,
      preferences: {
        ...target.preferences,
        ...prefs,
      },
    };
    if (activeUser) {
      setActiveUser(updatedUser);
      StorageService.saveRegisteredUser(updatedUser);
    }
  };

  const completeOnboarding = (prefs: Partial<UserPreferences>) => {
    const target = activeUser || DEMO_USER;
    const updatedUser: User = {
      ...target,
      isOnboarded: true,
      preferences: {
        ...target.preferences,
        ...prefs,
      },
    };
    if (activeUser) {
      setActiveUser(updatedUser);
      StorageService.saveRegisteredUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser || DEMO_USER,
        currentUser: activeUser,
        isAuthenticated: activeUser !== null,
        isDemoMode,
        setDemoMode,
        register,
        login,
        loginWithGoogle,
        loginWithDemo,
        resetPassword,
        acceptDisclaimer,
        logout,
        updateUserPreferences,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
