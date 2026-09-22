-- ============================================================================
-- MonsterASP PostgreSQL Schema for Romantic Bouquet Visit Analytics
-- Host: db69616.public.databaseasp.net
-- Database: db69616
-- ============================================================================

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id VARCHAR(36) PRIMARY KEY,
  visit_id VARCHAR(100) NOT NULL,
  visited_at_utc TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  path VARCHAR(500) NOT NULL DEFAULT '/',
  referrer TEXT DEFAULT 'Direct',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for performant querying by date (newest first)
CREATE INDEX IF NOT EXISTS idx_visits_visited_at_utc ON visits (visited_at_utc DESC);

-- Index for session deduplication and visitor analysis
CREATE INDEX IF NOT EXISTS idx_visits_visit_id ON visits (visit_id);
