import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import {
  parseRawCsv,
  guessColumnMapping,
  validateAndMapCsvRows,
  CsvImportRow,
  ImportPreviewTrade,
} from '../../utils/csvParser';
import { Trade } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Upload, AlertTriangle, CheckCircle, FileText, ArrowRight } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importTrades } = useTrading();
  const { user } = useAuth();

  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [columnMap, setColumnMap] = useState<Record<keyof CsvImportRow, string>>({
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
  });

  const [previewTrades, setPreviewTrades] = useState<ImportPreviewTrade[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const { headers, rows } = parseRawCsv(text);
      if (headers.length === 0 || rows.length === 0) {
        alert('Invalid or empty CSV file.');
        return;
      }

      setCsvHeaders(headers);
      setRawRows(rows);
      const guessed = guessColumnMapping(headers);
      setColumnMap(guessed);
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const handleProceedToPreview = () => {
    if (!columnMap.date || !columnMap.instrument || !columnMap.entryPrice || !columnMap.exitPrice) {
      alert('Please map at least Date, Instrument, Entry Price, and Exit Price.');
      return;
    }

    const validated = validateAndMapCsvRows(rawRows, columnMap, user.id);
    setPreviewTrades(validated);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    const validTrades = previewTrades
      .filter((p) => p.isValid && p.parsed)
      .map((p) => p.parsed as Trade);

    if (validTrades.length === 0) {
      alert('No valid trades found to import.');
      return;
    }

    importTrades(validTrades);
    alert(`Successfully imported ${validTrades.length} trades.`);
    onClose();
    // Reset state
    setStep('upload');
    setRawRows([]);
    setCsvHeaders([]);
  };

  const validCount = previewTrades.filter((p) => p.isValid).length;
  const invalidCount = previewTrades.length - validCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Trades from CSV"
      subtitle="Universal broker & spreadsheet CSV import with column mapping"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
          <span
            className={`font-semibold ${
              step === 'upload' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            1. Upload CSV
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`font-semibold ${
              step === 'mapping' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            2. Map Columns
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`font-semibold ${
              step === 'preview' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            3. Validate & Import
          </span>
        </div>

        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-10 text-center transition-colors">
            <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-200">
              Drag and drop your trade history CSV
            </h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Works with Zerodha, Groww, Angel One, TradingView, Binance, or custom spreadsheets.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors">
              <FileText className="w-4 h-4" />
              <span>Select CSV File</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}

        {/* STEP 2: Column Mapping */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800 text-xs text-slate-300">
              Verify the matched columns from your CSV ({rawRows.length} rows detected). TraderOS
              auto-guesses common headers.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(
                [
                  ['date', 'Date (Required)'],
                  ['instrument', 'Instrument / Symbol (Required)'],
                  ['direction', 'Direction (Long/Short)'],
                  ['entryPrice', 'Entry Price (Required)'],
                  ['exitPrice', 'Exit Price (Required)'],
                  ['quantity', 'Quantity / Size'],
                  ['capitalUsed', 'Capital Used'],
                  ['stopLoss', 'Stop Loss'],
                  ['target', 'Target'],
                  ['strategy', 'Strategy'],
                  ['emotionalState', 'Emotion'],
                  ['notes', 'Notes / Comments'],
                ] as [keyof CsvImportRow, string][]
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {label}
                  </label>
                  <select
                    value={columnMap[field]}
                    onChange={(e) =>
                      setColumnMap({ ...columnMap, [field]: e.target.value })
                    }
                    className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- None / Default --</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => setStep('upload')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Upload
              </button>
              <button
                onClick={handleProceedToPreview}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Preview & Validate Data →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Validate & Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e1320] border border-slate-800 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  {validCount} Valid Trades
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    {invalidCount} Malformed Rows (will be skipped)
                  </span>
                )}
              </div>
              <span className="text-slate-400">{previewTrades.length} Total Read</span>
            </div>

            {/* Preview Table */}
            <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121826] text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Instrument</th>
                    <th className="py-2 px-3">Side</th>
                    <th className="py-2 px-3">Entry</th>
                    <th className="py-2 px-3">Exit</th>
                    <th className="py-2 px-3">Net P/L</th>
                    <th className="py-2 px-3">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {previewTrades.map((pt, i) => (
                    <tr
                      key={i}
                      className={pt.isValid ? 'hover:bg-slate-800/30' : 'bg-rose-950/20'}
                    >
                      <td className="py-2 px-3">
                        {pt.isValid ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">
                        {pt.parsed?.date || '—'}
                      </td>
                      <td className="py-2 px-3 font-semibold text-white">
                        {pt.parsed?.instrument || '—'}
                      </td>
                      <td className="py-2 px-3">{pt.parsed?.direction || '—'}</td>
                      <td className="py-2 px-3 font-mono">{pt.parsed?.entryPrice || '—'}</td>
                      <td className="py-2 px-3 font-mono">{pt.parsed?.exitPrice || '—'}</td>
                      <td
                        className={`py-2 px-3 font-mono font-semibold ${
                          (pt.parsed?.netPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pt.parsed?.netPnL !== undefined
                          ? formatCurrency(pt.parsed.netPnL, user.preferences.defaultCurrency, true)
                          : '—'}
                      </td>
                      <td className="py-2 px-3 text-rose-400 text-[11px]">
                        {pt.errors.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => setStep('mapping')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={validCount === 0}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm"
              >
                Confirm Import ({validCount} Trades)
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
