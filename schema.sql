-- ==============================================================================
-- TRADEROS PRODUCTION DATABASE SCHEMA
-- PostgreSQL / Supabase compatible
-- Row Level Security (RLS) enabled with multi-tenant user isolation
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    is_onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    starting_capital NUMERIC(15, 2) DEFAULT 100000.00 NOT NULL,
    default_risk_percent NUMERIC(5, 2) DEFAULT 1.00 NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata' NOT NULL,
    trading_style VARCHAR(50) DEFAULT 'Intraday' NOT NULL,
    preferred_markets TEXT[] DEFAULT ARRAY['Indian Indices', 'Indian Equities'],
    enable_ai_insights BOOLEAN DEFAULT TRUE NOT NULL,
    theme VARCHAR(20) DEFAULT 'dark' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. STRATEGIES TABLE
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for global system strategies
    name VARCHAR(100) NOT NULL,
    description TEXT,
    timeframe VARCHAR(20),
    is_system BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. INSTRUMENTS REGISTRY TABLE
CREATE TABLE IF NOT EXISTS instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    asset_class VARCHAR(50) NOT NULL, -- Indian Indices, Indian Equities, Commodities, Crypto, F&O
    exchange VARCHAR(50) NOT NULL,    -- NSE, BSE, MCX, BINANCE
    tick_size NUMERIC(10, 4) DEFAULT 0.05 NOT NULL,
    lot_size INT DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. TRADES TABLE
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instrument VARCHAR(50) NOT NULL,
    asset_class VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
    entry_price NUMERIC(15, 4) NOT NULL CHECK (entry_price > 0),
    exit_price NUMERIC(15, 4) NOT NULL CHECK (exit_price > 0),
    quantity NUMERIC(15, 4) NOT NULL CHECK (quantity > 0),
    capital_used NUMERIC(15, 2) NOT NULL CHECK (capital_used >= 0),
    stop_loss NUMERIC(15, 4),
    target_price NUMERIC(15, 4),
    strategy VARCHAR(100) NOT NULL,
    timeframe VARCHAR(20),
    date DATE NOT NULL,
    entry_time TIME,
    holding_duration_minutes INT,
    emotional_state VARCHAR(50) CHECK (emotional_state IN ('Calm', 'Confident', 'Fearful', 'Greedy', 'FOMO', 'Revenge', 'Impulsive', 'Disciplined')),
    entry_reason TEXT,
    exit_reason TEXT,
    notes TEXT,
    screenshot_url TEXT,
    trade_plan_id UUID,
    
    -- Calculated Metrics
    gross_pnl NUMERIC(15, 2) NOT NULL,
    net_pnl NUMERIC(15, 2) NOT NULL,
    pnl_percentage NUMERIC(8, 2) NOT NULL,
    risk_amount NUMERIC(15, 2),
    reward_amount NUMERIC(15, 2),
    rr_ratio NUMERIC(6, 2),
    is_win BOOLEAN NOT NULL,
    is_break_even BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. TRADE CHARGES TABLE
CREATE TABLE IF NOT EXISTS trade_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID UNIQUE NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    brokerage NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    stt NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    exchange_charges NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    gst NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    sebi_charges NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    other_charges NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total_charges NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. TRADE PLANS (Planned vs Actual Engine)
CREATE TABLE IF NOT EXISTS trade_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instrument VARCHAR(50) NOT NULL,
    asset_class VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
    entry_zone_min NUMERIC(15, 4) NOT NULL,
    entry_zone_max NUMERIC(15, 4) NOT NULL,
    stop_loss NUMERIC(15, 4) NOT NULL,
    target NUMERIC(15, 4) NOT NULL,
    rr_ratio NUMERIC(6, 2) NOT NULL,
    suggested_position_size NUMERIC(15, 4),
    timeframe VARCHAR(20),
    reason TEXT NOT NULL,
    screenshot_url TEXT,
    status VARCHAR(20) DEFAULT 'PLANNED' NOT NULL CHECK (status IN ('PLANNED', 'EXECUTED', 'SKIPPED', 'INVALIDATED', 'EXPIRED')),
    execution_trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. TRADE SCREENSHOTS
CREATE TABLE IF NOT EXISTS trade_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    trade_plan_id UUID REFERENCES trade_plans(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    caption TEXT,
    timeframe VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. MARKET DATA SOURCES
CREATE TABLE IF NOT EXISTS market_data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- NSE_FEED, BINANCE_API, YAHOO_FINANCE
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    latency_category VARCHAR(20) DEFAULT 'DELAYED' NOT NULL CHECK (latency_category IN ('REAL_TIME', 'DELAYED', 'EOD')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. ANALYSIS SESSIONS
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instrument VARCHAR(50) NOT NULL,
    asset_class VARCHAR(50) NOT NULL,
    input_method VARCHAR(20) NOT NULL CHECK (input_method IN ('SCREENSHOT', 'INSTRUMENT', 'URL')),
    bias VARCHAR(20) NOT NULL,
    setup_status VARCHAR(30) NOT NULL,
    risk_reward NUMERIC(6, 2),
    raw_response JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. AI INSIGHTS CACHE & REPORTS
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('COACH_DAILY', 'WEEKLY_REVIEW', 'TRADER_INTELLIGENCE')),
    confidence VARCHAR(30) NOT NULL,
    report_payload JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. JOURNAL TAGS
CREATE TABLE IF NOT EXISTS journal_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. DAILY PERFORMANCE AGGREGATES
CREATE TABLE IF NOT EXISTS daily_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_trades INT DEFAULT 0 NOT NULL,
    winning_trades INT DEFAULT 0 NOT NULL,
    losing_trades INT DEFAULT 0 NOT NULL,
    gross_pnl NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    net_pnl NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    ending_equity NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (user_id, date)
);

-- 15. BROKER CONNECTIONS (Architecture Ready for Phase 2)
CREATE TABLE IF NOT EXISTS broker_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    broker_name VARCHAR(50) NOT NULL, -- ZERODHA, UPSTOX, ANGEL_ONE, DHAN, BINANCE
    account_id VARCHAR(100),
    is_connected BOOLEAN DEFAULT FALSE NOT NULL,
    token_expiry TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON trades(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_instrument ON trades(user_id, instrument);
CREATE INDEX IF NOT EXISTS idx_trades_strategy ON trades(user_id, strategy);
CREATE INDEX IF NOT EXISTS idx_trades_pnl ON trades(user_id, net_pnl);
CREATE INDEX IF NOT EXISTS idx_trade_plans_user_status ON trade_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_performance_user_date ON daily_performance(user_id, date ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR TOTAL USER DATA ISOLATION
-- ==============================================================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Sample policy template for Supabase Auth
-- CREATE POLICY "Users can only read their own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can only insert their own trades" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can only update their own trades" ON trades FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can only delete their own trades" ON trades FOR DELETE USING (auth.uid() = user_id);
