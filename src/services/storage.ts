import { Trade, TradePlan, UserPreferences, User } from '../types';
import { DEMO_USER, generateDemoTrades, DEMO_TRADE_PLANS } from './mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'traderos_current_user',
  ALL_USERS: 'traderos_registered_users',
  DEMO_MODE: 'traderos_demo_mode_active',
  AUTH_SESSION: 'traderos_auth_session_active_v2',
};

function getTradesKey(userId: string): string {
  return `traderos_trades_${userId}`;
}

function getPlansKey(userId: string): string {
  return `traderos_plans_${userId}`;
}

function getPrefsKey(userId: string): string {
  return `traderos_prefs_${userId}`;
}

export const StorageService = {
  // Auth & User Management
  getCurrentUser(): User | null {
    const isSessionActive = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true';
    if (!isSessionActive) {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // invalid JSON
      }
    }
    return null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  },

  getRegisteredUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (!raw) return [DEMO_USER];
    try {
      return JSON.parse(raw);
    } catch {
      return [DEMO_USER];
    }
  },

  findUser(identifier: string): User | undefined {
    const users = this.getRegisteredUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '');

    return users.find((u) => {
      const matchEmail = u.email.toLowerCase() === cleanId;
      const matchPhone = u.mobileNumber && u.mobileNumber.replace(/[^0-9]/g, '').includes(cleanPhone);
      return matchEmail || matchPhone;
    });
  },

  saveRegisteredUser(user: User): void {
    const users = this.getRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) =>
        u.id === user.id ||
        u.email.toLowerCase() === user.email.toLowerCase() ||
        (u.mobileNumber && user.mobileNumber && u.mobileNumber === user.mobileNumber)
    );
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));

    // Update session if it's the active user
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      this.setCurrentUser(user);
    }
  },

  isDemoMode(): boolean {
    const stored = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
    if (stored === null) return true; // Default to demo mode for rich first-run experience
    return stored === 'true';
  },

  setDemoMode(active: boolean): void {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(active));
  },

  // Trades
  getTrades(userId: string, isDemo: boolean): Trade[] {
    if (isDemo) {
      const demoKey = getTradesKey('demo');
      const stored = localStorage.getItem(demoKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall through
        }
      }
      const initial = generateDemoTrades('demo');
      localStorage.setItem(demoKey, JSON.stringify(initial));
      return initial;
    }

    const key = getTradesKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  saveTrades(userId: string, isDemo: boolean, trades: Trade[]): void {
    const key = isDemo ? getTradesKey('demo') : getTradesKey(userId);
    localStorage.setItem(key, JSON.stringify(trades));
  },

  addTrade(userId: string, isDemo: boolean, trade: Trade): Trade[] {
    const current = this.getTrades(userId, isDemo);
    const updated = [trade, ...current];
    this.saveTrades(userId, isDemo, updated);
    return updated;
  },

  updateTrade(userId: string, isDemo: boolean, updatedTrade: Trade): Trade[] {
    const current = this.getTrades(userId, isDemo);
    const updated = current.map((t) => (t.id === updatedTrade.id ? updatedTrade : t));
    this.saveTrades(userId, isDemo, updated);
    return updated;
  },

  deleteTrade(userId: string, isDemo: boolean, tradeId: string): Trade[] {
    const current = this.getTrades(userId, isDemo);
    const updated = current.filter((t) => t.id !== tradeId);
    this.saveTrades(userId, isDemo, updated);
    return updated;
  },

  // Trade Plans
  getPlans(userId: string, isDemo: boolean): TradePlan[] {
    if (isDemo) {
      const demoKey = getPlansKey('demo');
      const stored = localStorage.getItem(demoKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
      localStorage.setItem(demoKey, JSON.stringify(DEMO_TRADE_PLANS));
      return DEMO_TRADE_PLANS;
    }

    const key = getPlansKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  savePlans(userId: string, isDemo: boolean, plans: TradePlan[]): void {
    const key = isDemo ? getPlansKey('demo') : getPlansKey(userId);
    localStorage.setItem(key, JSON.stringify(plans));
  },

  addPlan(userId: string, isDemo: boolean, plan: TradePlan): TradePlan[] {
    const current = this.getPlans(userId, isDemo);
    const updated = [plan, ...current];
    this.savePlans(userId, isDemo, updated);
    return updated;
  },

  updatePlan(userId: string, isDemo: boolean, updatedPlan: TradePlan): TradePlan[] {
    const current = this.getPlans(userId, isDemo);
    const updated = current.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    this.savePlans(userId, isDemo, updated);
    return updated;
  },

  deletePlan(userId: string, isDemo: boolean, planId: string): TradePlan[] {
    const current = this.getPlans(userId, isDemo);
    const updated = current.filter((p) => p.id !== planId);
    this.savePlans(userId, isDemo, updated);
    return updated;
  },

  // User Preferences
  getPreferences(userId: string): UserPreferences {
    const key = getPrefsKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback
      }
    }
    return DEMO_USER.preferences;
  },

  savePreferences(userId: string, prefs: UserPreferences): void {
    const key = getPrefsKey(userId);
    localStorage.setItem(key, JSON.stringify(prefs));
  },

  // Privacy & Data management
  clearUserData(userId: string): void {
    localStorage.removeItem(getTradesKey(userId));
    localStorage.removeItem(getPlansKey(userId));
    localStorage.removeItem(getPrefsKey(userId));
  },

  resetDemoData(): void {
    localStorage.removeItem(getTradesKey('demo'));
    localStorage.removeItem(getPlansKey('demo'));
  },
};
