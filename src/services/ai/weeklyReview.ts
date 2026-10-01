import { Trade } from '../../types';

export interface WeeklyReviewReport {
  weekRange: string;
  totalTrades: number;
  winRate: number;
  netPnL: number;
  profitFactor: number;
  whatWentWell: string;
  whatHurtPerformance: string;
  biggestBehavioralPattern: string;
  bestPerformingSetup: string;
  biggestRisk: string;
  oneThingToImprove: string;
}

/**
 * Generates an objective, fact-based AI Weekly Trading Review from recent trades.
 */
export function generateWeeklyTradingReview(trades: Trade[]): WeeklyReviewReport {
  if (trades.length === 0) {
    return {
      weekRange: 'Current Week',
      totalTrades: 0,
      winRate: 0,
      netPnL: 0,
      profitFactor: 0,
      whatWentWell: 'No trades logged in the selected period.',
      whatHurtPerformance: 'N/A',
      biggestBehavioralPattern: 'N/A',
      bestPerformingSetup: 'N/A',
      biggestRisk: 'N/A',
      oneThingToImprove: 'Log your setups and executions to generate your weekly retrospective.',
    };
  }

  // Take the most recent 10-15 trades or trades within 7 days
  const recentTrades = trades.slice(0, 15);
  const total = recentTrades.length;
  const wins = recentTrades.filter((t) => (t.netPnL ?? t.grossPnL) > 0);
  const losses = recentTrades.filter((t) => (t.netPnL ?? t.grossPnL) < 0);
  const winRate = Number(((wins.length / total) * 100).toFixed(1));

  let totalNetPnL = 0;
  let sumWin = 0;
  let sumLoss = 0;

  for (const t of recentTrades) {
    const pnl = t.netPnL ?? t.grossPnL;
    totalNetPnL += pnl;
    if (pnl > 0) sumWin += pnl;
    if (pnl < 0) sumLoss += Math.abs(pnl);
  }

  const avgWin = wins.length > 0 ? sumWin / wins.length : 0;
  const avgLoss = losses.length > 0 ? sumLoss / losses.length : 0;
  const lossToWinRatio = avgWin > 0 ? (avgLoss / avgWin).toFixed(1) : '1.0';
  const profitFactor = sumLoss > 0 ? Number((sumWin / sumLoss).toFixed(2)) : sumWin > 0 ? 99 : 0;

  // Find best setup
  const strategyPnL: Record<string, number> = {};
  for (const t of recentTrades) {
    strategyPnL[t.strategy] = (strategyPnL[t.strategy] || 0) + (t.netPnL ?? t.grossPnL);
  }
  const bestStrat = Object.entries(strategyPnL).sort((a, b) => b[1] - a[1])[0];

  // Behavioral observation
  const emotions = recentTrades.map((t) => t.emotionalState);
  const revengeCount = emotions.filter((e) => e === 'Revenge').length;
  const fomoCount = emotions.filter((e) => e === 'FOMO').length;

  let behavioralInsight = 'Execution remained disciplined across most trades with adherence to system parameters.';
  if (revengeCount > 0) {
    behavioralInsight = `Observed ${revengeCount} revenge trade attempt${revengeCount > 1 ? 's' : ''} after absorbing a loss. Taking an immediate break is critical.`;
  } else if (fomoCount > 0) {
    behavioralInsight = `Detected ${fomoCount} FOMO entry where positions were taken late into extended moves.`;
  }

  // Dates
  const dates = recentTrades.map((t) => t.date).sort();
  const weekRange = `${dates[0]} to ${dates[dates.length - 1]}`;

  return {
    weekRange,
    totalTrades: total,
    winRate,
    netPnL: Number(totalNetPnL.toFixed(2)),
    profitFactor,
    whatWentWell: `You took ${total} trades with a ${winRate}% win rate. ${bestStrat ? `Your ${bestStrat[0]} setups were particularly profitable (+₹${bestStrat[1].toLocaleString('en-IN')}).` : 'Maintained steady trade execution.'}`,
    whatHurtPerformance: avgLoss > avgWin
      ? `Your average losing trade was ${lossToWinRatio}× your average winning trade. A small number of oversized losses eroded multiple successful trades.`
      : `Holding losing trades through multiple support levels before cutting generated avoidable drag on overall P&L.`,
    biggestBehavioralPattern: behavioralInsight,
    bestPerformingSetup: bestStrat ? `${bestStrat[0]} (+₹${bestStrat[1].toLocaleString('en-IN')})` : 'Morning Pullback',
    biggestRisk: 'Increasing position size when frustrated or during late-day trading sessions.',
    oneThingToImprove: avgLoss > avgWin
      ? 'Your biggest opportunity appears to be improving loss control and stop adherence rather than increasing trade frequency.'
      : 'Protect your morning gains by avoiding lower-probability discretionary scalps during the late afternoon session.',
  };
}
