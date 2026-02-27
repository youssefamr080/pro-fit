import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import PageTransition, { staggerContainer, fadeUpItem } from "@/components/PageTransition";
import { useProductsByCategory } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";
import { ALL_SIZES, ALL_COLORS } from "@/lib/productUtils";
import SEO from "@/components/SEO";

const PAGE_SIZE = 6;

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data: categories = [] } = useCategories();

    // Find category by slug from DB
    const category = categories.find(c => c.slug === slug);
    const categoryName = category?.name || "";

    const { data: products = [], isLoading } = useProductsByCategory(categoryName);

    const [priceRange, setPriceRange] = useState([0, 500]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const loaderRef = useRef<HTMLDivElement>(null);

    const toggleSize = (s: string) =>
        setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    const toggleColor = (c: string) =>
        setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

    const filtered = useMemo(() => {
        return products
            .filter((p) => {
                const price = p.sale_price ?? p.price;
                return price >= priceRange[0] && price <= priceRange[1];
            })
            .filter((p) => selectedSizes.length === 0 || p.variants.some((v) => selectedSizes.includes(v.size)))
            .filter((p) => selectedColors.length === 0 || p.variants.some((v) => selectedColors.includes(v.color)));
    }, [products, priceRange, selectedSizes, selectedColors]);

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [priceRange, selectedSizes, selectedColors]);

    const visible = filtered.slice(0, page * PAGE_SIZE);
    const hasMore = visible.length < filtered.length;

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((p) => p + 1);
            }
        },
        [hasMore]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [handleObserver]);

    if (!categoryName && categories.length > 0) return <div className="p-8 text-center font-cairo">القسم غير موجود</div>;

    return (
        <PageTransition>
            <SEO title={categoryName || slug || ""} description={`تسوق تشكيلة ${categoryName} من PRO FIT بأفضل الأسعار في مصر`} />
            <div>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <motion.h1 initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-black font-cairo">
                        {categoryName || "..."}
                    </motion.h1>
                    <Drawer>
                        <DrawerTrigger asChild>
                            <motion.button whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 text-sm font-cairo font-bold border border-border px-3 py-1.5">
                                <SlidersHorizontal className="h-4 w-4" />
                                تصفية
                                {(selectedSizes.length > 0 || selectedColors.length > 0) && (
                                    <span className="w-2 h-2 rounded-full bg-foreground" />
                                )}
                            </motion.button>
                        </DrawerTrigger>
                        <DrawerContent className="px-6 pb-8 pt-4 font-cairo">
                            <h3 className="text-lg font-black mb-6">تصفية المنتجات</h3>
                            <div className="mb-6">
                                <p className="text-sm font-bold mb-3">نطاق السعر: {priceRange[0]} - {priceRange[1]} ج.م</p>
                                <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={500} step={10} />
                            </div>
                            <div className="mb-6">
                                <p className="text-sm font-bold mb-3">المقاس</p>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_SIZES.map((s) => (
                                        <motion.button key={s} whileTap={{ scale: 0.93 }} onClick={() => toggleSize(s)}
                                            className={`px-4 py-2 text-xs font-bold border transition-colors ${selectedSizes.includes(s) ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border"}`}>
                                            {s}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-sm font-bold mb-3">اللون</p>
                                <div className="flex flex-wrap gap-3">
                                    {ALL_COLORS.map((c) => (
                                        <motion.button key={c.name} whileTap={{ scale: 0.9 }} onClick={() => toggleColor(c.name)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(c.name) ? "border-foreground scale-110" : "border-transparent"}`}
                                            style={{ backgroundColor: c.hex }} title={c.name} />
                                    ))}
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>

                {isLoading ? (
                    <ProductGridSkeleton count={PAGE_SIZE} />
                ) : (
                    <>
                        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]" variants={staggerContainer} initial="initial" animate="animate">
                            {visible.map((p) => (
                                <motion.div key={p.id} variants={fadeUpItem}>
                                    <ProductCard product={p} />
                                </motion.div>
                            ))}
                        </motion.div>
                        <div ref={loaderRef} className="py-4">
                            {hasMore && <ProductGridSkeleton count={2} />}
                        </div>
                        {filtered.length === 0 && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground font-cairo py-12">
                                لا توجد منتجات مطابقة
                            </motion.p>
                        )}
                    </>
                )}
            </div>
        </PageTransition>
    );
}
