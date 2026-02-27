-- =============================================
-- Dynamic Size Guide & New Categories Migration
-- =============================================

-- 1. Master list of all possible measurement fields
CREATE TABLE IF NOT EXISTS public.size_guide_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  unit text NOT NULL DEFAULT 'cm',
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.size_guide_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read size_guide_fields" ON public.size_guide_fields FOR SELECT USING (true);

-- 2. Which measurement fields apply to each category
CREATE TABLE IF NOT EXISTS public.category_size_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES public.size_guide_fields(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE(category_id, field_id)
);

ALTER TABLE public.category_size_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read category_size_fields" ON public.category_size_fields FOR SELECT USING (true);

-- 3. Per-product size guide values (one row per product+size+field)
CREATE TABLE IF NOT EXISTS public.product_size_guide (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  field_key text NOT NULL,
  value text NOT NULL DEFAULT '',
  UNIQUE(product_id, size, field_key)
);

ALTER TABLE public.product_size_guide ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read product_size_guide" ON public.product_size_guide FOR SELECT USING (true);

-- =============================================
-- Seed: Measurement Fields
-- =============================================
INSERT INTO public.size_guide_fields (key, label, unit, sort_order) VALUES
  ('waist',      'وسط',         'cm', 1),
  ('hip',        'ورك',         'cm', 2),
  ('leg_length', 'طول الساق',   'cm', 3),
  ('length',     'الطول',       'cm', 4),
  ('width',      'العرض',       'cm', 5),
  ('weight',     'وزن',         'kg', 6),
  ('leg_width',  'عرض الساق',   'cm', 7),
  ('foot_size',  'مقاس القدم',  'cm', 8);

-- =============================================
-- Seed: New Categories (تيشرت، شرابات، شورتات)
-- =============================================
INSERT INTO public.categories (slug, name, color, sort_order) VALUES
  ('tshirts', 'تيشرت',   '#2a6b4a', 5),
  ('socks',   'شرابات',   '#4a3b6b', 6),
  ('shorts',  'شورتات',   '#6b4a2a', 7);

-- =============================================
-- Admin RLS: allow authenticated to manage size guide tables
-- =============================================
CREATE POLICY "Admin manage size_guide_fields" ON public.size_guide_fields
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin manage category_size_fields" ON public.category_size_fields
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin manage product_size_guide" ON public.product_size_guide
  FOR ALL USING (true) WITH CHECK (true);
