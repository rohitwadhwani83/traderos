import React, { useState, useEffect } from 'react';
import { marketDataProvider, INSTRUMENT_REGISTRY } from '../../services/marketData/provider';
import { generateMarketAnalysis } from '../../services/ai/marketAnalysis';
import { analyzeChartScreenshot } from '../../services/ai/screenshotAnalysis';
import { parseChartUrl } from '../../utils/urlParser';
import { MarketAnalysis } from '../../types';
import { MultiTimeframeGrid } from './MultiTimeframeGrid';
import { AnalysisResultCard } from './AnalysisResultCard';
import { RiskCalculator } from './RiskCalculator';
import { TradePlansList } from './TradePlansList';
import {
  Upload,
  Search,
  Link as LinkIcon,
  Sparkles,
  LineChart,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';

type InputMethod = 'instrument' | 'screenshot' | 'url';

export const AnalyseView: React.FC = () => {
  const [method, setMethod] = useState<InputMethod>('instrument');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('NIFTY');
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlMessage, setUrlMessage] = useState<string | null>(null);

  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotInstrument, setScreenshotInstrument] = useState<string>('NIFTY');

  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [mtfData, setMtfData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analysis for selected instrument
  const runInstrumentAnalysis = async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    setUrlMessage(null);
    try {
      const quote = await marketDataProvider.getQuote(symbol);
      const technicals = await marketDataProvider.getTechnicalData(symbol);
      const mtf = await marketDataProvider.getMultiTimeframeData(symbol);

      const generated = generateMarketAnalysis({
        quote,
        technicals,
        mtf,
      });

      setMtfData(mtf);
      setAnalysis(generated);
    } catch (err: any) {
      setError('Market data temporarily unavailable. You can still analyze an uploaded chart.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (method === 'instrument') {
      runInstrumentAnalysis(selectedInstrument);
    }
  }, [selectedInstrument]);

  // Handle URL Parse
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const parsed = parseChartUrl(urlInput);
    setUrlMessage(parsed.message);

    if (parsed.normalizedInstrument && !parsed.requiresFallback) {
      setSelectedInstrument(parsed.normalizedInstrument);
      await runInstrumentAnalysis(parsed.normalizedInstrument);
    }
  };

  // Handle Screenshot Upload
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setScreenshotData(dataUrl);
      setIsLoading(true);
      setError(null);
      try {
        const generated = await analyzeChartScreenshot({
          imageFileOrDataUrl: dataUrl,
          userSpecifiedInstrument: screenshotInstrument,
        });
        setAnalysis(generated);
        const mtf = await marketDataProvider.getMultiTimeframeData(screenshotInstrument);
        setMtfData(mtf);
      } catch (err: any) {
        setError('We could not reliably read this chart. Please check image clarity.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Market Intelligence & Setup Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Objective multi-timeframe risk/reward assessment • Zero hallucinated prices
        </p>
      </div>

      {/* Input Method Selector (Screenshot, Instrument, URL) */}
      <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">
          What do you want to analyse?
        </h3>

        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMethod('instrument')}
            className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              method === 'instrument'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Enter Instrument</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('screenshot')}
            className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              method === 'screenshot'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Screenshot</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('url')}
            className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              method === 'url'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Paste Chart URL</span>
          </button>
        </div>

        {/* METHOD B: Instrument Picker */}
        {method === 'instrument' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Popular:</span>
              {['NIFTY', 'BANKNIFTY', 'SENSEX', 'RELIANCE', 'TCS', 'GOLD', 'CRUDE OIL', 'BTCUSDT', 'ETHUSDT'].map(
                (sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSelectedInstrument(sym)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      selectedInstrument === sym
                        ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                        : 'bg-[#161d2c] border-slate-700/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    {sym}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Or type symbol (e.g. HDFCBANK)..."
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value.toUpperCase())}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={() => runInstrumentAnalysis(selectedInstrument)}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                title="Refresh Analysis"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* METHOD A: Screenshot Upload */}
        {method === 'screenshot' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Instrument Hint (e.g. NIFTY, BTC)"
                value={screenshotInstrument}
                onChange={(e) => setScreenshotInstrument(e.target.value.toUpperCase())}
                className="bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white w-48 uppercase font-mono"
              />
              <span className="text-[11px] text-slate-400">
                Helps AI anchor exact price ranges
              </span>
            </div>

            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 text-center">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">
                Upload or paste TradingView / Broker chart screenshot
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                AI inspects trend structure, visible S/R, momentum, and risk/reward without hallucinating.
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer">
                <span>Select Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotUpload}
                />
              </label>
            </div>

            {screenshotData && (
              <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Uploaded Chart Preview:
                </span>
                <img
                  src={screenshotData}
                  alt="Chart Preview"
                  className="max-h-60 w-full object-contain rounded-lg bg-black"
                />
              </div>
            )}
          </div>
        )}

        {/* METHOD C: URL Paste */}
        {method === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste TradingView URL (e.g. https://www.tradingview.com/chart/?symbol=NSE:NIFTY)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
              >
                Inspect URL
              </button>
            </div>

            {urlMessage && (
              <div className="p-3 rounded-xl bg-[#0e1320] border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>{urlMessage}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center text-slate-400 rounded-2xl border border-slate-800 bg-[#101522]">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-200">
            Analyzing Market Structure & Risk Boundaries...
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Computing multi-timeframe alignment, ATR bands, and key invalidation levels.
          </p>
        </div>
      )}

      {/* Main Analysis Display */}
      {!isLoading && analysis && (
        <div className="space-y-6">
          {/* Multi-Timeframe Alignment Grid */}
          {mtfData && <MultiTimeframeGrid mtf={mtfData} />}

          {/* Standard 16-point Analysis Card */}
          <AnalysisResultCard analysis={analysis} />

          {/* Integrated Risk Calculator */}
          <RiskCalculator
            initialEntry={analysis.entryZone.min}
            initialStop={analysis.invalidation}
            initialTarget={analysis.targetZone.target1}
            initialDirection={analysis.bias === 'BEARISH' ? 'SHORT' : 'LONG'}
          />

          {/* Saved Trade Plans ("Planned vs Actual") */}
          <TradePlansList />
        </div>
      )}
    </div>
  );
};
