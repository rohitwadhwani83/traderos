import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Trade,
  TradePlan,
  PerformanceMetrics,
  EquityCurvePoint,
  TimeFilter,
  AssetClass,
  TradeDirection,
  EmotionalState,
} from '../types';
import { useAuth } from './AuthContext';
import { StorageService } from '../services/storage';
import {
  calculatePerformanceMetrics,
  calculateEquityCurve,
} from '../utils/calculations';
import { exportTradesToCsv, triggerCsvDownload } from '../utils/csvParser';

export interface JournalFilterState {
  search: string;
  assetClass?: AssetClass | 'ALL';
  direction?: TradeDirection | 'ALL';
  strategy?: string | 'ALL';
  emotionalState?: EmotionalState | 'ALL';
  winLoss?: 'ALL' | 'WIN' | 'LOSS';
  dateFrom?: string;
  dateTo?: string;
}

interface TradingContextType {
  trades: Trade[];
  tradePlans: TradePlan[];
  filteredTrades: Trade[];
  filters: JournalFilterState;
  timeFilter: TimeFilter;
  metrics: PerformanceMetrics;
  equityCurve: EquityCurvePoint[];
  setTimeFilter: (tf: TimeFilter) => void;
  setFilters: React.Dispatch<React.SetStateAction<JournalFilterState>>;
  resetFilters: () => void;
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Trade;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (tradeId: string) => void;
  duplicateTrade: (tradeId: string) => void;
  addTradePlan: (plan: Omit<TradePlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => TradePlan;
  updateTradePlan: (plan: TradePlan) => void;
  deleteTradePlan: (planId: string) => void;
  importTrades: (newTrades: Trade[]) => void;
  exportCsv: () => void;
  resetAllData: () => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

const initialFilters: JournalFilterState = {
  search: '',
  assetClass: 'ALL',
  direction: 'ALL',
  strategy: 'ALL',
  emotionalState: 'ALL',
  winLoss: 'ALL',
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradePlans, setTradePlans] = useState<TradePlan[]>([]);
  const [filters, setFilters] = useState<JournalFilterState>(initialFilters);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');

  // Load trades and plans whenever user or demo mode toggles
  useEffect(() => {
    const userId = user?.id || 'guest';
    const loadedTrades = StorageService.getTrades(userId, isDemoMode);
    const loadedPlans = StorageService.getPlans(userId, isDemoMode);
    setTrades(loadedTrades);
    setTradePlans(loadedPlans);
  }, [user?.id, isDemoMode]);

  // Filter trades based on search, assetClass, direction, strategy, emotion, win/loss, and timeFilter
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchInst = t.instrument.toLowerCase().includes(query);
        const matchStrat = t.strategy.toLowerCase().includes(query);
        const matchNotes = (t.notes || '').toLowerCase().includes(query);
        const matchReason = (t.entryReason || '').toLowerCase().includes(query);
        if (!matchInst && !matchStrat && !matchNotes && !matchReason) return false;
      }

      // Asset Class
      if (filters.assetClass && filters.assetClass !== 'ALL' && t.assetClass !== filters.assetClass) {
        return false;
      }

      // Direction
      if (filters.direction && filters.direction !== 'ALL' && t.direction !== filters.direction) {
        return false;
      }

      // Strategy
      if (filters.strategy && filters.strategy !== 'ALL' && t.strategy !== filters.strategy) {
        return false;
      }

      // Emotional state
      if (filters.emotionalState && filters.emotionalState !== 'ALL' && t.emotionalState !== filters.emotionalState) {
        return false;
      }

      // Win / Loss
      if (filters.winLoss === 'WIN' && !t.isWin) return false;
      if (filters.winLoss === 'LOSS' && t.isWin) return false;

      // Time Filter (7D, 30D, 3M, 6M, 1Y, ALL)
      if (timeFilter !== 'ALL') {
        const tradeDate = new Date(t.date).getTime();
        const now = Date.now();
        let days = 30;
        if (timeFilter === '7D') days = 7;
        else if (timeFilter === '30D') days = 30;
        else if (timeFilter === '3M') days = 90;
        else if (timeFilter === '6M') days = 180;
        else if (timeFilter === '1Y') days = 365;

        const cutoff = now - days * 24 * 60 * 60 * 1000;
        if (tradeDate < cutoff) return false;
      }

      return true;
    });
  }, [trades, filters, timeFilter]);

  const activeCapital = user?.preferences?.startingCapital || 100000;
  const activeUserId = user?.id || 'guest';

  // Compute metrics from current trades
  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(activeCapital, filteredTrades);
  }, [activeCapital, filteredTrades]);

  // Compute equity curve points
  const equityCurve = useMemo(() => {
    return calculateEquityCurve(activeCapital, filteredTrades);
  }, [activeCapital, filteredTrades]);

  const resetFilters = () => setFilters(initialFilters);

  const addTrade = (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Trade => {
    const newTrade: Trade = {
      ...tradeData,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: activeUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = StorageService.addTrade(activeUserId, isDemoMode, newTrade);
    setTrades(updated);
    return newTrade;
  };

  const updateTrade = (updatedTrade: Trade) => {
    const updated = StorageService.updateTrade(activeUserId, isDemoMode, updatedTrade);
    setTrades(updated);
  };

  const deleteTrade = (tradeId: string) => {
    const updated = StorageService.deleteTrade(activeUserId, isDemoMode, tradeId);
    setTrades(updated);
  };

  const duplicateTrade = (tradeId: string) => {
    const target = trades.find((t) => t.id === tradeId);
    if (!target) return;
    const duplicated: Trade = {
      ...target,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      notes: `${target.notes || ''} (Duplicated)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = StorageService.addTrade(activeUserId, isDemoMode, duplicated);
    setTrades(updated);
  };

  const addTradePlan = (planData: Omit<TradePlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): TradePlan => {
    const newPlan: TradePlan = {
      ...planData,
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: activeUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = StorageService.addPlan(activeUserId, isDemoMode, newPlan);
    setTradePlans(updated);
    return newPlan;
  };

  const updateTradePlan = (updatedPlan: TradePlan) => {
    const updated = StorageService.updatePlan(activeUserId, isDemoMode, updatedPlan);
    setTradePlans(updated);
  };

  const deleteTradePlan = (planId: string) => {
    const updated = StorageService.deletePlan(activeUserId, isDemoMode, planId);
    setTradePlans(updated);
  };

  const importTrades = (newTrades: Trade[]) => {
    const combined = [...newTrades, ...trades];
    StorageService.saveTrades(activeUserId, isDemoMode, combined);
    setTrades(combined);
  };

  const exportCsv = () => {
    const csvContent = exportTradesToCsv(filteredTrades);
    const filename = `traderos_journal_${new Date().toISOString().split('T')[0]}.csv`;
    triggerCsvDownload(csvContent, filename);
  };

  const resetAllData = () => {
    if (isDemoMode) {
      StorageService.resetDemoData();
      const demo = StorageService.getTrades('demo', true);
      const plans = StorageService.getPlans('demo', true);
      setTrades(demo);
      setTradePlans(plans);
    } else {
      StorageService.clearUserData(activeUserId);
      setTrades([]);
      setTradePlans([]);
    }
  };

  return (
    <TradingContext.Provider
      value={{
        trades,
        tradePlans,
        filteredTrades,
        filters,
        timeFilter,
        metrics,
        equityCurve,
        setTimeFilter,
        setFilters,
        resetFilters,
        addTrade,
        updateTrade,
        deleteTrade,
        duplicateTrade,
        addTradePlan,
        updateTradePlan,
        deleteTradePlan,
        importTrades,
        exportCsv,
        resetAllData,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export function useTrading(): TradingContextType {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}
