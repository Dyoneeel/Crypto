-- LuckyLlama Coin (LLAMA) Database Schema
-- Complete SQL script to create all tables for the carnival-themed cryptocurrency gaming website

-- Sessions table (required for authentication)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Users table (main user data)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    llama_balance DECIMAL(20,8) DEFAULT '0',
    ticket_balance INTEGER DEFAULT 0,
    referral_code VARCHAR UNIQUE,
    referred_by VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Game statistics table (tracks user performance per game type)
CREATE TABLE IF NOT EXISTS game_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    game_type VARCHAR NOT NULL, -- 'spitball', 'alpaca', 'llama_drama', 'fleece_race', 'probable_llama'
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_winnings DECIMAL(20,8) DEFAULT '0',
    highest_win DECIMAL(20,8) DEFAULT '0',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily tasks table (daily challenges for users)
CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    task_type VARCHAR NOT NULL, -- 'daily_spit', 'check_in', 'social', 'invite'
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    reward DECIMAL(20,8) NOT NULL,
    date VARCHAR NOT NULL, -- YYYY-MM-DD format
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table (all financial activities)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    type VARCHAR NOT NULL, -- 'game_win', 'game_loss', 'task_reward', 'deposit', 'withdraw', 'convert'
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR NOT NULL, -- 'LLAMA' or 'TICKETS'
    description TEXT,
    game_type VARCHAR, -- for game-related transactions
    created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals table (user referral system)
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id VARCHAR NOT NULL REFERENCES users(id),
    referred_id VARCHAR NOT NULL REFERENCES users(id),
    reward DECIMAL(20,8) DEFAULT '200',
    claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Game sessions table (individual game play records)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    game_type VARCHAR NOT NULL,
    bet_amount DECIMAL(20,8) NOT NULL,
    win_amount DECIMAL(20,8) DEFAULT '0',
    result VARCHAR NOT NULL, -- 'win' or 'loss'
    game_data JSONB, -- store game-specific data
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_game_type ON game_stats(game_type);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);

-- Sample queries for common operations:

-- Get user balance and stats
-- SELECT u.id, u.email, u.llama_balance, u.ticket_balance,
--        COUNT(gs.id) as total_games, SUM(gs.win_amount) as total_winnings
-- FROM users u
-- LEFT JOIN game_sessions gs ON u.id = gs.user_id
-- WHERE u.id = 'user_id_here'
-- GROUP BY u.id, u.email, u.llama_balance, u.ticket_balance;

-- Get daily tasks for a user
-- SELECT * FROM daily_tasks 
-- WHERE user_id = 'user_id_here' AND date = '2025-01-31';

-- Get transaction history
-- SELECT * FROM transactions 
-- WHERE user_id = 'user_id_here' 
-- ORDER BY created_at DESC LIMIT 10;

-- Get leaderboard (top earners)
-- SELECT u.id, u.first_name, u.last_name, u.email,
--        SUM(CASE WHEN t.currency = 'LLAMA' THEN t.amount ELSE 0 END) as total_llama
-- FROM users u
-- LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'game_win'
-- GROUP BY u.id, u.first_name, u.last_name, u.email
-- ORDER BY total_llama DESC LIMIT 10;