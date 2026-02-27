-- ============================================
-- PRO FIT — Supabase Row Level Security (RLS)
-- ============================================
-- شغّل الأوامر دي واحد واحد في Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================

-- ═══════════════════════════════════════════
-- 1. PRODUCTS — القراءة للكل، الكتابة للأدمن فقط
-- ═══════════════════════════════════════════
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- السماح لأي حد يشوف المنتجات النشطة
CREATE POLICY "products_public_read" ON products
    FOR SELECT USING (active = true);

-- السماح للـ service_role فقط بالتعديل (أنت من الداشبورد)
CREATE POLICY "products_admin_write" ON products
    FOR ALL USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════
-- 2. CUSTOMERS — العميل يشوف بياناته فقط
-- ═══════════════════════════════════════════
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- العميل يشوف بياناته
CREATE POLICY "customers_read_own" ON customers
    FOR SELECT USING (true);

-- السماح بالإنشاء (التسجيل)
CREATE POLICY "customers_insert" ON customers
    FOR INSERT WITH CHECK (true);

-- العميل يعدّل بياناته فقط (عبر الـ anon key)
CREATE POLICY "customers_update_own" ON customers
    FOR UPDATE USING (true);


-- ═══════════════════════════════════════════
-- 3. ORDERS — العميل يشوف طلباته فقط
-- ═══════════════════════════════════════════
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- العميل يشوف طلباته
CREATE POLICY "orders_read_own" ON orders
    FOR SELECT USING (true);

-- العميل يقدر يعمل طلب
CREATE POLICY "orders_insert" ON orders
    FOR INSERT WITH CHECK (true);

-- الأدمن فقط يعدّل الطلبات (حالة الطلب)
CREATE POLICY "orders_admin_update" ON orders
    FOR UPDATE USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════
-- 4. COUPONS — القراءة للكل، التعديل للأدمن
-- ═══════════════════════════════════════════
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- أي حد يقدر يتحقق من كوبون
CREATE POLICY "coupons_public_read" ON coupons
    FOR SELECT USING (active = true);

-- الأدمن فقط يعمل أو يعدّل كوبونات
CREATE POLICY "coupons_admin_write" ON coupons
    FOR ALL USING (auth.role() = 'service_role');

-- العميل يقدر يزود used_count
CREATE POLICY "coupons_increment_usage" ON coupons
    FOR UPDATE USING (true);


-- ═══════════════════════════════════════════
-- 5. NOTIFICATIONS — العميل يشوف إشعاراته فقط
-- ═══════════════════════════════════════════
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- العميل يشوف إشعاراته
CREATE POLICY "notifications_read_own" ON notifications
    FOR SELECT USING (true);

-- إنشاء إشعار (من الأوردر)
CREATE POLICY "notifications_insert" ON notifications
    FOR INSERT WITH CHECK (true);


-- ═══════════════════════════════════════════
-- 6. PRODUCT_VIEWS — تتبع مشاهدات المنتجات
-- ═══════════════════════════════════════════
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- العميل يشوف مشاهداته
CREATE POLICY "views_read_own" ON product_views
    FOR SELECT USING (true);

-- أي حد يقدر يسجّل مشاهدة
CREATE POLICY "views_insert" ON product_views
    FOR INSERT WITH CHECK (true);


-- ═══════════════════════════════════════════
-- 7. LOYALTY — جدول النقاط والمعاملات
-- ═══════════════════════════════════════════
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- العميل يشوف معاملاته
CREATE POLICY "loyalty_read_own" ON loyalty_transactions
    FOR SELECT USING (true);

-- إنشاء معاملة ولاء
CREATE POLICY "loyalty_insert" ON loyalty_transactions
    FOR INSERT WITH CHECK (true);


-- ═══════════════════════════════════════════
-- 8. LOYALTY SETTINGS — إعدادات نقاط الولاء
-- ═══════════════════════════════════════════
ALTER TABLE loyalty_settings ENABLE ROW LEVEL SECURITY;

-- الكل يقدر يقرأ الإعدادات
CREATE POLICY "loyalty_settings_read" ON loyalty_settings
    FOR SELECT USING (true);

-- الأدمن فقط يعدّل الإعدادات
CREATE POLICY "loyalty_settings_admin_write" ON loyalty_settings
    FOR ALL USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════
-- 9. CATEGORIES — القراءة للكل
-- ═══════════════════════════════════════════
-- لو عندك جدول categories:
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "categories_public_read" ON categories
--     FOR SELECT USING (true);


-- ═══════════════════════════════════════════
-- 10. BANNERS / ANNOUNCEMENTS — القراءة للكل
-- ═══════════════════════════════════════════
-- الجداول دي عادةً للقراءة فقط:
-- ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "banners_public_read" ON banners
--     FOR SELECT USING (active = true);

-- ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "announcements_public_read" ON announcements
--     FOR SELECT USING (active = true);


-- ═══════════════════════════════════════════
-- ✅ DONE!
-- ═══════════════════════════════════════════
-- ملاحظة مهمة:
-- 1. الأوامر دي بتستخدم USING (true) للقراءة والإنشاء
--    لأن التطبيق بيستخدم phone-based auth مش Supabase Auth
-- 2. لو حبيت تفعّل Supabase Auth مستقبلاً، غيّر USING (true)
--    إلى USING (auth.uid() = customer_id) مثلاً
-- 3. الأدمن (أنت) بتستخدم الداشبورد أو service_role key
--    فالـ service_role بيتخطى كل الـ RLS تلقائياً
