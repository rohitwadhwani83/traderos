# TraderOS — Your Trading Intelligence Layer

> **Trade. Journal. Understand. Improve.**

TraderOS is an AI-powered personal trading intelligence platform designed specifically for retail traders across Indian Indices (NIFTY, BANKNIFTY, FINNIFTY, SENSEX), Indian Equities, Commodities (Gold, Silver, Crude Oil), and Global Crypto (BTC, ETH, SOL).

Instead of cluttering your screen like a traditional terminal with 30 overlapping indicators, TraderOS is designed with **Notion-like clarity, TradingView simplicity, and a disciplined AI copilot**. It answers two vital questions:

1. **"How am I actually trading?"** (Journaling, behavioral patterns, expectancy, and leaks)
2. **"What does the current market setup look like, and what is the risk/reward?"** (Multi-timeframe structure, mathematical risk calculator, and invalidation points)

---

## 🌟 Key Modules & Features

### 1. Dashboard ("How am I trading?")
* **Trading Performance Cards**: Prioritized metrics grid: Starting Capital → Current Capital → Total Net P/L → Win Rate → Profit Factor → Max Drawdown → Expectancy.
* **Equity Curve Chart**: Interactive SVG charting showing cumulative account growth with filters for **7D, 30D, 3M, 6M, 1Y, and ALL**.
* **Daily P/L Calendar**: Heatmap calendar showing green winning days, red losing days, and neutral trade-free sessions with monthly P/L aggregates.
* **Trading Breakdown**: Multi-dimensional breakdown charts by Instrument, Strategy, Asset Class, Long vs Short, Timeframe, and Day of Week.
* **AI Trading Coach**: Concise, data-backed summary derived directly from recorded trade history. Never fabricates insights; indicates when more data is needed.
* **Quick Actions**: Rapid shortcuts for + Add Trade, Market Analysis, Risk Calculator, and CSV Import.

### 2. Trading Journal (<30s Rapid Entry)
* **Rapid Trade Entry**: Add or edit trades in under 30 seconds.
* **Automatic Calculations**: Auto-calculates Gross P/L, Net P/L, Return %, Risk Amount, Reward Amount, Realized R:R, Capital Utilization, and Holding Duration.
* **Transaction Charges**: Deducts Brokerage, STT, Exchange charges, GST, and SEBI turnover fees.
* **Emotional State Tagging**: Categorizes psychological states (`Calm`, `Confident`, `Fearful`, `Greedy`, `FOMO`, `Revenge`, `Impulsive`, `Disciplined`).
* **Clean Journal Table**: Fast sorting (Date, P/L, Return %, Capital), multi-criteria filtering, instantaneous search, trade duplication, and CSV export.
* **Trade Detail Modal**: In-depth trade post-mortem featuring the trader's thesis, exit reason, screenshot viewer, and **AI Trade Review** with objective behavioral pattern matching.

### 3. Market Analysis & Setup Engine
* **Three Input Methods**:
  * **Method A — Screenshot**: Upload/paste chart screenshots for structural analysis of trend, S/R, and risk/reward without hallucinating unverified data.
  * **Method B — Instrument**: Live analysis for NIFTY, BANKNIFTY, SENSEX, RELIANCE, TCS, GOLD, BTCUSDT, ETHUSDT, etc.
  * **Method C — URL**: Paste TradingView or chart URLs with symbol extraction and graceful fallback.
* **Multi-Timeframe Structure**: Analyses 5M, 15M, 1H, 4H, and Daily directional alignment to classify **Setup Quality** (`Strong Alignment`, `Partial Alignment`, `Mixed`, `No Clear Setup`).
* **Standard 16-Point Analysis**: Structured output covering Instrument, Current Price, MTF Structure, Key Levels, Momentum, Volatility, Entry Zone, Invalidation, Target, R:R, Confirmation Rules, and Risk Notes.
* **Integrated Risk Calculator**: Calculates exact position size based on capital, default risk % (e.g. 1%), entry, and stop loss.
* **Trade Plans ("Planned vs Actual")**: Save analysis directly as a Trade Plan (`Planned`, `Executed`, `Skipped`, `Invalidated`) to measure execution discipline.

### 4. Trader Intelligence (Insights & Behavioral Analytics)
* **My Edge**: Highlights your highest win-rate instruments and setups.
* **My Weaknesses**: Identifies recurring mistakes (e.g. sizing up after losses, counter-trend trades).
* **My Risk Profile & Discipline Score**: Tracks capital drift and plan adherence rate.
* **Optimal Conditions**: Matrix of your top instrument + strategy + timeframe + session.
* **Biggest Leaks**: Pinpoints exact cumulative rupee losses from revenge trading, FOMO entries, and negative asset drag.
* **AI Weekly Trading Review**: Retrospective summarizing what went well, what hurt performance, biggest behavioral pattern, best setup, and the #1 improvement focus for next week.

### 5. Settings, Isolation & Privacy
* **Multi-Currency Support**: Switch between **INR (₹)**, **USD ($)**, and **USDT**.
* **Privacy & User Isolation**: Each user's data is isolated; full export to CSV or complete JSON backup.
* **Demo Mode Toggle**: Instant switch between a realistic ~50-trade demo account and private live data.

---

## 🏗️ Architecture & Tech Stack

```
traderos/
├── src/
│   ├── types/                  # Domain TypeScript interfaces
│   ├── utils/
│   │   ├── calculations.ts     # Pure financial calculation engine
│   │   ├── calculations.test.ts# Vitest unit test suite (18 tests)
│   │   ├── formatters.ts       # Currency (INR/USD), dates, and percentages
│   │   ├── urlParser.ts        # Chart URL parser with fallbacks (4 tests)
│   │   ├── csvParser.ts        # CSV parsing, mapping & validation (3 tests)
│   ├── services/
│   │   ├── storage.ts          # Storage abstraction & user isolation
│   │   ├── mockData.ts         # 50 realistic demo trades & trade plans
│   │   ├── marketData/         # MarketDataProvider abstraction layer
│   │   └── ai/                 # Dedicated structured AI service layer
│   │       ├── marketAnalysis.ts
│   │       ├── tradeReview.ts
│   │       ├── journalInsights.ts
│   │       ├── weeklyReview.ts
│   │       └── screenshotAnalysis.ts
│   ├── components/
│   │   ├── common/             # Navbar, Sidebar, MobileNav, MetricCard, Modal, Badge
│   │   ├── dashboard/          # PerformanceHeader, EquityCurve, Calendar, Breakdown, Coach
│   │   ├── journal/            # AddTradeModal, JournalTable, TradeDetailModal, CsvImport
│   │   ├── analyse/            # AnalyseView, MultiTimeframeGrid, ResultCard, RiskCalc, Plans
│   │   ├── insights/           # InsightsView, WeeklyReviewCard
│   │   ├── settings/           # SettingsView (Preferences, Privacy, Disclaimer)
│   │   └── auth/               # AuthModal, OnboardingModal
│   ├── context/
│   │   ├── AuthContext.tsx     # Session management & user isolation
│   │   └── TradingContext.tsx  # Trades state, metrics, filters, and plans
│   ├── App.tsx                 # Root layout with responsive navigation
│   └── index.css               # Dark-first modern fintech design theme
├── schema.sql                  # PostgreSQL / Supabase database schema with RLS
└── .env.example                # Environment variables template
```

---

## 🚀 Quickstart & Installation

### Prerequisites
* Node.js v18+ (tested on Node.js v24)
* npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/your-username/traderos.git
cd traderos
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Run Automated Test Suite
```bash
npm test
```
All 25 unit tests verify financial calculations, R:R ratios, drawdown formulas, expectancy, CSV auto-mapping, and chart URL parsing.

### 5. Build for Production
```bash
npm run build
```
Creates an optimized, tree-shaken static bundle in the `dist/` directory ready for deployment.

---

## 🗄️ Database Setup (PostgreSQL / Supabase)

To connect TraderOS to a production Supabase or PostgreSQL database:

1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of [`schema.sql`](./schema.sql).
4. Configure your `.env` file with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Row Level Security (RLS) is already enabled on all tables, ensuring strict multi-tenant data isolation.

---

## 🌐 Deployment Instructions

### Deploy to Vercel
1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set Framework Preset to **Vite**.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Click **Deploy**.

### Deploy to Netlify
1. Connect your GitHub repository in [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add single-page application redirect rule in `public/_redirects`:
   ```
   /*    /index.html   200
   ```

---

## 📜 Regulatory Disclaimer

*TraderOS is designed for analytical journaling and educational decision support. AI-generated market structures, support/resistance levels, and scenarios are mathematical estimations and do not constitute registered investment advice or research analyst recommendations under SEBI (Investment Advisers) Regulations, 2013 or other securities regulations. Always implement strict risk management and independent judgment.*

---

## 🛣️ Roadmap
* **Phase 2**: Broker OAuth integrations (Zerodha Kite Connect, Dhan, Upstox, Binance API), automatic order sync, and options chain analytics.
* **Phase 3**: Strategy backtesting engine, automated trade replay, and custom playbook builder.
* **Phase 4**: Anonymous verified performance leaderboards and community trade reviews.
