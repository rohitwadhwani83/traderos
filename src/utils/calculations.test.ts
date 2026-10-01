import { describe, it, expect } from 'vitest';
import {
  calculateGrossPnL,
  calculateNetPnL,
  calculateRisk,
  calculateReward,
  calculateRR,
  calculatePositionSize,
  calculateWinRate,
  calculateProfitFactor,
  calculateExpectancy,
  calculateMaxDrawdown,
  calculateEquityCurve,
  calculatePerformanceMetrics,
} from './calculations';
import { Trade } from '../types';

describe('Calculation Engine Tests', () => {
  describe('calculateGrossPnL', () => {
    it('calculates LONG profit correctly', () => {
      // Entry 100, Exit 115, Qty 10 -> (115 - 100) * 10 = +150
      expect(calculateGrossPnL('LONG', 100, 115, 10)).toBe(150);
    });

    it('calculates LONG loss correctly', () => {
      // Entry 100, Exit 95, Qty 10 -> (95 - 100) * 10 = -50
      expect(calculateGrossPnL('LONG', 100, 95, 10)).toBe(-50);
    });

    it('calculates SHORT profit correctly', () => {
      // Entry 100, Exit 90, Qty 10 -> (100 - 90) * 10 = +100
      expect(calculateGrossPnL('SHORT', 100, 90, 10)).toBe(100);
    });

    it('calculates SHORT loss correctly', () => {
      // Entry 100, Exit 108, Qty 10 -> (100 - 108) * 10 = -80
      expect(calculateGrossPnL('SHORT', 100, 108, 10)).toBe(-80);
    });

    it('handles zero quantity or invalid values gracefully', () => {
      expect(calculateGrossPnL('LONG', 100, 110, 0)).toBe(0);
      expect(calculateGrossPnL('SHORT', 0, 110, 10)).toBe(0);
    });
  });

  describe('calculateNetPnL', () => {
    it('deducts total charges from gross profit', () => {
      const charges = {
        brokerage: 20,
        stt: 15,
        exchangeCharges: 5,
        gst: 3.6,
        sebiCharges: 0.5,
        otherCharges: 0,
        totalCharges: 44.1,
      };
      // Gross 500 - 44.1 = 455.9
      expect(calculateNetPnL(500, charges)).toBe(455.9);
    });

    it('returns grossPnL unchanged if no charges provided', () => {
      expect(calculateNetPnL(250)).toBe(250);
    });
  });

  describe('calculateRisk and calculateReward', () => {
    it('calculates Risk and Reward for LONG trade matching prompt specification', () => {
      // Prompt example: Entry = 100, Stop = 95, Target = 115, Qty = 1
      // Risk = 5, Reward = 15, R:R = 1:3
      const risk = calculateRisk('LONG', 100, 95, 1);
      const reward = calculateReward('LONG', 100, 115, 1);
      expect(risk).toBe(5);
      expect(reward).toBe(15);
      expect(calculateRR(risk, reward)).toBe(3);
    });

    it('calculates Risk and Reward for SHORT trade', () => {
      // Short: Entry 500, Stop 520, Target 440, Qty 2
      // Risk = 20 * 2 = 40, Reward = 60 * 2 = 120, R:R = 3
      const risk = calculateRisk('SHORT', 500, 520, 2);
      const reward = calculateReward('SHORT', 500, 440, 2);
      expect(risk).toBe(40);
      expect(reward).toBe(120);
      expect(calculateRR(risk, reward)).toBe(3);
    });
  });

  describe('calculatePositionSize', () => {
    it('calculates position size matching prompt specification', () => {
      // Prompt example: Capital = 100,000, Risk = 1%, Max Loss = 1,000,
      // Entry = 500, Stop = 490 (Risk/unit = 10) -> Position Size = 100 units
      const result = calculatePositionSize(100000, 1, 500, 490);
      expect(result.maxRiskAmount).toBe(1000);
      expect(result.riskPerUnit).toBe(10);
      expect(result.positionSize).toBe(100);
      expect(result.capitalRequired).toBe(50000);
      expect(result.capitalUtilizationPercent).toBe(50);
    });

    it('returns 0 for zero or negative risk parameters', () => {
      const result = calculatePositionSize(100000, 0, 500, 490);
      expect(result.positionSize).toBe(0);
    });
  });

  describe('calculateWinRate', () => {
    it('calculates correct percentage', () => {
      expect(calculateWinRate(6, 10)).toBe(60);
      expect(calculateWinRate(7, 12)).toBe(58.3);
      expect(calculateWinRate(0, 5)).toBe(0);
      expect(calculateWinRate(0, 0)).toBe(0);
    });
  });

  describe('calculateProfitFactor', () => {
    it('calculates gross profit / gross loss', () => {
      const mockTrades = [
        { grossPnL: 1000, netPnL: 950 } as Trade,
        { grossPnL: 500, netPnL: 450 } as Trade,
        { grossPnL: -700, netPnL: -750 } as Trade,
      ];
      // Gross win = 950 + 450 = 1400. Gross loss = 750.
      // PF = 1400 / 750 = 1.87
      expect(calculateProfitFactor(mockTrades)).toBe(1.87);
    });

    it('handles zero losses without dividing by zero', () => {
      const mockTrades = [
        { grossPnL: 1000, netPnL: 1000 } as Trade,
      ];
      expect(calculateProfitFactor(mockTrades)).toBe(99.99);
    });
  });

  describe('calculateExpectancy', () => {
    it('calculates expectancy correctly per prompt specification', () => {
      // (Win Rate × Average Win) - (Loss Rate × Average Loss)
      // Win Rate = 60% (0.6), Avg Win = 1000, Loss Rate = 40% (0.4), Avg Loss = 500
      // Expectancy = (0.6 * 1000) - (0.4 * 500) = 600 - 200 = 400
      expect(calculateExpectancy(60, 1000, 500)).toBe(400);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('computes peak-to-trough maximum drawdown correctly', () => {
      const trades: Trade[] = [
        { date: '2026-01-01', time: '10:00', grossPnL: 10000, netPnL: 10000 } as Trade, // equity 110,000 (peak)
        { date: '2026-01-02', time: '10:00', grossPnL: -5000, netPnL: -5000 } as Trade,  // equity 105,000 (DD 5k)
        { date: '2026-01-03', time: '10:00', grossPnL: -10000, netPnL: -10000 } as Trade,// equity 95,000 (DD 15k)
        { date: '2026-01-04', time: '10:00', grossPnL: 8000, netPnL: 8000 } as Trade,   // equity 103,000
      ];
      const dd = calculateMaxDrawdown(100000, trades);
      expect(dd.maxDrawdownAmount).toBe(15000);
      expect(dd.maxDrawdownPercent).toBe(13.64); // 15,000 / 110,000 = 13.636%
    });
  });

  describe('calculateEquityCurve', () => {
    it('generates chronological equity curve points', () => {
      const trades: Trade[] = [
        { date: '2026-01-01', time: '09:30', grossPnL: 2000, netPnL: 1900 } as Trade,
        { date: '2026-01-02', time: '11:00', grossPnL: -500, netPnL: -550 } as Trade,
      ];
      const curve = calculateEquityCurve(50000, trades);
      expect(curve.length).toBe(2);
      expect(curve[0].equity).toBe(51900);
      expect(curve[1].equity).toBe(51350);
      expect(curve[1].cumulativePnL).toBe(1350);
    });
  });

  describe('calculatePerformanceMetrics', () => {
    it('aggregates performance correctly', () => {
      const trades: Trade[] = [
        { date: '2026-01-01', grossPnL: 3000, netPnL: 2900, rrRatio: 2.5, holdingDurationMinutes: 60 } as Trade,
        { date: '2026-01-02', grossPnL: -1000, netPnL: -1050, rrRatio: 2.0, holdingDurationMinutes: 30 } as Trade,
      ];
      const metrics = calculatePerformanceMetrics(100000, trades);
      expect(metrics.totalTrades).toBe(2);
      expect(metrics.winningTrades).toBe(1);
      expect(metrics.losingTrades).toBe(1);
      expect(metrics.winRate).toBe(50);
      expect(metrics.totalNetPnL).toBe(1850);
      expect(metrics.currentCapital).toBe(101850);
      expect(metrics.averageWin).toBe(2900);
      expect(metrics.averageLoss).toBe(1050);
      expect(metrics.averageRR).toBe(2.25);
      expect(metrics.avgHoldingDurationMinutes).toBe(45);
    });
  });
});
