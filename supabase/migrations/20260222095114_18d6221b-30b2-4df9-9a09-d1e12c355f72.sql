
-- =============================================
-- 1. Products table (replaces hardcoded data)
-- =============================================
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  sale_price numeric DEFAULT NULL,
  category text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT 'PRO FIT',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  sku text NOT NULL DEFAULT '',
  stock integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active products" ON public.products FOR SELECT USING (true);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. Categories table
-- =============================================
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#1a1a1a',
  image text DEFAULT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);

-- =============================================
-- 3. Banners table (Hero Slider)
-- =============================================
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  cta_text text NOT NULL DEFAULT 'تسوق الآن',
  cta_link text NOT NULL DEFAULT '/categories',
  bg_color text NOT NULL DEFAULT '#1a1a1a',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active banners" ON public.banners FOR SELECT USING (true);

-- =============================================
-- 4. Announcements table (Top ticker)
-- =============================================
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text text NOT NULL,
  bg_color text NOT NULL DEFAULT '#1a1a1a',
  text_color text NOT NULL DEFAULT '#ffffff',
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz DEFAULT NULL,
  ends_at timestamptz DEFAULT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read announcements" ON public.announcements FOR SELECT USING (true);

-- =============================================
-- 5. Loyalty Points System
-- =============================================
CREATE TABLE public.loyalty_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  points_per_currency numeric NOT NULL DEFAULT 1,
  redemption_rate numeric NOT NULL DEFAULT 10,
  min_points_redeem integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read loyalty settings" ON public.loyalty_settings FOR SELECT USING (true);

CREATE TABLE public.loyalty_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  points integer NOT NULL,
  type text NOT NULL DEFAULT 'earn',
  order_id uuid DEFAULT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read own loyalty transactions" ON public.loyalty_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert loyalty transactions" ON public.loyalty_transactions FOR INSERT WITH CHECK (true);

-- Add loyalty_points column to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS loyalty_points integer NOT NULL DEFAULT 0;

-- =============================================
-- 6. Product Views (for recommendations)
-- =============================================
CREATE TABLE public.product_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL,
  product_id uuid NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read product views" ON public.product_views FOR SELECT USING (true);
CREATE POLICY "Anyone can insert product views" ON public.product_views FOR INSERT WITH CHECK (true);

-- =============================================
-- 7. Seed Categories
-- =============================================
INSERT INTO public.categories (slug, name, color, sort_order) VALUES
  ('sweatshirts', 'سويت شيرت', '#2d1b4e', 1),
  ('trousers', 'بناطيل', '#1e3a2f', 2),
  ('boxers', 'بوكسرات', '#1e3a5f', 3),
  ('undershirts', 'فانلات', '#4a3728', 4);

-- =============================================
-- 8. Seed Banners
-- =============================================
INSERT INTO public.banners (title, subtitle, cta_text, cta_link, bg_color, image, sort_order) VALUES
  ('مجموعة الشتاء الجديدة', 'أناقة بلا حدود', 'تسوق الآن', '/categories', '#1a1a1a', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=1200&fit=crop', 1),
  ('تخفيضات حتى ٥٠٪', 'عروض لا تُفوت', 'اكتشف العروض', '/categories', '#2d1b4e', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1200&fit=crop', 2),
  ('ستريت وير أصيل', 'كن مختلفاً', 'تسوق الآن', '/categories', '#1e3a2f', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1200&fit=crop', 3);

-- =============================================
-- 9. Seed Announcements
-- =============================================
INSERT INTO public.announcements (text, sort_order) VALUES
  ('🔥 خصم ٣٠٪ على جميع السويت شيرتات — لفترة محدودة', 1),
  ('⚡ شحن مجاني للطلبات فوق ٢٠٠ ج.م', 2),
  ('🎁 اشترِ ٢ واحصل على الثالث مجاناً — بوكسرات فقط', 3);

-- =============================================
-- 10. Seed Loyalty Settings
-- =============================================
INSERT INTO public.loyalty_settings (points_per_currency, redemption_rate, min_points_redeem) VALUES (1, 10, 100);

-- =============================================
-- 11. Seed Products (22 realistic products)
-- =============================================
INSERT INTO public.products (title, description, price, sale_price, category, brand, sku, stock, images, variants, tags, sort_order) VALUES
-- بوكسرات
('بوكسر قطني كلاسيكي', 'بوكسر قطني مريح بتصميم كلاسيكي يوفر راحة طوال اليوم. مصنوع من أجود أنواع القطن المصري بنسبة 95% قطن و5% إيلاستين.', 79, NULL, 'بوكسرات', 'PRO FIT', 'BX-001', 150, '["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":20},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":25},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":30},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":18},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":22},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":20},{"size":"S","color":"كحلي","colorHex":"#1e3a5f","stock":12},{"size":"M","color":"كحلي","colorHex":"#1e3a5f","stock":15},{"size":"L","color":"كحلي","colorHex":"#1e3a5f","stock":10}]', '{}', 1),

('بوكسر رياضي مرن', 'بوكسر رياضي بخامة مرنة تتحرك معك بحرية. مثالي للتمارين والحركة اليومية مع تقنية التهوية المتقدمة.', 99, 69, 'بوكسرات', 'PRO FIT', 'BX-002', 200, '["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":25},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":30},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":28},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"S","color":"رمادي","colorHex":"#6b7280","stock":15},{"size":"M","color":"رمادي","colorHex":"#6b7280","stock":20},{"size":"L","color":"رمادي","colorHex":"#6b7280","stock":22},{"size":"S","color":"أزرق","colorHex":"#2563eb","stock":10},{"size":"M","color":"أزرق","colorHex":"#2563eb","stock":12}]', '{"الأكثر مبيعاً"}', 2),

('بوكسر بريميوم', 'بوكسر فاخر بخامة ناعمة ومسامية. تصميم أنيق يجمع بين الراحة والأناقة مع حزام مطاطي مريح.', 129, NULL, 'بوكسرات', 'PRO FIT', 'BX-003', 80, '["https://images.unsplash.com/photo-1584735174914-265815f48f84?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":8},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":10},{"size":"S","color":"عنابي","colorHex":"#722f37","stock":5},{"size":"M","color":"عنابي","colorHex":"#722f37","stock":8}]', '{"وصل حديثاً"}', 3),

('طقم بوكسرات ٣ قطع', 'طقم من ثلاث بوكسرات بألوان متنوعة. خامة قطنية ممتازة بسعر اقتصادي مع ضمان جودة المنتج.', 199, 149, 'بوكسرات', 'PRO FIT', 'BX-004', 120, '["https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":20},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":25},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":18},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":15}]', '{"الأكثر مبيعاً"}', 4),

('بوكسر حراري شتوي', 'بوكسر حراري مصمم خصيصاً لفصل الشتاء. يحافظ على الدفء مع تهوية مثالية وخامة مقاومة للبكتيريا.', 119, NULL, 'بوكسرات', 'PRO FIT', 'BX-005', 90, '["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"S","color":"رمادي","colorHex":"#6b7280","stock":10},{"size":"M","color":"رمادي","colorHex":"#6b7280","stock":14},{"size":"L","color":"رمادي","colorHex":"#6b7280","stock":12},{"size":"S","color":"كحلي","colorHex":"#1e3a5f","stock":8},{"size":"M","color":"كحلي","colorHex":"#1e3a5f","stock":10}]', '{"وصل حديثاً"}', 5),

-- سويت شيرت
('سويت شيرت أوفر سايز', 'سويت شيرت أوفر سايز بقصة واسعة عصرية. خامة فليس ناعمة ودافئة بوزن 320 جرام لكل متر مربع.', 299, 199, 'سويت شيرت', 'PRO FIT', 'SW-001', 100, '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1578768079470-0a4f6d7af439?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":20},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":8},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":15},{"size":"S","color":"زيتي","colorHex":"#4a5d23","stock":6},{"size":"M","color":"زيتي","colorHex":"#4a5d23","stock":10}]', '{"الأكثر مبيعاً"}', 6),

('هودي بسحاب كامل', 'هودي أنيق بسحاب كامل وجيوب جانبية مبطنة. مثالي للطبقات والإطلالات الكاجوال بخامة فرنش تيري.', 349, NULL, 'سويت شيرت', 'PRO FIT', 'SW-002', 75, '["https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":8},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":8},{"size":"S","color":"كحلي","colorHex":"#1e3a5f","stock":6},{"size":"M","color":"كحلي","colorHex":"#1e3a5f","stock":10},{"size":"L","color":"كحلي","colorHex":"#1e3a5f","stock":8},{"size":"S","color":"عنابي","colorHex":"#722f37","stock":4},{"size":"M","color":"عنابي","colorHex":"#722f37","stock":6}]', '{}', 7),

('سويت شيرت كرو نيك', 'سويت شيرت برقبة دائرية وتصميم بسيط. قماش ثقيل فاخر بوزن 280 جرام لمظهر أنيق ومريح.', 259, NULL, 'سويت شيرت', 'PRO FIT', 'SW-003', 85, '["https://images.unsplash.com/photo-1572495532056-8583af1cbae0?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":8},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":10},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"S","color":"بيج","colorHex":"#d4b896","stock":5},{"size":"M","color":"بيج","colorHex":"#d4b896","stock":8}]', '{"وصل حديثاً"}', 8),

('هودي مطبوع جرافيك', 'هودي بطباعة جرافيك جريئة على الصدر. تصميم شبابي عصري بخامة قطنية 100% مع طباعة مقاومة للغسيل.', 329, 249, 'سويت شيرت', 'PRO FIT', 'SW-004', 60, '["https://images.unsplash.com/photo-1614975059251-992f11792571?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":8},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":6},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":6},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":8},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":10}]', '{"الأكثر مبيعاً"}', 9),

('سويت شيرت نصف سحاب', 'سويت شيرت بنصف سحاب وياقة مرتفعة. إطلالة رياضية أنيقة بخامة بوليستر مخلوطة.', 279, NULL, 'سويت شيرت', 'PRO FIT', 'SW-005', 70, '["https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1434389677669-e08b4cda3a09?w=600&h=800&fit=crop"]', '[{"size":"S","color":"كحلي","colorHex":"#1e3a5f","stock":8},{"size":"M","color":"كحلي","colorHex":"#1e3a5f","stock":12},{"size":"L","color":"كحلي","colorHex":"#1e3a5f","stock":10},{"size":"S","color":"زيتي","colorHex":"#4a5d23","stock":6},{"size":"M","color":"زيتي","colorHex":"#4a5d23","stock":10},{"size":"L","color":"زيتي","colorHex":"#4a5d23","stock":8},{"size":"S","color":"بيج","colorHex":"#d4b896","stock":5},{"size":"M","color":"بيج","colorHex":"#d4b896","stock":8}]', '{}', 10),

('سويت شيرت صوف', 'سويت شيرت مبطن بالصوف لأقصى دفء. مثالي للأجواء الباردة بخامة صوف طبيعي مع بطانة قطنية.', 399, 299, 'سويت شيرت', 'PRO FIT', 'SW-006', 50, '["https://images.unsplash.com/photo-1609873814058-a8928924184a?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":6},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":8},{"size":"S","color":"رمادي","colorHex":"#6b7280","stock":5},{"size":"M","color":"رمادي","colorHex":"#6b7280","stock":8},{"size":"L","color":"رمادي","colorHex":"#6b7280","stock":6},{"size":"S","color":"عنابي","colorHex":"#722f37","stock":3},{"size":"M","color":"عنابي","colorHex":"#722f37","stock":5}]', '{"وصل حديثاً"}', 11),

-- بناطيل
('بنطلون كارجو واسع', 'بنطلون كارجو بجيوب جانبية وقصة واسعة مريحة. ستايل ستريت وير أصيل بخامة قطن تويل متينة.', 349, NULL, 'بناطيل', 'PRO FIT', 'TR-001', 90, '["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":8},{"size":"S","color":"رمادي","colorHex":"#6b7280","stock":8},{"size":"M","color":"رمادي","colorHex":"#6b7280","stock":12},{"size":"L","color":"رمادي","colorHex":"#6b7280","stock":10},{"size":"S","color":"زيتي","colorHex":"#4a5d23","stock":6},{"size":"M","color":"زيتي","colorHex":"#4a5d23","stock":10}]', '{"الأكثر مبيعاً"}', 12),

('بنطلون جوغر قطني', 'بنطلون جوغر مريح بأساور مطاطية. مثالي للرياضة والخروجات اليومية بخامة فرنش تيري.', 249, 179, 'بناطيل', 'PRO FIT', 'TR-002', 110, '["https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":20},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":8},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":10},{"size":"S","color":"كحلي","colorHex":"#1e3a5f","stock":6},{"size":"M","color":"كحلي","colorHex":"#1e3a5f","stock":10}]', '{}', 13),

('بنطلون تشينو سليم', 'بنطلون تشينو بقصة سليم أنيقة. مناسب للمناسبات شبه الرسمية بخامة قطن ستريتش.', 299, NULL, 'بناطيل', 'PRO FIT', 'TR-003', 85, '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":14},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"S","color":"كحلي","colorHex":"#1e3a5f","stock":8},{"size":"M","color":"كحلي","colorHex":"#1e3a5f","stock":10},{"size":"L","color":"كحلي","colorHex":"#1e3a5f","stock":8},{"size":"S","color":"بيج","colorHex":"#d4b896","stock":6},{"size":"M","color":"بيج","colorHex":"#d4b896","stock":8}]', '{"وصل حديثاً"}', 14),

('شورت رياضي', 'شورت رياضي خفيف بخامة سريعة الجفاف. مريح للتمارين والصيف مع جيب خلفي بسحاب.', 159, NULL, 'بناطيل', 'PRO FIT', 'TR-004', 130, '["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":22},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":20},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":10},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":14},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"S","color":"أزرق","colorHex":"#2563eb","stock":8},{"size":"M","color":"أزرق","colorHex":"#2563eb","stock":10}]', '{}', 15),

('بنطلون واسع مخطط', 'بنطلون واسع بخطوط طولية أنيقة. تصميم عصري يناسب كل المناسبات بخامة فيسكوز ناعمة.', 329, 259, 'بناطيل', 'PRO FIT', 'TR-005', 65, '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":8},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"S","color":"رمادي","colorHex":"#6b7280","stock":6},{"size":"M","color":"رمادي","colorHex":"#6b7280","stock":8},{"size":"L","color":"رمادي","colorHex":"#6b7280","stock":6},{"size":"S","color":"كحلي","colorHex":"#1e3a5f","stock":5},{"size":"M","color":"كحلي","colorHex":"#1e3a5f","stock":7}]', '{"الأكثر مبيعاً"}', 16),

('بنطلون فضفاض كتان', 'بنطلون كتان فضفاض خفيف ومريح. مثالي لأجواء الصيف الحارة بخامة كتان طبيعي 100%.', 289, NULL, 'بناطيل', 'PRO FIT', 'TR-006', 70, '["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":8},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":10},{"size":"S","color":"بيج","colorHex":"#d4b896","stock":6},{"size":"M","color":"بيج","colorHex":"#d4b896","stock":10},{"size":"L","color":"بيج","colorHex":"#d4b896","stock":8},{"size":"S","color":"عنابي","colorHex":"#722f37","stock":4},{"size":"M","color":"عنابي","colorHex":"#722f37","stock":6}]', '{"وصل حديثاً"}', 17),

-- فانلات
('فانلة قطنية أساسية', 'فانلة قطنية بسيطة لكل يوم. خامة ناعمة ومريحة على البشرة من قطن كومبد عالي الجودة.', 59, NULL, 'فانلات', 'PRO FIT', 'US-001', 200, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":25},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":30},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":28},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":22},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":28},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":25},{"size":"S","color":"رمادي","colorHex":"#6b7280","stock":15},{"size":"M","color":"رمادي","colorHex":"#6b7280","stock":18}]', '{}', 18),

('طقم فانلات ٣ قطع', 'طقم من ثلاث فانلات بألوان أساسية. قيمة ممتازة وجودة عالية من القطن المصري الفاخر.', 149, 99, 'فانلات', 'PRO FIT', 'US-002', 150, '["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":25},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":22},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":15},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":20},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":18},{"size":"S","color":"رمادي","colorHex":"#6b7280","stock":10},{"size":"M","color":"رمادي","colorHex":"#6b7280","stock":14}]', '{"الأكثر مبيعاً"}', 19),

('فانلة رياضية بدون أكمام', 'فانلة رياضية بدون أكمام بخامة مسامية. مثالية للتمارين المكثفة مع تقنية DryFit.', 89, NULL, 'فانلات', 'PRO FIT', 'US-003', 120, '["https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":20},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":16},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":14},{"size":"S","color":"أزرق","colorHex":"#2563eb","stock":8},{"size":"M","color":"أزرق","colorHex":"#2563eb","stock":10}]', '{"وصل حديثاً"}', 20),

('فانلة حرارية شتوية', 'فانلة حرارية تحافظ على دفء الجسم. طبقة داخلية مثالية لفصل الشتاء بتقنية الاحتفاظ بالحرارة.', 99, NULL, 'فانلات', 'PRO FIT', 'US-004', 100, '["https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":18},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"XL","color":"أسود","colorHex":"#1a1a1a","stock":8},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":10},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":14},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"S","color":"كحلي","colorHex":"#1e3a5f","stock":6},{"size":"M","color":"كحلي","colorHex":"#1e3a5f","stock":10}]', '{}', 21),

('فانلة بريميوم بيما', 'فانلة فاخرة من قطن بيما المصري. نعومة استثنائية تدوم طويلاً مع مقاومة للتجعد والانكماش.', 129, 89, 'فانلات', 'PRO FIT', 'US-005', 80, '["https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=800&fit=crop","https://images.unsplash.com/photo-1618354691229-20ec1e231400?w=600&h=800&fit=crop"]', '[{"size":"S","color":"أسود","colorHex":"#1a1a1a","stock":10},{"size":"M","color":"أسود","colorHex":"#1a1a1a","stock":15},{"size":"L","color":"أسود","colorHex":"#1a1a1a","stock":12},{"size":"S","color":"أبيض","colorHex":"#f5f5f5","stock":8},{"size":"M","color":"أبيض","colorHex":"#f5f5f5","stock":12},{"size":"L","color":"أبيض","colorHex":"#f5f5f5","stock":10},{"size":"S","color":"بيج","colorHex":"#d4b896","stock":5},{"size":"M","color":"بيج","colorHex":"#d4b896","stock":8}]', '{"الأكثر مبيعاً"}', 22);

-- Update reviews table to reference UUID product_id 
-- (reviews currently use text product_id, we'll keep it text to allow string references)
