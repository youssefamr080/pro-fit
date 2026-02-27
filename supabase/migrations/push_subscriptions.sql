-- =====================================================
-- PRO FIT — Additional Migration (V2)
-- Run this in Supabase SQL Editor AFTER supabase_migration.sql
-- =====================================================

-- 1. Push subscriptions table for Web Push Notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT UNIQUE NOT NULL,
    keys JSONB NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    subscribed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_sub_read" ON push_subscriptions FOR SELECT USING (true);
CREATE POLICY "push_sub_write" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_push_subs_customer ON push_subscriptions(customer_id);

-- =====================================================
-- DONE! Push subscriptions table is ready.
-- =====================================================
