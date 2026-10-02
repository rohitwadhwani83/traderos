import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  Clock,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useRecentAndFavoriteInstruments } from '../../hooks/useRecentAndFavoriteInstruments';
import { QuickInstrumentChips } from './QuickInstrumentChips';

type InputMethod = 'instrument' | 'screenshot' | 'url';

export const AnalyseView: React.FC = () => {
  const [method, setMethod] = useState<InputMethod>('instrument');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('NIFTY');
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlMessage, setUrlMessage] = useState<string | null>(null);

  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotInstrument, setScreenshotInstrument] = useState<string>('ALICE USDT');
  const [screenshotTimeframe, setScreenshotTimeframe] = useState<string>('5m');

  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [mtfData, setMtfData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    recents,
    favorites,
    addRecent,
    toggleFavorite,
    isFavorite,
    removeRecent,
  } = useRecentAndFavoriteInstruments();

  // Fetch analysis for selected instrument
  const runInstrumentAnalysis = async (symbol: string) => {
    if (!symbol.trim()) return;
    const cleanSym = symbol.trim().toUpperCase();
    addRecent(cleanSym);
    setIsLoading(true);
    setError(null);
    setUrlMessage(null);
    try {
      const quote = await marketDataProvider.getQuote(cleanSym);
      const technicals = await marketDataProvider.getTechnicalData(quote.symbol);
      const mtf = await marketDataProvider.getMultiTimeframeData(quote.symbol);

      const generated = generateMarketAnalysis({
        quote,
        technicals,
        mtf,
      });

      setMtfData(mtf);
      setAnalysis(generated);

      // Smooth scroll to analysis results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(`Failed to retrieve live market data for "${symbol}". Please check the symbol or try uploading a chart screenshot.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial analysis on first mount
  useEffect(() => {
    runInstrumentAnalysis('NIFTY');
  }, []);

  const handleInstrumentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInstrument.trim()) {
      runInstrumentAnalysis(selectedInstrument.trim());
    }
  };

  const [urlFallbackPrompt, setUrlFallbackPrompt] = useState<boolean>(false);
  const [fallbackSymbol, setFallbackSymbol] = useState<string>('ALICE USDT');

  // Handle URL Parse & Auto-Analysis
  const processChartUrl = async (urlToTest: string) => {
    if (!urlToTest.trim()) return;
    setError(null);
    setUrlFallbackPrompt(false);

    const parsed = parseChartUrl(urlToTest);
    setUrlMessage(parsed.message);

    if (parsed.isSnapshot && parsed.snapshotUrl) {
      setScreenshotData(parsed.snapshotUrl);
      setMethod('screenshot');
      await triggerScreenshotAnalysis(
        parsed.snapshotUrl,
        parsed.normalizedInstrument || screenshotInstrument,
        screenshotTimeframe
      );
      return;
    }

    if (parsed.normalizedInstrument && !parsed.requiresFallback) {
      setSelectedInstrument(parsed.normalizedInstrument);
      setScreenshotInstrument(parsed.normalizedInstrument);
      await runInstrumentAnalysis(parsed.normalizedInstrument);
    } else {
      setUrlFallbackPrompt(true);
      if (parsed.symbol) {
        setFallbackSymbol(parsed.symbol);
      }
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processChartUrl(urlInput);
  };

  // Trigger Screenshot Analysis
  const triggerScreenshotAnalysis = async (imgUrl: string, sym: string, tf: string) => {
    const cleanSym = (sym.trim() || 'ALICE USDT').toUpperCase();
    addRecent(cleanSym);
    setIsLoading(true);
    setError(null);
    try {
      const generated = await analyzeChartScreenshot({
        imageFileOrDataUrl: imgUrl,
        userSpecifiedInstrument: cleanSym,
        userSpecifiedTimeframe: tf,
      });
      setAnalysis(generated);

      const quote = await marketDataProvider.getQuote(cleanSym);
      const mtf = await marketDataProvider.getMultiTimeframeData(quote.symbol);
      setMtfData(mtf);

      // Auto-scroll directly to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      setError('We could not reliably read this chart. Please ensure the screenshot is clear.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click chip selection handler
  const handleSelectChip = (sym: string) => {
    const cleanSym = sym.trim().toUpperCase();
    setSelectedInstrument(cleanSym);
    setScreenshotInstrument(cleanSym);
    addRecent(cleanSym);

    if (method === 'screenshot' && screenshotData) {
      triggerScreenshotAnalysis(screenshotData, cleanSym, screenshotTimeframe);
    } else {
      runInstrumentAnalysis(cleanSym);
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
      await triggerScreenshotAnalysis(dataUrl, screenshotInstrument, screenshotTimeframe);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Market Intelligence &amp; Setup Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Objective multi-timeframe risk/reward assessment • Real-time live feeds &amp; AI chart structure inspection
        </p>
      </div>

      {/* Input Method Selector (Screenshot, Instrument, URL) */}
      <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">
          What do you want to analyse?
        </h3>

        {/* Real-time Last 5 Used & TradingView-Style Favorites */}
        <QuickInstrumentChips
          currentSymbol={method === 'screenshot' ? screenshotInstrument : selectedInstrument}
          recents={recents}
          favorites={favorites}
          onSelect={handleSelectChip}
          onToggleFavorite={toggleFavorite}
          onRemoveRecent={removeRecent}
          isFavorite={isFavorite}
        />

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

        {/* METHOD 1: Instrument Picker & Live Search */}
        {method === 'instrument' && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Popular:</span>
              {[
                'NIFTY',
                'BANKNIFTY',
                'RELIANCE',
                'GOLD',
                'CRUDE OIL',
                'ALICE USDT',
                'BTCUSDT',
                'ETHUSDT',
                'SOLUSDT',
              ].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    setSelectedInstrument(sym);
                    setScreenshotInstrument(sym);
                    runInstrumentAnalysis(sym);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedInstrument === sym
                      ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                      : 'bg-[#161d2c] border-slate-700/80 text-slate-300 hover:text-white'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>

            <form onSubmit={handleInstrumentFormSubmit} className="flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter symbol (e.g. ALICE USDT, BTCUSDT, HDFCBANK)..."
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value.toUpperCase())}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl pl-9 pr-9 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  title={isFavorite(selectedInstrument) ? 'Remove from favourites' : 'Add to favourites'}
                  onClick={() => toggleFavorite(selectedInstrument)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorite(selectedInstrument) ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Analyse</span>
              </button>
            </form>
          </div>
        )}

        {/* METHOD 2: Screenshot Upload & AI Inspection */}
        {method === 'screenshot' && (
          <div className="space-y-4">
            {/* Instrument Hint & Timeframe Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-300 font-medium whitespace-nowrap">
                  Instrument / Pair:
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. ALICE USDT, BTCUSDT, NIFTY"
                    value={screenshotInstrument}
                    onChange={(e) => setScreenshotInstrument(e.target.value.toUpperCase())}
                    className="bg-[#161d2c] border border-slate-700/80 rounded-xl pl-3 pr-8 py-1.5 text-xs text-white uppercase font-mono w-44 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    title={isFavorite(screenshotInstrument) ? 'Remove from favourites' : 'Add to favourites'}
                    onClick={() => toggleFavorite(screenshotInstrument)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-3.5 h-3.5 ${isFavorite(screenshotInstrument) ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Timeframe:</label>
                {['5m', '15m', '1h', '4h', '1D'].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setScreenshotTimeframe(tf)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium border transition-colors ${
                      screenshotTimeframe === tf
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-[#161d2c] text-slate-400 border-slate-700/60 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Quick suggestions */}
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 ml-auto">
                <span>Quick:</span>
                {['ALICE USDT', 'BTCUSDT', 'NIFTY', 'BANKNIFTY'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setScreenshotInstrument(s);
                      if (screenshotData) {
                        triggerScreenshotAnalysis(screenshotData, s, screenshotTimeframe);
                      }
                    }}
                    className="hover:text-indigo-400 underline decoration-slate-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* When NO screenshot is uploaded yet: Show the Upload Box */}
            {!screenshotData && (
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-2xl p-7 text-center transition-all bg-[#0a0d14]/40">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">
                  Upload or paste TradingView / Broker chart screenshot
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-3.5">
                  AI reads candle orderflow, horizontal shelves, and calculates exact risk/reward.
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-all active:scale-95">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select Chart Screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotUpload}
                  />
                </label>
              </div>
            )}

            {/* When screenshot IS uploaded: Replace Upload Box with Focused Preview Card */}
            {screenshotData && (
              <div className="rounded-2xl border border-indigo-500/30 bg-[#0d121f] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white">Chart Uploaded &amp; Inspected</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                      {screenshotInstrument}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                      {screenshotTimeframe}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerScreenshotAnalysis(screenshotData, screenshotInstrument, screenshotTimeframe)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{isLoading ? 'Analysing...' : 'Re-analyse Chart'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotData(null);
                        setAnalysis(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                    >
                      Upload Different Chart
                    </button>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden bg-black/60 border border-slate-800 max-h-72 flex items-center justify-center p-2">
                  <img
                    src={screenshotData}
                    alt="Uploaded Chart Preview"
                    className="max-h-64 max-w-full object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* METHOD 3: URL Paste */}
        {method === 'url' && (
          <div className="space-y-4">
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Paste TradingView, Binance, or Chart URL (e.g. https://www.tradingview.com/chart/?symbol=BINANCE:ALICEUSDT)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Inspecting...' : 'Inspect URL'}</span>
              </button>
            </form>

            {/* Quick 1-Click Test Examples */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>Quick Test Examples:</span>
              <button
                type="button"
                onClick={() => {
                  const url = 'https://www.tradingview.com/chart/?symbol=BINANCE:ALICEUSDT';
                  setUrlInput(url);
                  processChartUrl(url);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono transition-colors"
              >
                TradingView: ALICE/USDT
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = 'https://www.tradingview.com/chart/?symbol=NSE:NIFTY';
                  setUrlInput(url);
                  processChartUrl(url);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono transition-colors"
              >
                TradingView: NIFTY 50
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = 'https://www.binance.com/en/trade/ALICE_USDT';
                  setUrlInput(url);
                  processChartUrl(url);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono transition-colors"
              >
                Binance: ALICE/USDT
              </button>
            </div>

            {urlMessage && (
              <div className="p-3 rounded-xl bg-[#0e1320] border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>{urlMessage}</span>
              </div>
            )}

            {urlFallbackPrompt && (
              <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-amber-500/30 space-y-2">
                <p className="text-xs text-amber-300 font-medium">
                  Confirm instrument symbol to complete setup analysis:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ALICE USDT, BTCUSDT, NIFTY"
                    value={fallbackSymbol}
                    onChange={(e) => setFallbackSymbol(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (fallbackSymbol.trim()) {
                        setSelectedInstrument(fallbackSymbol.trim());
                        setScreenshotInstrument(fallbackSymbol.trim());
                        runInstrumentAnalysis(fallbackSymbol.trim());
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <span>Analyse Symbol →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
            Analyzing Market Structure &amp; Risk Boundaries...
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Computing live tick depth, multi-timeframe alignment, and key invalidation levels.
          </p>
        </div>
      )}

      {/* Main Analysis Display Anchor */}
      <div ref={resultsRef} />

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
