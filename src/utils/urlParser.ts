import { AssetClass } from '../types';

export interface ParsedChartUrl {
  isValid: boolean;
  rawUrl: string;
  provider: 'TradingView' | 'Binance' | 'YahooFinance' | 'GenericChart' | 'Unknown';
  exchange?: string;
  symbol?: string;
  assetClass?: AssetClass;
  normalizedInstrument?: string;
  isSnapshot?: boolean;
  snapshotUrl?: string;
  message: string;
  requiresFallback: boolean;
}

const KNOWN_INSTRUMENTS: Record<string, { assetClass: AssetClass; canonical: string }> = {
  NIFTY: { assetClass: 'Indian Indices', canonical: 'NIFTY 50' },
  NIFTY50: { assetClass: 'Indian Indices', canonical: 'NIFTY 50' },
  BANKNIFTY: { assetClass: 'Indian Indices', canonical: 'BANKNIFTY' },
  FINNIFTY: { assetClass: 'Indian Indices', canonical: 'FINNIFTY' },
  SENSEX: { assetClass: 'Indian Indices', canonical: 'SENSEX' },
  RELIANCE: { assetClass: 'Indian Equities', canonical: 'RELIANCE' },
  TCS: { assetClass: 'Indian Equities', canonical: 'TCS' },
  HDFCBANK: { assetClass: 'Indian Equities', canonical: 'HDFCBANK' },
  INFY: { assetClass: 'Indian Equities', canonical: 'INFY' },
  ICICIBANK: { assetClass: 'Indian Equities', canonical: 'ICICIBANK' },
  TATAMOTORS: { assetClass: 'Indian Equities', canonical: 'TATAMOTORS' },
  GOLD: { assetClass: 'Commodities', canonical: 'GOLD' },
  SILVER: { assetClass: 'Commodities', canonical: 'SILVER' },
  CRUDEOIL: { assetClass: 'Commodities', canonical: 'CRUDE OIL' },
  NATURALGAS: { assetClass: 'Commodities', canonical: 'NATURAL GAS' },
  BTCUSDT: { assetClass: 'Crypto', canonical: 'BTCUSDT' },
  ETHUSDT: { assetClass: 'Crypto', canonical: 'ETHUSDT' },
  SOLUSDT: { assetClass: 'Crypto', canonical: 'SOLUSDT' },
  BNBUSDT: { assetClass: 'Crypto', canonical: 'BNBUSDT' },
  ALICEUSDT: { assetClass: 'Crypto', canonical: 'ALICEUSDT' },
  BTC: { assetClass: 'Crypto', canonical: 'BTCUSDT' },
  ETH: { assetClass: 'Crypto', canonical: 'ETHUSDT' },
  ALICE: { assetClass: 'Crypto', canonical: 'ALICEUSDT' },
  MAGMAUSDT: { assetClass: 'Crypto', canonical: 'MAGMAUSDT' },
  MAGMA: { assetClass: 'Crypto', canonical: 'MAGMAUSDT' },
  GTCUSDT: { assetClass: 'Crypto', canonical: 'GTCUSDT' },
  GTC: { assetClass: 'Crypto', canonical: 'GTCUSDT' },
};

/**
 * Parses a TradingView, Binance, or financial chart URL safely.
 */
export function parseChartUrl(urlStr: string): ParsedChartUrl {
  const decoded = decodeURIComponent(urlStr.trim());
  if (!decoded) {
    return {
      isValid: false,
      rawUrl: decoded,
      provider: 'Unknown',
      message: 'Please enter a valid chart URL.',
      requiresFallback: true,
    };
  }

  try {
    const url = new URL(decoded.startsWith('http') ? decoded : `https://${decoded}`);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname;

    // 1. Image Snapshot Direct Link (e.g. .png, .jpg, .webp)
    if (/\.(png|jpg|jpeg|webp)$/i.test(pathname) || host.includes('snapshots') || host.includes('imgur')) {
      return {
        isValid: true,
        rawUrl: decoded,
        provider: 'GenericChart',
        isSnapshot: true,
        snapshotUrl: decoded,
        message: 'Direct chart snapshot image detected. Analyzing visual price action...',
        requiresFallback: false,
      };
    }

    // 2. TradingView URLs
    if (host.includes('tradingview.com')) {
      // Pattern 2a: Snapshot link (/x/ID/)
      if (pathname.includes('/x/')) {
        const match = pathname.match(/\/x\/([A-Za-z0-9]+)/);
        const snapshotId = match ? match[1] : '';
        const snapshotUrl = snapshotId
          ? `https://s3.tradingview.com/snapshots/${snapshotId[0].toLowerCase()}/${snapshotId}.png`
          : decoded;

        // Check if query parameter has symbol
        let detectedSymbol = url.searchParams.get('symbol') || '';
        if (detectedSymbol.includes(':')) {
          detectedSymbol = detectedSymbol.split(':')[1];
        }
        // Check if path has symbol slug after dash: e.g. /x/ID-MAGMAUSDT/
        if (!detectedSymbol && pathname.includes('-')) {
          const parts = pathname.split('-');
          if (parts.length > 1) {
            detectedSymbol = parts[parts.length - 1].replace(/[^A-Z0-9]/gi, '');
          }
        }
        if (detectedSymbol) {
          detectedSymbol = detectedSymbol.replace(/\.P$/i, '').replace(/PERP$/i, '').toUpperCase();
        }

        return {
          isValid: true,
          rawUrl: decoded,
          provider: 'TradingView',
          isSnapshot: true,
          snapshotUrl,
          symbol: detectedSymbol || undefined,
          normalizedInstrument: detectedSymbol || undefined,
          message: detectedSymbol
            ? `TradingView Snapshot detected for ${detectedSymbol}. Running setup analysis...`
            : 'TradingView Snapshot image loaded! Confirm or select the instrument below to analyze.',
          requiresFallback: !detectedSymbol,
        };
      }

      let symbol = '';
      let exchange = '';

      // Pattern 2b: ?symbol=NSE:NIFTY or ?symbol=BINANCE:ALICEUSDT or ?symbol=ALICEUSDT
      const symbolParam = url.searchParams.get('symbol');
      if (symbolParam) {
        if (symbolParam.includes(':')) {
          const [ex, sym] = symbolParam.split(':');
          exchange = ex.toUpperCase();
          symbol = sym.toUpperCase();
        } else {
          symbol = symbolParam.toUpperCase();
        }
      }

      // Pattern 2c: /symbols/BTCUSDT/ or /symbols/BINANCE-ALICEUSDT/ or /symbols/NSE-NIFTY/
      if (!symbol && pathname.includes('/symbols/')) {
        const match = pathname.match(/\/symbols\/([^/]+)/);
        if (match && match[1]) {
          const token = match[1].toUpperCase();
          if (token.includes('-')) {
            const [ex, sym] = token.split('-');
            exchange = ex;
            symbol = sym;
          } else if (token.includes(':')) {
            const [ex, sym] = token.split(':');
            exchange = ex;
            symbol = sym;
          } else {
            symbol = token;
          }
        }
      }

      // Pattern 2d: /chart/ID/?symbol=...
      if (!symbol && pathname.includes('/chart/')) {
        const querySymbol = url.searchParams.get('symbol');
        if (querySymbol) {
          symbol = querySymbol.replace(/^[A-Z0-9]+:/i, '').toUpperCase();
        } else {
          // Check if symbol is in slug: /chart/ID-ALICEUSDT-breakout/
          const slugMatch = pathname.match(/\/chart\/[^/]+-([A-Z0-9]+)/i);
          if (slugMatch && slugMatch[1]) {
            symbol = slugMatch[1].toUpperCase();
          }
        }
      }

      if (symbol) {
        // Strip derivative suffixes .P and PERP before stripping non-alphanumeric chars
        symbol = symbol.replace(/\.P$/i, '').replace(/PERP$/i, '');
        const cleanSymbol = symbol.replace(/[^A-Z0-9]/g, '');
        const matched = KNOWN_INSTRUMENTS[cleanSymbol];
        const isCrypto =
          cleanSymbol.endsWith('USDT') ||
          cleanSymbol.endsWith('USD') ||
          cleanSymbol.endsWith('BTC') ||
          matched?.assetClass === 'Crypto';

        const assetClass: AssetClass = matched?.assetClass || (isCrypto ? 'Crypto' : 'Indian Equities');
        const canonical = matched?.canonical || cleanSymbol;

        return {
          isValid: true,
          rawUrl: decoded,
          provider: 'TradingView',
          exchange: exchange || (isCrypto ? 'BINANCE' : 'NSE'),
          symbol: cleanSymbol,
          assetClass,
          normalizedInstrument: canonical,
          message: `Identified ${canonical} from TradingView URL. Loading real-time market analysis...`,
          requiresFallback: false,
        };
      }

      return {
        isValid: true,
        rawUrl: decoded,
        provider: 'TradingView',
        message: 'TradingView chart link recognized. Please confirm the instrument below to run analysis.',
        requiresFallback: true,
      };
    }

    // 3. Binance URLs (e.g. binance.com/en/trade/ALICE_USDT)
    if (host.includes('binance.com')) {
      const tradeMatch = pathname.match(/\/trade\/([A-Za-z0-9_]+)/i) || pathname.match(/\/futures\/([A-Za-z0-9_]+)/i);
      if (tradeMatch && tradeMatch[1]) {
        const rawPair = tradeMatch[1].replace(/_/g, '').toUpperCase();
        return {
          isValid: true,
          rawUrl: decoded,
          provider: 'Binance',
          exchange: 'BINANCE',
          symbol: rawPair,
          assetClass: 'Crypto',
          normalizedInstrument: rawPair,
          message: `Identified Binance Spot pair ${rawPair}. Connecting to live 24/7 public orderflow feed...`,
          requiresFallback: false,
        };
      }
    }

    // 4. Yahoo Finance URLs (e.g. finance.yahoo.com/quote/^NSEI or ALICE-USD)
    if (host.includes('yahoo.com')) {
      const match = pathname.match(/\/quote\/([^/?#]+)/i);
      if (match && match[1]) {
        const sym = match[1].replace(/^[^\w]/, '').replace(/\.NS$/i, '').replace(/-USD$/i, 'USDT').toUpperCase();
        const matched = KNOWN_INSTRUMENTS[sym];
        return {
          isValid: true,
          rawUrl: decoded,
          provider: 'YahooFinance',
          symbol: sym,
          assetClass: matched?.assetClass || 'Indian Equities',
          normalizedInstrument: matched?.canonical || sym,
          message: `Identified ${sym} from Yahoo Finance. Loading market data...`,
          requiresFallback: false,
        };
      }
    }

    // 5. Generic fallback
    return {
      isValid: false,
      rawUrl: decoded,
      provider: 'GenericChart',
      message: 'Chart link recognized, but symbol could not be identified automatically. Enter the instrument below to analyze.',
      requiresFallback: true,
    };
  } catch {
    return {
      isValid: false,
      rawUrl: decoded,
      provider: 'Unknown',
      message: "We couldn't identify a supported instrument from this URL. Please enter the symbol directly.",
      requiresFallback: true,
    };
  }
}

/**
 * Asynchronously fetches metadata for a TradingView snapshot link (e.g. /x/ID/).
 * Extracts the exact instrument ticker and snapshot image.
 */
export async function fetchTradingViewSnapshotInfo(
  urlStr: string
): Promise<{ symbol?: string; imageUrl?: string; title?: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const encoded = encodeURIComponent(urlStr.trim());
    const res = await fetch(`https://api.microlink.io/?url=${encoded}&filter=title,image`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 'success' || !json.data) return null;

    const title: string = json.data.title || '';
    const imageUrl: string = json.data.image?.url || '';

    let symbol: string | undefined;
    if (title) {
      // Examples:
      // "BINANCE:MAGMAUSDT.P Chart Image by rohitwad2023"
      // "BINANCE:MAGMAUSDT Chart Image"
      // "NSE:NIFTY Chart Image"
      const match = title.match(/(?:([A-Z0-9]+):)?([A-Z0-9_]+?)(?:\.[A-Z0-9]+)?(?:\s+PERP)?\s+Chart Image/i)
        || title.match(/([A-Z0-9_]{3,12})/i);
      if (match) {
        const found = match[2] || match[1];
        if (found) {
          symbol = found.replace(/\.P$/i, '').replace(/PERP$/i, '').toUpperCase();
        }
      }
    }

    return {
      symbol,
      imageUrl,
      title,
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

