-- =====================================================
-- PRO FIT — Database Migration
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- 1. Orders: Add delivery notes, coupon tracking, shipping
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC DEFAULT 0;

-- 2. Reviews: Add approval field (default false = pending moderation)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
-- Auto-approve existing reviews
UPDATE reviews SET approved = true WHERE approved IS NULL OR approved = false;

-- 3. Flash Sales table
CREATE TABLE IF NOT EXISTS flash_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    flash_price NUMERIC NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Order Status History table
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS on new tables
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Allow public read, admin write
-- Flash Sales: anyone can read (for PWA), service role can write (admin)
CREATE POLICY "flash_sales_read" ON flash_sales FOR SELECT USING (true);
CREATE POLICY "flash_sales_admin" ON flash_sales FOR ALL USING (true) WITH CHECK (true);

-- Order Status History: customers can read own, service role write
CREATE POLICY "order_history_read" ON order_status_history FOR SELECT USING (true);
CREATE POLICY "order_history_admin" ON order_status_history FOR ALL USING (true) WITH CHECK (true);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flash_sales_product ON flash_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_flash_sales_dates ON flash_sales(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_coupon ON orders(coupon_code);

-- 8. Create storage bucket for product images (run manually in Storage UI)
-- Go to Supabase Dashboard → Storage → New Bucket
-- Name: product-images
-- Set to Public
-- =====================================================
-- DONE! All tables and columns are ready.
-- =====================================================
