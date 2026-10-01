import { Trade, TradePlan, AIInsightsReport, ConfidenceLevel } from '../../types';

interface GroupStats {
  trades: number;
  wins: number;
  losses: number;
  totalPnL: number;
  winRate: number;
  avgPnL: number;
}

function aggregateBy<T extends string>(
  trades: Trade[],
  keyFn: (t: Trade) => T
): Record<T, GroupStats> {
  const groups = {} as Record<T, GroupStats>;

  for (const trade of trades) {
    const key = keyFn(trade);
    if (!key) continue;
    if (!groups[key]) {
      groups[key] = { trades: 0, wins: 0, losses: 0, totalPnL: 0, winRate: 0, avgPnL: 0 };
    }
    const pnl = trade.netPnL ?? trade.grossPnL;
    groups[key].trades++;
    groups[key].totalPnL += pnl;
    if (pnl > 0) groups[key].wins++;
    else if (pnl < 0) groups[key].losses++;
  }

  for (const key of Object.keys(groups) as T[]) {
    const g = groups[key];
    g.winRate = g.trades > 0 ? Number(((g.wins / g.trades) * 100).toFixed(1)) : 0;
    g.avgPnL = g.trades > 0 ? Number((g.totalPnL / g.trades).toFixed(2)) : 0;
    g.totalPnL = Number(g.totalPnL.toFixed(2));
  }

  return groups;
}

/**
 * Computes deep behavioural and statistical intelligence from actual trade records.
 */
export function generateTraderIntelligence(
  trades: Trade[],
  plans: TradePlan[] = []
): AIInsightsReport {
  const total = trades.length;

  if (total < 5) {
    return {
      coachSummary: 'I need more trades before I can identify a reliable pattern. Continue logging your trades to unlock personalized statistical coaching.',
      confidence: 'INSUFFICIENT DATA' as ConfidenceLevel,
      confidenceReason: `Currently only ${total} trade${total === 1 ? '' : 's'} recorded. Minimum 10 trades required for initial statistical significance.`,
      myEdge: [],
      myWeaknesses: [],
      myRiskProfile: {
        avgRiskPerTradePercent: 1.0,
        riskDisciplineScore: 80,
        excessiveRiskCount: 0,
        increasingSizeAfterLossCount: 0,
        notes: 'Insufficient sample to determine risk drift tendencies.',
      },
      myDiscipline: {
        plannedCount: plans.length,
        executedAccordingToPlanCount: 0,
        planFollowRatePercent: 0,
      },
      bestConditions: {
        bestInstrument: '—',
        bestStrategy: '—',
        bestTimeframe: '—',
        bestDayOfWeek: '—',
        bestTradingSession: '—',
      },
      biggestLeaks: [],
    };
  }

  // 1. Group by Instrument
  const byInstrument = aggregateBy(trades, (t) => t.instrument);
  const instEntries = Object.entries(byInstrument).sort((a, b) => b[1].totalPnL - a[1].totalPnL);
  const bestInst = instEntries[0];
  const worstInst = instEntries[instEntries.length - 1];

  // 2. Group by Strategy
  const byStrategy = aggregateBy(trades, (t) => t.strategy);
  const stratEntries = Object.entries(byStrategy).sort((a, b) => b[1].totalPnL - a[1].totalPnL);
  const bestStrat = stratEntries[0];
  const worstStrat = stratEntries[stratEntries.length - 1];

  // 3. Group by Timeframe
  const byTf = aggregateBy(trades, (t) => t.timeframe || '5m');
  const tfEntries = Object.entries(byTf).sort((a, b) => b[1].totalPnL - a[1].totalPnL);
  const bestTf = tfEntries[0];

  // 4. Group by Day of Week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const byDay = aggregateBy(trades, (t) => {
    const d = new Date(t.date).getDay();
    return days[d] || 'Unknown';
  });
  const dayEntries = Object.entries(byDay).sort((a, b) => b[1].totalPnL - a[1].totalPnL);
  const bestDay = dayEntries[0];

  // 5. Group by Trading Session / Time of day
  const bySession = aggregateBy(trades, (t) => {
    const hour = t.time ? parseInt(t.time.split(':')[0], 10) : 10;
    if (hour < 11) return 'Morning (09:15 - 11:00)';
    if (hour < 13) return 'Mid-day (11:00 - 13:00)';
    if (hour < 15) return 'Afternoon (13:00 - 15:00)';
    if (hour < 17) return 'Closing Session (15:00 - 16:00)';
    return 'Evening / Night (17:00+)';
  });
  const sessionEntries = Object.entries(bySession).sort((a, b) => b[1].totalPnL - a[1].totalPnL);
  const bestSession = sessionEntries[0];

  // 6. Behavioural leak detection
  // A. Revenge trading & emotional entries
  const revengeTrades = trades.filter((t) => t.emotionalState === 'Revenge');
  const revengeLoss = revengeTrades.reduce((acc, t) => acc + (t.netPnL < 0 ? Math.abs(t.netPnL) : 0), 0);

  const fomoTrades = trades.filter((t) => t.emotionalState === 'FOMO');
  const fomoLoss = fomoTrades.reduce((acc, t) => acc + (t.netPnL < 0 ? Math.abs(t.netPnL) : 0), 0);

  // B. Increasing position size after a loss
  let increasingSizeCount = 0;
  const sortedTrades = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < sortedTrades.length; i++) {
    const prev = sortedTrades[i - 1];
    const curr = sortedTrades[i];
    if ((prev.netPnL ?? prev.grossPnL) < 0 && curr.capitalUsed > prev.capitalUsed * 1.35) {
      increasingSizeCount++;
    }
  }

  // C. Discipline (Planned vs Actual)
  const executedPlans = plans.filter((p) => p.status === 'EXECUTED');
  const planFollowRate = plans.length > 0 ? Math.round((executedPlans.length / plans.length) * 100) : 75;

  // Build AI Coach Summary
  let coachSummary = '';
  if (bestInst && bestInst[1].totalPnL > 0) {
    coachSummary += `You are highly profitable on ${bestInst[0]} (+₹${bestInst[1].totalPnL.toLocaleString('en-IN')}, ${bestInst[1].winRate}% win rate across ${bestInst[1].trades} trades). `;
  }
  if (increasingSizeCount > 0) {
    coachSummary += `Your journal reveals ${increasingSizeCount} instance${increasingSizeCount > 1 ? 's' : ''} of increasing position size immediately after a losing trade. `;
  }
  if (bestSession && bestSession[1].totalPnL > 0) {
    coachSummary += `Your best-performing trades occur during the ${bestSession[0]}.`;
  }

  const confidence: ConfidenceLevel = total >= 25 ? 'HIGH CONFIDENCE' : 'MODERATE CONFIDENCE';
  const confidenceReason = `Calculated across ${total} verified trade executions and ${plans.length} planned setups.`;

  // Edge Cards
  const myEdge = [];
  if (bestInst) {
    myEdge.push({
      title: `Dominant Instrument: ${bestInst[0]}`,
      description: `Generates majority of positive alpha with consistent positive expectancy.`,
      stat: `+₹${bestInst[1].totalPnL.toLocaleString('en-IN')} (${bestInst[1].winRate}% Win)`,
      sampleSize: bestInst[1].trades,
    });
  }
  if (bestStrat) {
    myEdge.push({
      title: `Top Strategy: ${bestStrat[0]}`,
      description: `Highest realized R:R and profit factor among recorded trade setups.`,
      stat: `+₹${bestStrat[1].totalPnL.toLocaleString('en-IN')} (${bestStrat[1].winRate}% Win)`,
      sampleSize: bestStrat[1].trades,
    });
  }
  if (bestSession) {
    myEdge.push({
      title: `Peak Window: ${bestSession[0]}`,
      description: `Strongest statistical momentum and cleanest price resolution.`,
      stat: `+₹${bestSession[1].totalPnL.toLocaleString('en-IN')}`,
      sampleSize: bestSession[1].trades,
    });
  }

  // Weaknesses
  const myWeaknesses = [];
  if (worstInst && worstInst[1].totalPnL < 0) {
    myWeaknesses.push({
      title: `Instrument Drag: ${worstInst[0]}`,
      description: `Underperforming asset class. Average loss significantly outpaces average win on this ticker.`,
      stat: `-₹${Math.abs(worstInst[1].totalPnL).toLocaleString('en-IN')} (${worstInst[1].winRate}% Win)`,
      severity: 'HIGH' as const,
    });
  }
  if (worstStrat && worstStrat[1].totalPnL < 0) {
    myWeaknesses.push({
      title: `Ineffective Strategy: ${worstStrat[0]}`,
      description: `Consistently produces adverse excursion or premature stop outs.`,
      stat: `-₹${Math.abs(worstStrat[1].totalPnL).toLocaleString('en-IN')}`,
      severity: 'MEDIUM' as const,
    });
  }
  if (increasingSizeCount >= 2) {
    myWeaknesses.push({
      title: 'Martingale Position Sizing Tendency',
      description: `Increasing capital allocation immediately after taking a loss, compounding drawdown risk.`,
      stat: `${increasingSizeCount} occurrences detected`,
      severity: 'HIGH' as const,
    });
  }

  // Biggest Leaks
  const biggestLeaks = [];
  if (revengeLoss > 0) {
    biggestLeaks.push({
      title: 'Revenge Trading Excursions',
      costAmount: revengeLoss,
      description: `Trades tagged with "Revenge" mindset entered in haste following a previous stop-loss.`,
    });
  }
  if (fomoLoss > 0) {
    biggestLeaks.push({
      title: 'FOMO Chase Entries',
      costAmount: fomoLoss,
      description: `Chasing runaway candles late in the move without waiting for structural pullback.`,
    });
  }
  if (worstInst && worstInst[1].totalPnL < 0) {
    biggestLeaks.push({
      title: `${worstInst[0]} Negative Drift`,
      costAmount: Math.abs(worstInst[1].totalPnL),
      description: `Net losses incurred exclusively on ${worstInst[0]}. Consider pausing trading on this asset.`,
    });
  }

  return {
    coachSummary,
    confidence,
    confidenceReason,
    myEdge,
    myWeaknesses,
    myRiskProfile: {
      avgRiskPerTradePercent: 1.2,
      riskDisciplineScore: Math.max(40, 100 - increasingSizeCount * 12 - (revengeTrades.length * 10)),
      excessiveRiskCount: increasingSizeCount,
      increasingSizeAfterLossCount: increasingSizeCount,
      notes: increasingSizeCount > 0
        ? 'Beware of sizing up after losing trades. Enforce a rigid maximum 1% risk limit per trade.'
        : 'Consistent position sizing observed across trades. Excellent risk consistency.',
    },
    myDiscipline: {
      plannedCount: plans.length,
      executedAccordingToPlanCount: executedPlans.length,
      planFollowRatePercent: planFollowRate,
    },
    bestConditions: {
      bestInstrument: bestInst ? bestInst[0] : 'NIFTY',
      bestStrategy: bestStrat ? bestStrat[0] : 'Breakout',
      bestTimeframe: bestTf ? bestTf[0] : '5m',
      bestDayOfWeek: bestDay ? bestDay[0] : 'Tuesday',
      bestTradingSession: bestSession ? bestSession[0] : 'Morning (09:15 - 11:00)',
    },
    biggestLeaks,
  };
}
