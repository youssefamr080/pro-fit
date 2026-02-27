import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import HeroSlider from "@/components/home/HeroSlider";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import OffersTicker from "@/components/home/OffersTicker";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import PageTransition, { staggerContainer, fadeUpItem } from "@/components/PageTransition";
import { useRecent } from "@/context/RecentContext";
import { useAllProducts, useFeaturedProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useRecommendations } from "@/hooks/useRecommendations";
import { usePullToRefresh } from "@/hooks/useUX";
import SEO from "@/components/SEO";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Sparkles, TrendingUp, Clock, Flame, Percent, Tag, ArrowLeft } from "lucide-react";

export default function HomePage() {
    const { recents } = useRecent();
    const { data: allProducts = [], isLoading } = useAllProducts();
    const { data: featured = [], isLoading: featuredLoading } = useFeaturedProducts();
    const { data: categories = [] } = useCategories();
    const { data: recommended = [] } = useRecommendations(undefined, 12);
    const qc = useQueryClient();
    const onRefresh = useCallback(() => qc.invalidateQueries(), [qc]);
    const { isRefreshing } = usePullToRefresh(onRefresh);

    // Products on sale
    const saleProducts = useMemo(
        () => allProducts.filter((p) => p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.price).slice(0, 8),
        [allProducts]
    );

    // Group products by category
    const productsByCategory = useMemo(() => {
        const map: Record<string, typeof allProducts> = {};
        for (const p of allProducts) {
            if (!map[p.category]) map[p.category] = [];
            map[p.category].push(p);
        }
        return map;
    }, [allProducts]);

    // Dedup: recommendations exclude recents + featured (best sellers) + sale products
    const recentIds = useMemo(() => new Set(recents.map(p => p.id)), [recents]);
    const featuredIds = useMemo(() => new Set(featured.map(p => p.id)), [featured]);
    const saleIds = useMemo(() => new Set(saleProducts.map(p => p.id)), [saleProducts]);
    const dedupedRecommended = useMemo(
        () => recommended.filter(p => !recentIds.has(p.id) && !featuredIds.has(p.id) && !saleIds.has(p.id)),
        [recommended, recentIds, featuredIds, saleIds]
    );

    return (
        <PageTransition>
            <SEO title="الرئيسية" description="PRO FIT — تسوق أفضل ملابس رجالي في مصر. بوكسرات، سويت شيرت، بناطيل، فانلات بأفضل الأسعار." />

            {/* Pull-to-refresh indicator */}
            {isRefreshing ? (
                <div className="flex justify-center py-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full" />
                </div>
            ) : null}

            <div className="space-y-0">

                {/* ═══════════════════════════════════
                    HERO ZONE — Ticker + Slider
                ═══════════════════════════════════ */}
                <OffersTicker />
                <HeroSlider />
                <FlashSaleSection />

                {/* ═══════════════════════════════════
                    CATEGORIES
                ═══════════════════════════════════ */}
                <CategoryGrid />

                {/* ═══════════════════════════════════
                    PREMIUM SALE BANNER
                ═══════════════════════════════════ */}
                {saleProducts.length > 0 ? (
                    <div className="px-4 py-2 max-w-6xl mx-auto">
                        <Link to="/sales" className="block relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1a2c2d] to-[#111a1b] shadow-2xl border border-white/5 group">
                            {/* Decorative background glow */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#389a9c]/20 blur-[80px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-75 opacity-50" />

                            <div className="flex items-center justify-between p-6 relative z-10">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-1.5 text-[#389a9c] mb-1">
                                        <Tag className="w-3.5 h-3.5 fill-current" />
                                        <span className="font-extrabold italic tracking-widest text-[13px] mt-0.5">SALE</span>
                                    </div>
                                    <h3 className="text-white font-cairo font-bold text-xl md:text-2xl leading-tight mb-4 tracking-wide">
                                        خصومات تصل إلى <span className="text-[#389a9c] font-black">50%</span>
                                    </h3>
                                    <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 transition-colors backdrop-blur-md">
                                        <ArrowLeft className="w-3.5 h-3.5 text-white/90" />
                                        <span className="text-white/90 text-xs font-cairo font-bold">تصفح العروض</span>
                                    </div>
                                </div>

                                {/* Folded clothes image - Using a high-quality placeholder that matches the aesthetic */}
                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 transform md:-rotate-6 md:group-hover:rotate-0 transition-transform duration-500">
                                    <img
                                        src="https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?auto=format&fit=crop&q=80&w=400&h=400"
                                        alt="Sale Folded Clothes"
                                        className="w-full h-full object-cover brightness-95"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent mix-blend-overlay" />
                                </div>
                            </div>
                        </Link>
                    </div>
                ) : null}

                {/* ═══════════════════════════════════
                    BEST SELLERS — Grid Layout
                ═══════════════════════════════════ */}
                <section className="pt-6 pb-8 max-w-6xl mx-auto">
                    <SectionHeader icon={<TrendingUp className="h-5 w-5" />} title="الأكثر مبيعاً" badge="🔥" />
                    {featuredLoading ? (
                        <ProductGridSkeleton count={4} />
                    ) : (
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px] px-1"
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                        >
                            {featured.map((p) => (
                                <motion.div key={p.id} variants={fadeUpItem}>
                                    <ProductCard product={p} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </section>

                {/* ═══════════════════════════════════
                    SALE PRODUCTS — Horizontal Showcase
                ═══════════════════════════════════ */}
                {saleProducts.length > 0 ? (
                    <section className="pb-8 max-w-6xl mx-auto">
                        <div className="flex items-center justify-between px-4 mb-4">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-2"
                            >
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10">
                                    <Percent className="h-4 w-4 text-red-500" />
                                </span>
                                <h2 className="text-lg font-black font-cairo">عروض وتخفيضات</h2>
                            </motion.div>
                            <Link
                                to="/sales"
                                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                            >
                                عرض الكل
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="flex gap-[2px] overflow-x-auto pb-2 no-scrollbar px-1">
                            {saleProducts.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex-shrink-0 w-40 md:w-44"
                                >
                                    <ProductCard product={p} />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                ) : null}

                {/* ═══════════════════════════════════
                    DIVIDER
                ═══════════════════════════════════ */}
                <div className="mx-auto max-w-xs border-t border-border/50" />

                {/* ═══════════════════════════════════
                    PER-CATEGORY SCROLL STRIPS
                ═══════════════════════════════════ */}
                {categories.map((cat, catIdx) => {
                    const catProducts = productsByCategory[cat.name];
                    if (!catProducts || catProducts.length === 0) return null;
                    return (
                        <section key={cat.slug} className="py-6 max-w-6xl mx-auto">
                            <div className="flex items-center justify-between px-4 mb-4">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: catIdx * 0.1 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="w-1 h-5 rounded-full bg-foreground" />
                                    <h2 className="text-lg font-black font-cairo">{cat.name}</h2>
                                </motion.div>
                                <Link
                                    to={`/category/${cat.slug}`}
                                    className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    عرض الكل
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            <div className="flex gap-[2px] overflow-x-auto pb-2 no-scrollbar px-1">
                                {catProducts.slice(0, 8).map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.04 }}
                                        className="flex-shrink-0 w-40 md:w-44"
                                    >
                                        <ProductCard product={p} />
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    );
                })}

                {/* ═══════════════════════════════════
                    RECOMMENDATIONS — Deduplicated
                ═══════════════════════════════════ */}
                {dedupedRecommended.length > 0 ? (
                    <section className="py-6 max-w-6xl mx-auto">
                        <SectionHeader icon={<Sparkles className="h-5 w-5" />} title="مقترح لك" />
                        <div className="flex gap-[2px] overflow-x-auto pb-2 no-scrollbar px-1">
                            {dedupedRecommended.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex-shrink-0 w-40 md:w-44"
                                >
                                    <ProductCard product={p} />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                ) : null}

                {/* ═══════════════════════════════════
                    RECENTLY VIEWED
                ═══════════════════════════════════ */}
                {recents.length > 0 ? (
                    <section className="py-6 pb-10 max-w-6xl mx-auto">
                        <SectionHeader icon={<Clock className="h-5 w-5" />} title="شاهدت مؤخراً" />
                        <div className="flex gap-[2px] overflow-x-auto pb-2 no-scrollbar px-1">
                            {recents.slice(0, 8).map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex-shrink-0 w-40 md:w-44"
                                >
                                    <ProductCard product={p} />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>
        </PageTransition>
    );
}

/* ═══════════════════════════════════════════
   Section Header — Reusable Component
═══════════════════════════════════════════ */
function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 px-4 mb-4"
        >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5">
                <span className="text-foreground">{icon}</span>
            </span>
            <h2 className="text-lg font-black font-cairo">{title}</h2>
            {badge ? <span className="text-sm">{badge}</span> : null}
        </motion.div>
    );
}
