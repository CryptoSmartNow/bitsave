-- ═══════════════════════════════════════════════════════
-- USERS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    privy_did TEXT UNIQUE NOT NULL,              -- "did:privy:xxx"
    email TEXT,
    evm_wallet TEXT,                              -- 0x address
    solana_wallet TEXT,                            -- base58 address
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES users(id),
    referral_visits INT DEFAULT 0,
    total_referral_rewards NUMERIC(18,6) DEFAULT 0,
    avatar_url TEXT,
    savvy_name TEXT UNIQUE,                       -- @username
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- SAVEFI: Savings Plans + Transaction History
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS savings_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    chain TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    child_contract_address TEXT,
    plan_name TEXT NOT NULL,
    token_address TEXT,
    token_symbol TEXT NOT NULL,
    token_decimals INT DEFAULT 18,
    target_amount NUMERIC(36,18) NOT NULL,
    current_amount NUMERIC(36,18) DEFAULT 0,
    penalty_percentage INT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    maturity_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
    tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS savefi_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plan_id UUID NOT NULL REFERENCES savings_plans(id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'top_up', 'withdrawal', 'early_withdrawal', 'maturity_withdrawal')),
    amount NUMERIC(36,18) NOT NULL,
    token_symbol TEXT NOT NULL,
    token_address TEXT,
    chain TEXT NOT NULL,
    tx_hash TEXT,
    penalty_amount NUMERIC(36,18) DEFAULT 0,
    net_amount NUMERIC(36,18),
    balance_after NUMERIC(36,18),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- BIZSWAP: RWA Yield Certificates
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bizswap_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet TEXT NOT NULL,
    instrument TEXT NOT NULL CHECK (instrument IN ('BizYield', 'BizCredit', 'BizBond')),
    investment_amount NUMERIC(18,6) NOT NULL,
    fee_amount NUMERIC(18,6) DEFAULT 0,
    total_charged NUMERIC(18,6) NOT NULL,
    entitlement TEXT,
    apr TEXT,
    payout_frequency TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    next_payment TIMESTAMPTZ,
    serial_number TEXT,
    certificate_id TEXT UNIQUE NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    referred_by_code TEXT,
    purchase_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bizswap_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'buy',
    payment_method TEXT NOT NULL,
    usdc_amount NUMERIC(18,6) NOT NULL,
    fiat_amount NUMERIC(18,2),
    reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired', 'failed_underpaid')),
    metadata JSONB,
    webhook_received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bizswap_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    certificate_id UUID REFERENCES bizswap_certificates(id),
    wallet TEXT NOT NULL,
    amount NUMERIC(18,6) NOT NULL,
    currency TEXT DEFAULT 'USDC',
    tx_hash TEXT,
    payout_date TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bizswap_referral_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    pending_usdc NUMERIC(18,6) DEFAULT 0,
    total_earned_usdc NUMERIC(18,6) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bizswap_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet TEXT NOT NULL,
    amount NUMERIC(18,6) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════
-- PLATFORM: Referrals, Leaderboard, Analytics
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS referral_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    visitor_wallet TEXT,
    visitor_ip TEXT,
    user_agent TEXT,
    converted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Materialized View for Leaderboard
DROP MATERIALIZED VIEW IF EXISTS leaderboard;
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
    u.id,
    u.savvy_name,
    u.evm_wallet,
    u.solana_wallet,
    u.avatar_url,
    COALESCE(SUM(sp.current_amount), 0) AS total_saved,
    COUNT(sp.id) AS plan_count
FROM users u
LEFT JOIN savings_plans sp ON sp.user_id = u.id AND sp.status = 'active'
GROUP BY u.id
ORDER BY total_saved DESC;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    payload JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- CONTENT: Blog, Updates, Forum
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[],
    cover_image TEXT,
    author TEXT DEFAULT 'Bitsave Team',
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_read_updates (
    user_id UUID NOT NULL REFERENCES users(id),
    update_id UUID NOT NULL REFERENCES updates(id),
    read_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, update_id)
);

-- ═══════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_users_evm_wallet ON users(evm_wallet);
CREATE INDEX IF NOT EXISTS idx_users_solana_wallet ON users(solana_wallet);
CREATE INDEX IF NOT EXISTS idx_users_privy_did ON users(privy_did);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

CREATE INDEX IF NOT EXISTS idx_savings_plans_user ON savings_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_savefi_tx_user ON savefi_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_savefi_tx_plan ON savefi_transactions(plan_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bizswap_certs_wallet ON bizswap_certificates(wallet);
CREATE INDEX IF NOT EXISTS idx_bizswap_certs_user ON bizswap_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_bizswap_tx_reference ON bizswap_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_bizswap_tx_status ON bizswap_transactions(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_own_data ON users;
CREATE POLICY users_own_data ON users FOR ALL USING (id = auth.uid());

ALTER TABLE bizswap_certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS certs_own_data ON bizswap_certificates;
CREATE POLICY certs_own_data ON bizswap_certificates FOR SELECT USING (user_id = auth.uid());

ALTER TABLE savefi_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS savefi_tx_own_data ON savefi_transactions;
CREATE POLICY savefi_tx_own_data ON savefi_transactions FOR SELECT USING (user_id = auth.uid());

ALTER TABLE savings_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS plans_own_data ON savings_plans;
CREATE POLICY plans_own_data ON savings_plans FOR SELECT USING (user_id = auth.uid());
