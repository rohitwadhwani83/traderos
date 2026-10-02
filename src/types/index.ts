export type AssetClass =
  | 'Indian Indices'
  | 'Indian Equities'
  | 'Commodities'
  | 'Crypto'
  | 'F&O'
  | 'Forex';

export type TradeDirection = 'LONG' | 'SHORT';

export type EmotionalState =
  | 'Calm'
  | 'Confident'
  | 'Fearful'
  | 'Greedy'
  | 'FOMO'
  | 'Revenge'
  | 'Impulsive'
  | 'Disciplined';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';

export type StrategyType =
  | 'Breakout'
  | 'Pullback'
  | 'Support/Resistance'
  | 'Trend Following'
  | 'FVG'
  | 'VWAP'
  | 'EMA'
  | 'Price Action'
  | 'Options'
  | 'Scalping'
  | 'Swing'
  | 'Custom';

export interface TradeCharges {
  brokerage: number;
  stt: number;
  exchangeCharges: number;
  gst: number;
  sebiCharges: number;
  otherCharges: number;
  totalCharges: number;
}

export interface Trade {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  instrument: string;
  assetClass: AssetClass;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  capitalUsed: number;
  stopLoss?: number;
  target?: number;
  strategy: string;
  timeframe?: Timeframe;
  entryReason?: string;
  exitReason?: string;
  screenshotUrl?: string;
  notes?: string;
  emotionalState?: EmotionalState;
  charges?: TradeCharges;
  
  // Computed fields (persisted for fast queries or auto-calculated)
  grossPnL: number;
  netPnL: number;
  pnlPercentage: number;
  riskAmount?: number;
  riskPercentage?: number;
  rewardAmount?: number;
  rrRatio?: number;
  holdingDurationMinutes?: number;
  isWin: boolean;
  isBreakEven: boolean;
  
  tradePlanId?: string; // Links to planned trade if converted
  createdAt: string;
  updatedAt: string;
}

export type TradePlanStatus = 'PLANNED' | 'EXECUTED' | 'SKIPPED' | 'INVALIDATED' | 'EXPIRED';

export interface TradePlan {
  id: string;
  userId: string;
  instrument: string;
  assetClass: AssetClass;
  direction: TradeDirection;
  entryZoneMin: number;
  entryZoneMax: number;
  stopLoss: number;
  target: number;
  rrRatio: number;
  suggestedPositionSize?: number;
  timeframe?: Timeframe;
  reason: string;
  screenshotUrl?: string;
  status: TradePlanStatus;
  executionTradeId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type MarketStatusType = 'OPEN' | 'CLOSED' | 'PRE-MARKET' | 'POST-MARKET' | 'UNKNOWN';
export type DataQualityType = 'LIVE' | 'DELAYED' | 'HISTORICAL' | 'SCREENSHOT' | 'USER_DATA';
export type SetupBias = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'MIXED';
export type SetupStatus = 'WAIT' | 'WATCH' | 'POTENTIAL SETUP' | 'NO CLEAR SETUP';
export type SetupQuality = 'STRONG ALIGNMENT' | 'PARTIAL ALIGNMENT' | 'MIXED' | 'NO CLEAR SETUP';
export type ConfidenceLevel = 'HIGH CONFIDENCE' | 'MODERATE CONFIDENCE' | 'INSUFFICIENT DATA';

export interface MultiTimeframeStructure {
  tf5m: SetupBias;
  tf15m: SetupBias;
  tf1h: SetupBias;
  tf4h: SetupBias;
  tfDaily: SetupBias;
}

export interface KeyLevels {
  support: number[];
  resistance: number[];
  pdh?: number; // Previous Day High
  pdl?: number; // Previous Day Low
  vwap?: number;
  swingHigh?: number;
  swingLow?: number;
}

export interface MarketAnalysis {
  id: string;
  instrument: string;
  assetClass: AssetClass;
  currentPrice: number;
  change: number;
  changePercent: number;
  sessionHigh: number;
  sessionLow: number;
  volume: number;
  previousClose: number;
  marketStatus: MarketStatusType;
  dataQuality: DataQualityType;
  dataSource: string;
  dataTimestamp: string;
  
  bias: SetupBias;
  setupStatus: SetupStatus;
  setupType: string; // e.g. "Pullback toward support", "Breakout retest"
  setupQuality: SetupQuality;
  
  entryZone: { min: number; max: number };
  invalidation: number;
  targetZone: { target1: number; target2?: number };
  riskReward: number;
  
  higherTimeframeStructure: string;
  lowerTimeframeStructure: string;
  multiTimeframe: MultiTimeframeStructure;
  
  keyLevels: KeyLevels;
  momentum: string;
  volatility: string;
  
  confirmationConditions: string;
  invalidationConditions: string;
  riskNotes: string[];
  
  confidence: ConfidenceLevel;
  confidenceReason: string;
  
  screenshotUrl?: string;
  chartUrl?: string;
  analyzedAt: string;
  mtfData?: any;
}

export interface PerformanceMetrics {
  startingCapital: number;
  currentCapital: number;
  totalGrossPnL: number;
  totalNetPnL: number;
  totalReturnPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number; // percentage 0-100
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  averageRR: number;
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
  expectancy: number; // expected return per trade
  winLossRatio: number;
  largestWin: number;
  largestLoss: number;
  avgHoldingDurationMinutes: number;
}

export interface EquityCurvePoint {
  date: string;
  equity: number;
  pnl: number;
  cumulativePnL: number;
  drawdown: number;
  drawdownPercent: number;
  tradeCount: number;
}

export interface DailyPnLSummary {
  date: string;
  pnl: number;
  tradesCount: number;
  wins: number;
  losses: number;
}

export interface AIInsightsReport {
  coachSummary: string;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  myEdge: Array<{
    title: string;
    description: string;
    stat: string;
    sampleSize: number;
  }>;
  myWeaknesses: Array<{
    title: string;
    description: string;
    stat: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  myRiskProfile: {
    avgRiskPerTradePercent: number;
    riskDisciplineScore: number; // 0-100
    excessiveRiskCount: number;
    increasingSizeAfterLossCount: number;
    notes: string;
  };
  myDiscipline: {
    plannedCount: number;
    executedAccordingToPlanCount: number;
    planFollowRatePercent: number;
  };
  bestConditions: {
    bestInstrument: string;
    bestStrategy: string;
    bestTimeframe: string;
    bestDayOfWeek: string;
    bestTradingSession: string;
  };
  biggestLeaks: Array<{
    title: string;
    costAmount: number;
    description: string;
  }>;
  weeklyReview?: {
    weekRange: string;
    tradeCount: number;
    winRate: number;
    netPnL: number;
    whatWentWell: string;
    whatHurtPerformance: string;
    biggestBehavioralPattern: string;
    bestPerformingSetup: string;
    biggestRisk: string;
    oneThingToImprove: string;
  };
}

export interface UserPreferences {
  defaultCurrency: 'INR' | 'USD' | 'USDT';
  startingCapital: number;
  defaultRiskPercent: number;
  timezone: string;
  preferredMarkets: AssetClass[];
  tradingStyle: 'Intraday' | 'Swing' | 'Scalper' | 'Positional';
  demoMode: boolean;
  theme: 'dark';
  enableAIInsights: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  mobileNumber?: string;
  isPhoneVerified?: boolean;
  hasAcceptedDisclaimer?: boolean;
  disclaimerAcceptedAt?: string;
  passwordHash?: string;
  avatarUrl?: string;
  createdAt: string;
  isOnboarded: boolean;
  preferences: UserPreferences;
}

export type TimeFilter = '7D' | '30D' | '3M' | '6M' | '1Y' | 'ALL';
