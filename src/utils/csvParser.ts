import Papa from 'papaparse';
import { Trade, AssetClass, TradeDirection, EmotionalState } from '../types';
import { calculateGrossPnL, calculateNetPnL, calculateRisk, calculateReward, calculateRR } from './calculations';

export interface CsvImportRow {
  date?: string;
  instrument?: string;
  assetClass?: string;
  direction?: string;
  entryPrice?: string | number;
  exitPrice?: string | number;
  quantity?: string | number;
  capitalUsed?: string | number;
  pnl?: string | number;
  stopLoss?: string | number;
  target?: string | number;
  strategy?: string;
  timeframe?: string;
  notes?: string;
  emotionalState?: string;
}

export interface ImportPreviewTrade {
  raw: Record<string, unknown>;
  parsed?: Partial<Trade>;
  errors: string[];
  isValid: boolean;
}

/**
 * Exports trade records to a clean CSV formatted string and triggers download.
 */
export function exportTradesToCsv(trades: Trade[]): string {
  const exportData = trades.map((t) => ({
    Date: t.date,
    Time: t.time || '',
    Instrument: t.instrument,
    'Asset Class': t.assetClass,
    Direction: t.direction,
    'Entry Price': t.entryPrice,
    'Exit Price': t.exitPrice,
    Quantity: t.quantity,
    'Capital Used': t.capitalUsed,
    'Gross PnL': t.grossPnL,
    'Net PnL': t.netPnL,
    'Return %': t.pnlPercentage,
    'Stop Loss': t.stopLoss || '',
    Target: t.target || '',
    'R:R': t.rrRatio ? `1:${t.rrRatio}` : '',
    Strategy: t.strategy,
    Timeframe: t.timeframe || '',
    'Emotional State': t.emotionalState || '',
    'Entry Reason': t.entryReason || '',
    'Exit Reason': t.exitReason || '',
    Notes: t.notes || '',
  }));

  const csv = Papa.unparse(exportData);
  return csv;
}

/**
 * Downloads a string as a CSV file in the browser.
 */
export function triggerCsvDownload(csvString: string, filename: string = 'traderos_journal_export.csv'): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw CSV text and normalizes column headers.
 */
export function parseRawCsv(csvText: string): {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
} {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  const headers = parsed.meta.fields || [];
  const rows = (parsed.data as Record<string, string>[]).filter((r) =>
    Object.values(r).some((v) => v && v.toString().trim().length > 0)
  );

  return {
    headers,
    rows,
    errors: parsed.errors.map((e) => `Line ${e.row}: ${e.message}`),
  };
}

/**
 * Suggests default column mappings based on common CSV headers.
 */
export function guessColumnMapping(headers: string[]): Record<keyof CsvImportRow, string> {
  const map: Record<keyof CsvImportRow, string> = {
    date: '',
    instrument: '',
    assetClass: '',
    direction: '',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    capitalUsed: '',
    pnl: '',
    stopLoss: '',
    target: '',
    strategy: '',
    timeframe: '',
    notes: '',
    emotionalState: '',
  };

  for (const h of headers) {
    const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!map.date && (lower.includes('date') || lower === 'day')) map.date = h;
    if (!map.instrument && (lower.includes('symbol') || lower.includes('instrument') || lower.includes('ticker'))) map.instrument = h;
    if (!map.assetClass && (lower.includes('asset') || lower.includes('market') || lower.includes('segment'))) map.assetClass = h;
    if (!map.direction && (lower.includes('dir') || lower.includes('type') || lower.includes('side') || lower === 'buy' || lower === 'sell')) map.direction = h;
    if (!map.entryPrice && (lower.includes('entry') || lower.includes('buyprice') || lower === 'buy')) map.entryPrice = h;
    if (!map.exitPrice && (lower.includes('exit') || lower.includes('sellprice') || lower === 'sell')) map.exitPrice = h;
    if (!map.quantity && (lower.includes('qty') || lower.includes('quantity') || lower.includes('shares') || lower.includes('size'))) map.quantity = h;
    if (!map.capitalUsed && (lower.includes('capital') || lower.includes('invested') || lower.includes('margin'))) map.capitalUsed = h;
    if (!map.pnl && (lower.includes('pnl') || lower.includes('profit') || lower.includes('gain') || lower.includes('return'))) map.pnl = h;
    if (!map.stopLoss && (lower.includes('stop') || lower === 'sl')) map.stopLoss = h;
    if (!map.target && (lower.includes('target') || lower === 'tp')) map.target = h;
    if (!map.strategy && (lower.includes('strat') || lower.includes('setup'))) map.strategy = h;
    if (!map.timeframe && (lower.includes('timeframe') || lower === 'tf')) map.timeframe = h;
    if (!map.notes && (lower.includes('note') || lower.includes('comment') || lower.includes('desc'))) map.notes = h;
    if (!map.emotionalState && (lower.includes('emotion') || lower.includes('state') || lower.includes('mood'))) map.emotionalState = h;
  }

  return map;
}

/**
 * Validates and converts mapped CSV rows into Trade items with complete error tracking.
 */
export function validateAndMapCsvRows(
  rows: Record<string, string>[],
  mapping: Record<keyof CsvImportRow, string>,
  userId: string
): ImportPreviewTrade[] {
  return rows.map((row) => {
    const errors: string[] = [];

    // Date
    const rawDate = row[mapping.date]?.trim() || '';
    let normalizedDate = rawDate;
    if (!rawDate) {
      errors.push('Date is required');
    } else {
      // Handle DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD
      if (rawDate.includes('/')) {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            normalizedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          } else {
            // Assume DD-MM-YYYY
            normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
      }
    }

    // Instrument
    const instrument = (row[mapping.instrument]?.trim() || '').toUpperCase();
    if (!instrument) errors.push('Instrument is required');

    // Direction
    const rawDirection = (row[mapping.direction]?.trim() || '').toUpperCase();
    let direction: TradeDirection = 'LONG';
    if (rawDirection.includes('SHORT') || rawDirection === 'SELL' || rawDirection === 'S') {
      direction = 'SHORT';
    } else if (rawDirection.includes('LONG') || rawDirection === 'BUY' || rawDirection === 'B') {
      direction = 'LONG';
    } else if (rawDirection) {
      errors.push(`Invalid trade direction: "${rawDirection}". Must be LONG or SHORT.`);
    }

    // Entry & Exit
    const entryPrice = parseFloat((row[mapping.entryPrice] || '').replace(/[^0-9.-]/g, ''));
    if (isNaN(entryPrice) || entryPrice <= 0) errors.push('Valid Entry Price is required');

    const exitPrice = parseFloat((row[mapping.exitPrice] || '').replace(/[^0-9.-]/g, ''));
    if (isNaN(exitPrice) || exitPrice <= 0) errors.push('Valid Exit Price is required');

    // Quantity
    let quantity = parseFloat((row[mapping.quantity] || '').replace(/[^0-9.-]/g, ''));
    if (isNaN(quantity) || quantity <= 0) {
      quantity = 1; // Default to 1 if not specified
    }

    // Capital Used
    let capitalUsed = parseFloat((row[mapping.capitalUsed] || '').replace(/[^0-9.-]/g, ''));
    if (isNaN(capitalUsed) || capitalUsed <= 0) {
      capitalUsed = Number((entryPrice * quantity).toFixed(2));
    }

    // Optional Stop & Target
    const rawStop = parseFloat((row[mapping.stopLoss] || '').replace(/[^0-9.-]/g, ''));
    const stopLoss = !isNaN(rawStop) && rawStop > 0 ? rawStop : undefined;

    const rawTarget = parseFloat((row[mapping.target] || '').replace(/[^0-9.-]/g, ''));
    const target = !isNaN(rawTarget) && rawTarget > 0 ? rawTarget : undefined;

    // Asset Class
    const rawAsset = row[mapping.assetClass]?.trim() || '';
    let assetClass: AssetClass = 'Indian Equities';
    if (instrument.includes('NIFTY') || instrument.includes('SENSEX')) {
      assetClass = 'Indian Indices';
    } else if (instrument.includes('BTC') || instrument.includes('ETH') || instrument.includes('USDT')) {
      assetClass = 'Crypto';
    } else if (instrument.includes('GOLD') || instrument.includes('SILVER') || instrument.includes('CRUDE')) {
      assetClass = 'Commodities';
    } else if (rawAsset) {
      assetClass = (rawAsset as AssetClass) || 'Indian Equities';
    }

    // Calculations
    const grossPnL = calculateGrossPnL(direction, entryPrice || 0, exitPrice || 0, quantity);
    const netPnL = grossPnL;
    const pnlPercentage = capitalUsed > 0 ? Number(((netPnL / capitalUsed) * 100).toFixed(2)) : 0;
    const risk = calculateRisk(direction, entryPrice || 0, stopLoss, quantity);
    const reward = calculateReward(direction, entryPrice || 0, target, quantity);
    const rrRatio = calculateRR(risk, reward);

    const emotionalState = (row[mapping.emotionalState]?.trim() as EmotionalState) || 'Disciplined';
    const strategy = row[mapping.strategy]?.trim() || 'Price Action';

    const trade: Partial<Trade> = {
      id: `trade_import_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      date: normalizedDate,
      instrument,
      assetClass,
      direction,
      entryPrice,
      exitPrice,
      quantity,
      capitalUsed,
      stopLoss,
      target,
      strategy,
      grossPnL,
      netPnL,
      pnlPercentage,
      riskAmount: risk > 0 ? risk : undefined,
      rewardAmount: reward > 0 ? reward : undefined,
      rrRatio: rrRatio > 0 ? rrRatio : undefined,
      isWin: netPnL > 0,
      isBreakEven: netPnL === 0,
      emotionalState,
      notes: row[mapping.notes]?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      raw: row,
      parsed: errors.length === 0 ? trade : undefined,
      errors,
      isValid: errors.length === 0,
    };
  });
}
