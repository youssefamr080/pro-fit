-- ============================================
-- مصاريف الشحن حسب المحافظة
-- شغّل الأمر ده في Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate text NOT NULL UNIQUE,
  shipping_cost numeric NOT NULL DEFAULT 0,
  delivery_days text NOT NULL DEFAULT '2-3 أيام',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shipping rates" ON public.shipping_rates FOR SELECT USING (true);

-- ============================================
-- البيانات: كل محافظات مصر مع مصاريف الشحن
-- ============================================
INSERT INTO public.shipping_rates (governorate, shipping_cost, delivery_days, sort_order) VALUES
  ('القاهرة', 40, '1-2 يوم', 1),
  ('الجيزة', 40, '1-2 يوم', 2),
  ('الإسكندرية', 50, '2-3 أيام', 3),
  ('القليوبية', 45, '2-3 أيام', 4),
  ('الشرقية', 50, '2-3 أيام', 5),
  ('الدقهلية', 50, '2-3 أيام', 6),
  ('الغربية', 50, '2-3 أيام', 7),
  ('المنوفية', 50, '2-3 أيام', 8),
  ('البحيرة', 55, '2-3 أيام', 9),
  ('كفر الشيخ', 55, '3-4 أيام', 10),
  ('دمياط', 55, '2-3 أيام', 11),
  ('بورسعيد', 55, '2-3 أيام', 12),
  ('الإسماعيلية', 55, '2-3 أيام', 13),
  ('السويس', 55, '2-3 أيام', 14),
  ('الفيوم', 55, '3-4 أيام', 15),
  ('بني سويف', 55, '3-4 أيام', 16),
  ('المنيا', 60, '3-4 أيام', 17),
  ('أسيوط', 60, '3-4 أيام', 18),
  ('سوهاج', 60, '3-4 أيام', 19),
  ('قنا', 65, '3-5 أيام', 20),
  ('الأقصر', 65, '3-5 أيام', 21),
  ('أسوان', 70, '4-5 أيام', 22),
  ('البحر الأحمر', 70, '4-5 أيام', 23),
  ('مرسى مطروح', 70, '4-5 أيام', 24),
  ('شمال سيناء', 75, '5-7 أيام', 25),
  ('جنوب سيناء', 75, '5-7 أيام', 26),
  ('الوادي الجديد', 80, '5-7 أيام', 27);

-- ============================================
-- إضافة عمود مصاريف الشحن لجدول الطلبات
-- ============================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost numeric NOT NULL DEFAULT 0;
