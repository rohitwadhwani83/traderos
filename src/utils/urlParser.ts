import { AssetClass } from '../types';

export interface ParsedChartUrl {
  isValid: boolean;
  rawUrl: string;
  provider: 'TradingView' | 'YahooFinance' | 'GenericChart' | 'Unknown';
  exchange?: string;
  symbol?: string;
  assetClass?: AssetClass;
  normalizedInstrument?: string;
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
  BTC: { assetClass: 'Crypto', canonical: 'BTCUSDT' },
  ETH: { assetClass: 'Crypto', canonical: 'ETHUSDT' },
};

/**
 * Parses a TradingView or financial chart URL safely without scraping.
 */
export function parseChartUrl(urlStr: string): ParsedChartUrl {
  const trimmed = urlStr.trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawUrl: trimmed,
      provider: 'Unknown',
      message: 'Please enter a valid chart URL.',
      requiresFallback: true,
    };
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase();

    // 1. TradingView URLs
    if (host.includes('tradingview.com')) {
      let symbol = '';
      let exchange = '';

      // Pattern A: ?symbol=NSE:NIFTY or ?symbol=BINANCE:BTCUSDT
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

      // Pattern B: /symbols/BTCUSDT/ or /symbols/NSE-NIFTY/
      if (!symbol && url.pathname.includes('/symbols/')) {
        const match = url.pathname.match(/\/symbols\/([^/]+)/);
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

      // Pattern C: /chart/ID/?symbol=...
      if (!symbol && url.pathname.includes('/chart/')) {
        const querySymbol = url.searchParams.get('symbol');
        if (querySymbol) {
          symbol = querySymbol.replace(/^[A-Z0-9]+:/, '').toUpperCase();
        }
      }

      if (symbol) {
        const cleanSymbol = symbol.replace(/[^A-Z0-9]/g, '');
        const matched = KNOWN_INSTRUMENTS[cleanSymbol];

        return {
          isValid: true,
          rawUrl: trimmed,
          provider: 'TradingView',
          exchange: exchange || (matched?.assetClass === 'Crypto' ? 'BINANCE' : 'NSE'),
          symbol: cleanSymbol,
          assetClass: matched?.assetClass || 'Indian Equities',
          normalizedInstrument: matched?.canonical || cleanSymbol,
          message:
            'We identified the instrument from the TradingView URL. Loading market analysis through our data provider layer.',
          requiresFallback: false,
        };
      }

      return {
        isValid: true,
        rawUrl: trimmed,
        provider: 'TradingView',
        message:
          'TradingView URL detected, but specific symbol could not be extracted automatically. Please enter the instrument manually or upload a chart screenshot.',
        requiresFallback: true,
      };
    }

    // 2. Generic financial chart URL
    return {
      isValid: false,
      rawUrl: trimmed,
      provider: 'GenericChart',
      message:
        'We identified the chart link, but the URL does not provide direct market data. Please select the instrument directly or upload a chart screenshot.',
      requiresFallback: true,
    };
  } catch {
    return {
      isValid: false,
      rawUrl: trimmed,
      provider: 'Unknown',
      message: "We couldn't identify a supported instrument from this URL. Please enter the symbol directly.",
      requiresFallback: true,
    };
  }
}
