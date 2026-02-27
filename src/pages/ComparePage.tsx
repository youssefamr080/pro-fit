import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Star, ArrowLeftRight, ExternalLink } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useCompare } from "@/context/CompareContext";
import { useProductRating } from "@/components/ProductReviews";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useFlashSaleMap } from "@/hooks/useFlashSales";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";

function RatingDisplay({ productId }: { productId: string }) {
    const { avg, count } = useProductRating(productId);
    return (
        <div className="flex items-center gap-1">
            <Star className="h-3 w-3" fill={avg ? "currentColor" : "none"} style={{ color: avg ? "#f59e0b" : "#d1d5db" }} />
            <span className="text-xs font-bold">{avg ? avg.toFixed(1) : "—"}</span>
            <span className="text-[10px] text-muted-foreground">({count})</span>
        </div>
    );
}

export default function ComparePage() {
    const { items, removeFromCompare, clearCompare } = useCompare();
    const { data: recommended = [] } = useRecommendations(undefined, 4);
    const flashSaleMap = useFlashSaleMap();

    if (items.length === 0) {
        return (
            <PageTransition>
                <div className="font-cairo min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <ArrowLeftRight className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-bold mb-1">لا توجد منتجات للمقارنة</p>
                    <p className="text-xs text-muted-foreground mb-4">أضف منتجات من صفحة المنتج للمقارنة بينها</p>
                    <motion.div whileTap={{ scale: 0.97 }}>
                        <Link to="/" className="bg-foreground text-background px-8 py-3 rounded-xl font-bold text-sm block shadow-lg">
                            تسوق الآن
                        </Link>
                    </motion.div>

                    {recommended.length > 0 && (
                        <div className="mt-16 w-full text-right">
                            <h2 className="text-lg font-black mb-4">مقترحات لك</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {recommended.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <SEO title="مقارنة المنتجات" description="قارن بين المنتجات المختلفة في PRO FIT" />
            <div className="font-cairo min-h-screen pb-20">
                <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                    <h1 className="text-lg font-black flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5" /> مقارنة المنتجات
                    </h1>
                    <button onClick={clearCompare} className="text-xs text-muted-foreground font-bold">مسح الكل</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        {/* Product images */}
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-3 text-right text-xs font-bold text-muted-foreground w-24">المنتج</th>
                                {items.map(p => (
                                    <th key={p.id} className="p-3 text-center relative">
                                        <button onClick={() => removeFromCompare(p.id)} className="absolute top-1 left-1 bg-secondary rounded-full p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                        <Link to={`/product/${p.id}`}>
                                            <div className="w-20 h-28 bg-secondary mx-auto mb-2 overflow-hidden">
                                                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                            </div>
                                            <p className="text-xs font-bold truncate max-w-[120px] mx-auto">{p.title}</p>
                                        </Link>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {/* Price */}
                            <tr className="border-b border-border/50">
                                <td className="p-3 text-xs font-bold text-muted-foreground">السعر</td>
                                {items.map(p => {
                                    const fs = flashSaleMap.get(p.id);
                                    return (
                                        <td key={p.id} className="p-3 text-center">
                                            <span className="font-bold">{fs?.flash_price ?? p.sale_price ?? p.price} ج.م</span>
                                            {(fs || p.sale_price) && <span className="text-[10px] text-muted-foreground line-through block">{p.price} ج.م</span>}
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Category */}
                            <tr className="border-b border-border/50">
                                <td className="p-3 text-xs font-bold text-muted-foreground">الفئة</td>
                                {items.map(p => <td key={p.id} className="p-3 text-center text-xs">{p.category}</td>)}
                            </tr>
                            {/* Rating */}
                            <tr className="border-b border-border/50">
                                <td className="p-3 text-xs font-bold text-muted-foreground">التقييم</td>
                                {items.map(p => <td key={p.id} className="p-3 text-center"><div className="flex justify-center"><RatingDisplay productId={p.id} /></div></td>)}
                            </tr>
                            {/* Sizes */}
                            <tr className="border-b border-border/50">
                                <td className="p-3 text-xs font-bold text-muted-foreground">المقاسات</td>
                                {items.map(p => {
                                    const sizes = [...new Set(p.variants.map(v => v.size))];
                                    return <td key={p.id} className="p-3 text-center text-[10px]">{sizes.join(" · ")}</td>;
                                })}
                            </tr>
                            {/* Colors */}
                            <tr className="border-b border-border/50">
                                <td className="p-3 text-xs font-bold text-muted-foreground">الألوان</td>
                                {items.map(p => {
                                    const colors = Array.from(new Map(p.variants.map(v => [v.color, v.colorHex])).entries());
                                    return (
                                        <td key={p.id} className="p-3">
                                            <div className="flex justify-center gap-1 flex-wrap">
                                                {colors.map(([name, hex]) => (
                                                    <div key={name} className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: hex }} title={name} />
                                                ))}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* View Product Link */}
                            <tr className="border-b border-border/50">
                                <td className="p-3 text-xs font-bold text-muted-foreground">عرض المنتج</td>
                                {items.map(p => (
                                    <td key={p.id} className="p-3 text-center">
                                        <Link
                                            to={`/product/${p.id}`}
                                            className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 hover:opacity-90 transition-opacity"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            عرض التفاصيل
                                        </Link>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
}
