import { describe, it, expect } from 'vitest';
import { parseRawCsv, guessColumnMapping, validateAndMapCsvRows } from './csvParser';

describe('CSV Parser and Validator', () => {
  const sampleCsv = `Date,Symbol,Side,Entry,Exit,Quantity,Strategy,Emotion
2026-02-15,NIFTY,BUY,22150,22300,50,Breakout,Confident
2026-02-16,BTCUSDT,SELL,65000,64200,0.5,Pullback,Calm
invalid_row,,,abc,def,0,,
`;

  it('parses raw CSV headers and rows', () => {
    const { headers, rows } = parseRawCsv(sampleCsv);
    expect(headers).toContain('Date');
    expect(headers).toContain('Symbol');
    expect(headers).toContain('Entry');
    expect(rows.length).toBe(3);
  });

  it('correctly guesses column mappings from header names', () => {
    const { headers } = parseRawCsv(sampleCsv);
    const mapping = guessColumnMapping(headers);
    expect(mapping.date).toBe('Date');
    expect(mapping.instrument).toBe('Symbol');
    expect(mapping.direction).toBe('Side');
    expect(mapping.entryPrice).toBe('Entry');
    expect(mapping.exitPrice).toBe('Exit');
    expect(mapping.quantity).toBe('Quantity');
    expect(mapping.strategy).toBe('Strategy');
    expect(mapping.emotionalState).toBe('Emotion');
  });

  it('validates rows and flags malformed data without silently importing bad records', () => {
    const { headers, rows } = parseRawCsv(sampleCsv);
    const mapping = guessColumnMapping(headers);
    const validated = validateAndMapCsvRows(rows, mapping, 'test_user');

    expect(validated.length).toBe(3);
    // Row 1: valid
    expect(validated[0].isValid).toBe(true);
    expect(validated[0].parsed?.grossPnL).toBe((22300 - 22150) * 50); // 7500
    expect(validated[0].parsed?.direction).toBe('LONG');

    // Row 2: valid short
    expect(validated[1].isValid).toBe(true);
    expect(validated[1].parsed?.direction).toBe('SHORT');
    expect(validated[1].parsed?.grossPnL).toBe((65000 - 64200) * 0.5); // 400

    // Row 3: invalid, missing symbol, invalid prices
    expect(validated[2].isValid).toBe(false);
    expect(validated[2].errors.length).toBeGreaterThan(0);
    expect(validated[2].parsed).toBeUndefined();
  });
});
