import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAllProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import PageTransition, { staggerContainer, fadeUpItem } from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { Tag, SlidersHorizontal } from "lucide-react";
import FlashSaleSection from "@/components/home/FlashSaleSection";

export default function SalesPage() {
    const { data: allProducts = [], isLoading } = useAllProducts();
    const { data: categories = [] } = useCategories();
    const [activeCategory, setActiveCategory] = useState<string>("all");

    // Filter only products with active sale prices
    const saleProducts = useMemo(() => {
        const onSale = allProducts.filter(
            (p) => p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.price
        );
        if (activeCategory === "all") return onSale;
        return onSale.filter((p) => p.category === activeCategory);
    }, [allProducts, activeCategory]);

    // Get categories that have sale products
    const saleCategories = useMemo(() => {
        const onSale = allProducts.filter(
            (p) => p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.price
        );
        const cats = new Set(onSale.map((p) => p.category));
        return categories.filter((c) => cats.has(c.name));
    }, [allProducts, categories]);

    return (
        <PageTransition>
            <SEO
                title="عروض وتخفيضات"
                description="اكتشف أقوى العروض والخصومات على ملابس رجالي — بوكسرات، سويت شيرت، بناطيل بأسعار مخفضة!"
            />
            <div className="font-cairo min-h-screen pb-20">
                {/* Clean header */}
                <div className="px-4 pt-6 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-5 w-5 text-foreground" />
                        <h1 className="text-xl font-black">عروض وتخفيضات</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {isLoading ? "جاري التحميل..." : `${saleProducts.length} منتج بأسعار مخفضة`}
                    </p>
                </div>

                <div className="-mx-1">
                    <FlashSaleSection />
                </div>

                <div className="px-4 pb-4 border-b border-border mt-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-bold text-muted-foreground">فلتر حسب الفئة</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory("all")}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === "all"
                                ? "bg-foreground text-background shadow-md"
                                : "bg-secondary text-foreground hover:bg-secondary/80"
                                }`}
                        >
                            الكل
                        </motion.button>
                        {saleCategories.map((c) => (
                            <motion.button
                                key={c.slug}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveCategory(c.name)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === c.name
                                    ? "bg-foreground text-background shadow-md"
                                    : "bg-secondary text-foreground hover:bg-secondary/80"
                                    }`}
                            >
                                {c.name}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <section className="px-1 py-4 max-w-6xl mx-auto">
                    {isLoading ? (
                        <ProductGridSkeleton count={6} />
                    ) : saleProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Tag className="h-16 w-16 text-muted-foreground/20 mb-4" />
                            <p className="text-sm font-bold mb-1">
                                {activeCategory === "all" ? "لا توجد عروض حالياً" : "لا توجد عروض في هذا القسم"}
                            </p>
                            <p className="text-xs text-muted-foreground">ترقب عروض جديدة قريباً!</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                exit={{ opacity: 0 }}
                            >
                                {saleProducts.map((p) => (
                                    <motion.div key={p.id} variants={fadeUpItem}>
                                        <ProductCard product={p} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </section>
            </div>
        </PageTransition>
    );
}
