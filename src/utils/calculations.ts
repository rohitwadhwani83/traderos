import { Trade, PerformanceMetrics, EquityCurvePoint, TradeCharges, TradeDirection } from '../types';

/**
 * Calculates Gross PnL based on direction, entry, exit, and quantity.
 */
export function calculateGrossPnL(
  direction: TradeDirection,
  entryPrice: number,
  exitPrice: number,
  quantity: number
): number {
  if (quantity <= 0 || entryPrice <= 0 || exitPrice <= 0) return 0;
  if (direction === 'LONG') {
    return Number(((exitPrice - entryPrice) * quantity).toFixed(2));
  } else {
    return Number(((entryPrice - exitPrice) * quantity).toFixed(2));
  }
}

/**
 * Calculates Net PnL after deducting transaction charges.
 */
export function calculateNetPnL(grossPnL: number, charges?: Partial<TradeCharges>): number {
  const totalCharges = charges?.totalCharges ?? 
    ((charges?.brokerage ?? 0) +
     (charges?.stt ?? 0) +
     (charges?.exchangeCharges ?? 0) +
     (charges?.gst ?? 0) +
     (charges?.sebiCharges ?? 0) +
     (charges?.otherCharges ?? 0));
  return Number((grossPnL - totalCharges).toFixed(2));
}

/**
 * Calculates Risk Amount based on entry, stop loss, and quantity.
 */
export function calculateRisk(
  direction: TradeDirection,
  entryPrice: number,
  stopLoss: number | undefined,
  quantity: number
): number {
  if (!stopLoss || stopLoss <= 0 || quantity <= 0) return 0;
  const riskPerUnit = direction === 'LONG'
    ? Math.max(0, entryPrice - stopLoss)
    : Math.max(0, stopLoss - entryPrice);
  return Number((riskPerUnit * quantity).toFixed(2));
}

/**
 * Calculates Reward Amount based on entry, target, and quantity.
 */
export function calculateReward(
  direction: TradeDirection,
  entryPrice: number,
  target: number | undefined,
  quantity: number
): number {
  if (!target || target <= 0 || quantity <= 0) return 0;
  const rewardPerUnit = direction === 'LONG'
    ? Math.max(0, target - entryPrice)
    : Math.max(0, entryPrice - target);
  return Number((rewardPerUnit * quantity).toFixed(2));
}

/**
 * Calculates Risk-to-Reward ratio (e.g. 1 : X -> returns X).
 */
export function calculateRR(risk: number, reward: number): number {
  if (risk <= 0 || reward <= 0) return 0;
  return Number((reward / risk).toFixed(2));
}

/**
 * Calculates standard suggested position size based on risk percentage of capital.
 */
export function calculatePositionSize(
  capital: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number
): {
  positionSize: number;
  maxRiskAmount: number;
  riskPerUnit: number;
  capitalRequired: number;
  capitalUtilizationPercent: number;
} {
  if (capital <= 0 || riskPercent <= 0 || entryPrice <= 0 || stopLoss <= 0) {
    return {
      positionSize: 0,
      maxRiskAmount: 0,
      riskPerUnit: 0,
      capitalRequired: 0,
      capitalUtilizationPercent: 0,
    };
  }

  const maxRiskAmount = Number((capital * (riskPercent / 100)).toFixed(2));
  const riskPerUnit = Number(Math.abs(entryPrice - stopLoss).toFixed(2));

  if (riskPerUnit <= 0) {
    return {
      positionSize: 0,
      maxRiskAmount,
      riskPerUnit: 0,
      capitalRequired: 0,
      capitalUtilizationPercent: 0,
    };
  }

  const positionSize = Math.floor(maxRiskAmount / riskPerUnit);
  const capitalRequired = Number((positionSize * entryPrice).toFixed(2));
  const capitalUtilizationPercent = capital > 0 ? Number(((capitalRequired / capital) * 100).toFixed(2)) : 0;

  return {
    positionSize,
    maxRiskAmount,
    riskPerUnit,
    capitalRequired,
    capitalUtilizationPercent,
  };
}

/**
 * Calculates Win Rate percentage (0 - 100).
 */
export function calculateWinRate(winningTrades: number, totalTrades: number): number {
  if (totalTrades <= 0) return 0;
  return Number(((winningTrades / totalTrades) * 100).toFixed(1));
}

/**
 * Calculates Profit Factor (Gross Profit / Gross Loss).
 */
export function calculateProfitFactor(trades: Trade[]): number {
  let grossProfit = 0;
  let grossLoss = 0;

  for (const trade of trades) {
    const pnl = trade.netPnL ?? trade.grossPnL;
    if (pnl > 0) {
      grossProfit += pnl;
    } else if (pnl < 0) {
      grossLoss += Math.abs(pnl);
    }
  }

  if (grossLoss === 0) {
    return grossProfit > 0 ? 99.99 : 0;
  }

  return Number((grossProfit / grossLoss).toFixed(2));
}

/**
 * Calculates Trading Expectancy:
 * (Win Rate × Average Win) - (Loss Rate × Average Loss)
 */
export function calculateExpectancy(
  winRatePercent: number,
  averageWin: number,
  averageLoss: number
): number {
  const winRate = winRatePercent / 100;
  const lossRate = 1 - winRate;
  const expectancy = (winRate * averageWin) - (lossRate * averageLoss);
  return Number(expectancy.toFixed(2));
}

/**
 * Calculates Maximum Peak-to-Trough Drawdown from equity curve or trades.
 */
export function calculateMaxDrawdown(
  startingCapital: number,
  trades: Trade[]
): {
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
} {
  if (trades.length === 0) {
    return { maxDrawdownAmount: 0, maxDrawdownPercent: 0 };
  }

  // Sort trades by date & time ascending
  const sorted = [...trades].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });

  let runningEquity = startingCapital;
  let peak = startingCapital;
  let maxDrawdownAmount = 0;
  let maxDrawdownPercent = 0;

  for (const trade of sorted) {
    runningEquity += (trade.netPnL ?? trade.grossPnL);
    if (runningEquity > peak) {
      peak = runningEquity;
    }

    const currentDrawdownAmount = peak - runningEquity;
    if (currentDrawdownAmount > maxDrawdownAmount) {
      maxDrawdownAmount = currentDrawdownAmount;
      const currentDrawdownPercent = peak > 0 ? (currentDrawdownAmount / peak) * 100 : 0;
      if (currentDrawdownPercent > maxDrawdownPercent) {
        maxDrawdownPercent = currentDrawdownPercent;
      }
    }
  }

  return {
    maxDrawdownAmount: Number(maxDrawdownAmount.toFixed(2)),
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(2)),
  };
}

/**
 * Generates continuous Equity Curve data points.
 */
export function calculateEquityCurve(
  startingCapital: number,
  trades: Trade[]
): EquityCurvePoint[] {
  if (trades.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    return [{
      date: today,
      equity: startingCapital,
      pnl: 0,
      cumulativePnL: 0,
      drawdown: 0,
      drawdownPercent: 0,
      tradeCount: 0,
    }];
  }

  const sorted = [...trades].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });

  let runningEquity = startingCapital;
  let cumulativePnL = 0;
  let peak = startingCapital;
  let tradeIndex = 0;

  const points: EquityCurvePoint[] = [];

  for (const trade of sorted) {
    tradeIndex++;
    const pnl = trade.netPnL ?? trade.grossPnL;
    runningEquity += pnl;
    cumulativePnL += pnl;

    if (runningEquity > peak) {
      peak = runningEquity;
    }

    const drawdown = peak - runningEquity;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

    points.push({
      date: trade.date,
      equity: Number(runningEquity.toFixed(2)),
      pnl: Number(pnl.toFixed(2)),
      cumulativePnL: Number(cumulativePnL.toFixed(2)),
      drawdown: Number(drawdown.toFixed(2)),
      drawdownPercent: Number(drawdownPercent.toFixed(2)),
      tradeCount: tradeIndex,
    });
  }

  return points;
}

/**
 * Computes all high-level performance metrics for a collection of trades.
 */
export function calculatePerformanceMetrics(
  startingCapital: number,
  trades: Trade[]
): PerformanceMetrics {
  const totalTrades = trades.length;

  if (totalTrades === 0) {
    return {
      startingCapital,
      currentCapital: startingCapital,
      totalGrossPnL: 0,
      totalNetPnL: 0,
      totalReturnPercent: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      averageRR: 0,
      maxDrawdownAmount: 0,
      maxDrawdownPercent: 0,
      expectancy: 0,
      winLossRatio: 0,
      largestWin: 0,
      largestLoss: 0,
      avgHoldingDurationMinutes: 0,
    };
  }

  let totalGrossPnL = 0;
  let totalNetPnL = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakEvenTrades = 0;
  let sumWins = 0;
  let sumLosses = 0;
  let sumRR = 0;
  let rrCount = 0;
  let largestWin = 0;
  let largestLoss = 0;
  let sumDuration = 0;
  let durationCount = 0;

  for (const trade of trades) {
    const gross = trade.grossPnL;
    const net = trade.netPnL ?? gross;

    totalGrossPnL += gross;
    totalNetPnL += net;

    if (net > 0) {
      winningTrades++;
      sumWins += net;
      if (net > largestWin) largestWin = net;
    } else if (net < 0) {
      losingTrades++;
      sumLosses += Math.abs(net);
      if (Math.abs(net) > largestLoss) largestLoss = Math.abs(net);
    } else {
      breakEvenTrades++;
    }

    if (trade.rrRatio && trade.rrRatio > 0) {
      sumRR += trade.rrRatio;
      rrCount++;
    }

    if (trade.holdingDurationMinutes && trade.holdingDurationMinutes > 0) {
      sumDuration += trade.holdingDurationMinutes;
      durationCount++;
    }
  }

  const currentCapital = Number((startingCapital + totalNetPnL).toFixed(2));
  const totalReturnPercent = startingCapital > 0
    ? Number(((totalNetPnL / startingCapital) * 100).toFixed(2))
    : 0;

  const winRate = calculateWinRate(winningTrades, totalTrades);
  const averageWin = winningTrades > 0 ? Number((sumWins / winningTrades).toFixed(2)) : 0;
  const averageLoss = losingTrades > 0 ? Number((sumLosses / losingTrades).toFixed(2)) : 0;
  const profitFactor = calculateProfitFactor(trades);
  const averageRR = rrCount > 0 ? Number((sumRR / rrCount).toFixed(2)) : 0;
  const expectancy = calculateExpectancy(winRate, averageWin, averageLoss);
  const winLossRatio = averageLoss > 0 ? Number((averageWin / averageLoss).toFixed(2)) : averageWin > 0 ? 99 : 0;
  const avgHoldingDurationMinutes = durationCount > 0 ? Math.round(sumDuration / durationCount) : 0;

  const { maxDrawdownAmount, maxDrawdownPercent } = calculateMaxDrawdown(startingCapital, trades);

  return {
    startingCapital,
    currentCapital,
    totalGrossPnL: Number(totalGrossPnL.toFixed(2)),
    totalNetPnL: Number(totalNetPnL.toFixed(2)),
    totalReturnPercent,
    totalTrades,
    winningTrades,
    losingTrades,
    breakEvenTrades,
    winRate,
    averageWin,
    averageLoss,
    profitFactor,
    averageRR,
    maxDrawdownAmount,
    maxDrawdownPercent,
    expectancy,
    winLossRatio,
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
    avgHoldingDurationMinutes,
  };
}
