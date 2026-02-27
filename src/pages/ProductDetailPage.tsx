import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProductById, useProductsByCategory } from "@/hooks/useProducts";
import { useFlashSaleMap } from "@/hooks/useFlashSales";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecent } from "@/context/RecentContext";
import { useCompare } from "@/context/CompareContext";
import { useCustomer } from "@/context/CustomerContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Heart, Share2, ArrowLeftRight, AlertTriangle, ZoomIn, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MiniCountdown } from "@/components/home/FlashSaleSection";
import PageTransition from "@/components/PageTransition";
import ProductReviews, { useProductRating } from "@/components/ProductReviews";
import SizeGuideSheet from "@/components/SizeGuideSheet";
import ProductCard from "@/components/ProductCard";
import LazyImage from "@/components/LazyImage";
import SEO from "@/components/SEO";
import ImageLightbox from "@/components/ImageLightbox";
import type { ProductVariant } from "@/types/product";
import { ProductDetailSkeleton } from "@/components/PageSkeletons";

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: product, isLoading } = useProductById(id || "");
    const { data: recommended = [] } = useRecommendations(id, 8);
    const { data: categoryProducts = [] } = useProductsByCategory(product?.category || "");

    // Dedup logic: similar = same category (exclude self), recommended = exclude both self AND similar
    const similarProducts = categoryProducts.filter((p) => p.id !== id).slice(0, 8);
    const similarIds = new Set(similarProducts.map((p) => p.id));
    const dedupedRecommended = recommended.filter((p) => p.id !== id && !similarIds.has(p.id)).slice(0, 6);
    const { addItem } = useCart();
    const flashSaleMap = useFlashSaleMap();
    const flashSale = product ? flashSaleMap.get(product.id) : undefined;
    const { toggle, isWished } = useWishlist();
    const { addRecent } = useRecent();
    const { addToCompare, isInCompare } = useCompare();
    const { customer } = useCustomer();

    const [imgIndex, setImgIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [addedPulse, setAddedPulse] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const touchStartX = useRef(0);

    // Track recent view & log product view
    useEffect(() => {
        if (product) {
            addRecent(product);
            if (customer) {
                supabase.from("product_views").insert({
                    customer_id: customer.id,
                    product_id: product.id,
                }).then(() => { });
            }
        }
    }, [product?.id, customer?.id]);

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return <div className="p-8 text-center font-cairo">المنتج غير موجود</div>;
    }

    const wished = isWished(product.id);
    const uniqueColors = Array.from(new Map(product.variants.map((v: ProductVariant) => [v.color, v])).values());
    const uniqueSizes = Array.from(new Set(product.variants.map((v: ProductVariant) => v.size)));
    const isOutOfStock = product.stock <= 0;

    // Selected variant and its stock
    const selectedVariant = product.variants.find(
        (v: ProductVariant) => v.size === selectedSize && v.color === selectedColor
    );
    const variantStock = selectedVariant?.stock ?? null;
    const variantInStock = selectedVariant ? (variantStock ?? product.stock) > 0 : true;
    const isVariantLowStock = variantStock !== null && variantStock > 0 && variantStock <= 5;

    // Get stock for a specific size+color combination
    const getVariantStock = (size: string, color: string): number => {
        const v = product.variants.find((v: ProductVariant) => v.size === size && v.color === color);
        return v?.stock ?? 0;
    };

    // Check if a SIZE has any stock (for the selected color, or any color if none selected)
    const isSizeAvailable = (size: string): boolean => {
        if (selectedColor) return getVariantStock(size, selectedColor) > 0;
        return product.variants.some((v: ProductVariant) => v.size === size && (v.stock ?? 0) > 0);
    };

    // Check if a COLOR has any stock (for the selected size, or any size if none selected)
    const isColorAvailable = (color: string): boolean => {
        if (selectedSize) return getVariantStock(selectedSize, color) > 0;
        return product.variants.some((v: ProductVariant) => v.color === color && (v.stock ?? 0) > 0);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) setImgIndex((i) => Math.min(i + 1, product.images.length - 1));
            else setImgIndex((i) => Math.max(i - 1, 0));
        }
    };



    const handleAdd = () => {
        if (!selectedSize) {
            toast({ title: "تنبيه", description: "الرجاء اختيار المقاس أولاً", variant: "destructive" });
            return;
        }
        if (!selectedColor) {
            toast({ title: "تنبيه", description: "الرجاء اختيار اللون أولاً", variant: "destructive" });
            return;
        }
        if (isOutOfStock || !variantInStock) {
            toast({ title: "غير متوفر", description: "هذا المنتج غير متاح حالياً", variant: "destructive" });
            return;
        }
        addItem(product, selectedSize, selectedColor, flashSale?.flash_price);
        setAddedPulse(true);

        // Micro-interactions: Haptic feedback + Confetti (lazy loaded)
        if (navigator.vibrate) navigator.vibrate([50]);
        import("canvas-confetti").then(({ default: confetti }) => {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#ffe4e6', '#fb7185', '#e11d48', '#be123c'],
                disableForReducedMotion: true
            });
        });

        setTimeout(() => setAddedPulse(false), 1000);
    };

    const handleShare = () => {
        const url = window.location.href;
        const displayPrice = flashSale?.flash_price ?? product.sale_price ?? product.price;
        const text = `${product.title} — ${displayPrice} ج.م`;
        if (navigator.share) {
            navigator.share({ title: product.title, text, url });
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
        }
    };

    return (
        <PageTransition>
            <SEO
                title={product.title}
                description={product.description?.slice(0, 160) || `${product.title} — ${product.sale_price ?? product.price} ج.م | PRO FIT`}
                image={product.images[0]}
                product={{
                    name: product.title,
                    price: product.price,
                    salePrice: product.sale_price,
                    image: product.images[0],
                    sku: product.sku,
                    brand: product.brand,
                    category: product.category,
                    inStock: product.stock > 0,
                    description: product.description || product.title,
                }}
            />
            <div className="pb-20 max-w-4xl mx-auto">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="absolute top-14 right-4 z-30 bg-background/80 backdrop-blur-sm p-1.5 rounded-full"
                >
                    <ChevronRight className="h-5 w-5" />
                </motion.button>

                <div className="absolute top-14 left-4 z-30 flex gap-2">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggle(product)} className="bg-background/80 backdrop-blur-sm p-1.5 rounded-full">
                        <Heart className="h-5 w-5" fill={wished ? "currentColor" : "none"} style={{ color: wished ? "#e11d48" : "currentColor" }} />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={handleShare} className="bg-background/80 backdrop-blur-sm p-1.5 rounded-full">
                        <Share2 className="h-5 w-5" />
                    </motion.button>
                </div>

                <div
                    className="relative aspect-[3/4] bg-secondary overflow-hidden cursor-zoom-in"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setLightboxOpen(true)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={imgIndex}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25 }}
                            className="w-full h-full"
                        >
                            <LazyImage
                                src={product.images[imgIndex]}
                                alt={product.title}
                                className="w-full h-full"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Zoom hint */}
                    <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-cairo px-2.5 py-1 rounded-full flex items-center gap-1">
                        <ZoomIn className="h-3 w-3" />
                        اضغط للتكبير
                    </div>
                    {product.images.length > 1 && (
                        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                            {product.images.map((_, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => setImgIndex(i)}
                                    animate={{ width: i === imgIndex ? 24 : 6 }}
                                    className={`h-1.5 rounded-full transition-colors ${i === imgIndex ? "bg-foreground" : "bg-foreground/30"}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnail strip */}
                {product.images.length > 1 && (
                    <div className="flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar bg-background">
                        {product.images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setImgIndex(i)}
                                className={`flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all ${i === imgIndex
                                    ? "border-foreground opacity-100"
                                    : "border-transparent opacity-50 hover:opacity-80"
                                    }`}
                            >
                                <LazyImage
                                    src={img}
                                    alt={`${product.title} - ${i + 1}`}
                                    className="w-full h-full"
                                />
                            </button>
                        ))}
                    </div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="px-4 pt-5 space-y-5">
                    <div>
                        <h1 className="text-xl font-black font-cairo leading-tight">{product.title}</h1>
                        <p className="text-xs text-muted-foreground font-cairo mt-1">{product.brand} · {product.sku}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {flashSale ? (
                                <>
                                    <span className="text-2xl font-black font-cairo text-red-500">{flashSale.flash_price} ج.م</span>
                                    <span className="text-sm text-muted-foreground line-through">{product.price} ج.م</span>
                                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                                        -{Math.round(((product.price - flashSale.flash_price) / product.price) * 100)}%
                                    </span>
                                    <div className="flex items-center gap-1 bg-white/95 dark:bg-zinc-800 border border-red-200 dark:border-red-800 text-red-500 px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold">
                                        <Zap className="w-3 h-3" />
                                        <MiniCountdown endsAt={flashSale.ends_at} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="text-2xl font-black font-cairo">{product.sale_price ?? product.price} ج.م</span>
                                    {product.sale_price && (
                                        <>
                                            <span className="text-sm text-muted-foreground line-through">{product.price} ج.م</span>
                                            <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                                                -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                                            </span>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        {isOutOfStock && (
                            <div className="flex items-center gap-1.5 mt-2 text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-xl text-xs font-bold">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                غير متوفر حالياً
                            </div>
                        )}
                        {/* Variant-level stock warning */}
                        {selectedVariant && !variantInStock && !isOutOfStock && (
                            <div className="flex items-center gap-1.5 mt-2 text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-xl text-xs font-bold">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                {selectedSize} · {selectedColor} — غير متوفر حالياً
                            </div>
                        )}
                        {isVariantLowStock && variantInStock && (
                            <div className="flex items-center gap-1.5 mt-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                باقي {variantStock} قطع فقط من {selectedSize} · {selectedColor}!
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold font-cairo">المقاس</p>
                            <SizeGuideSheet category={product.category} productId={product.id} selectedSize={selectedSize} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {uniqueSizes.map((s: string) => {
                                const available = isSizeAvailable(s);
                                const isSelected = selectedSize === s;
                                return (
                                    <motion.button
                                        key={s}
                                        whileTap={available ? { scale: 0.93 } : {}}
                                        onClick={() => available && setSelectedSize(s)}
                                        disabled={!available}
                                        className={`relative px-5 py-2 text-sm font-bold font-cairo border rounded-lg transition-all ${isSelected
                                            ? "bg-foreground text-background border-foreground"
                                            : available
                                                ? "bg-background text-foreground border-border hover:border-foreground/50"
                                                : "bg-muted text-muted-foreground border-border/30 cursor-not-allowed opacity-50"
                                            }`}
                                    >
                                        {s}
                                        {!available && (
                                            <span className="absolute inset-0 flex items-center justify-center">
                                                <span className="w-full h-[1.5px] bg-muted-foreground/60 rotate-[-12deg]" />
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold font-cairo mb-2">اللون</p>
                        <div className="flex flex-wrap gap-3">
                            {uniqueColors.map((v: ProductVariant) => {
                                const available = isColorAvailable(v.color);
                                const isSelected = selectedColor === v.color;
                                return (
                                    <motion.button
                                        key={v.color}
                                        whileTap={available ? { scale: 0.9 } : {}}
                                        animate={{ scale: isSelected ? 1.15 : 1 }}
                                        onClick={() => available && setSelectedColor(v.color)}
                                        disabled={!available}
                                        className={`relative w-9 h-9 rounded-full border-2 transition-all ${isSelected
                                            ? "border-foreground shadow-md"
                                            : available
                                                ? "border-transparent hover:border-foreground/30"
                                                : "border-transparent cursor-not-allowed"
                                            }`}
                                        style={{
                                            backgroundColor: v.colorHex,
                                            opacity: available ? 1 : 0.25,
                                        }}
                                        title={available ? v.color : `${v.color} — غير متوفر`}
                                    >
                                        {!available && (
                                            <span className="absolute inset-0 flex items-center justify-center">
                                                <span className="w-full h-[1.5px] bg-foreground/50 rotate-45" />
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold font-cairo mb-1">الوصف</p>
                        <p className="text-sm text-muted-foreground font-cairo leading-relaxed">{product.description}</p>
                    </div>

                    <motion.a whileTap={{ scale: 0.97 }}
                        href={`https://wa.me/201550525643?text=${encodeURIComponent("أريد الاستفسار عن: " + product.title)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full border border-border rounded-xl py-2.5 text-sm font-bold font-cairo">
                        <span>💬</span> استفسر عبر واتساب
                    </motion.a>

                    <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => product && addToCompare(product)} disabled={isInCompare(product.id)}
                        className={`flex items-center justify-center gap-2 w-full border rounded-xl py-2.5 text-sm font-bold font-cairo transition-colors ${isInCompare(product.id) ? "border-foreground bg-foreground/5 text-foreground" : "border-border"}`}>
                        <ArrowLeftRight className="h-4 w-4" />
                        {isInCompare(product.id) ? "تمت الإضافة للمقارنة" : "أضف للمقارنة"}
                    </motion.button>

                    <ProductReviews productId={product.id} />

                    {/* Similar Products (same category) */}
                    {similarProducts.length > 0 && (
                        <div className="pt-4">
                            <p className="text-sm font-bold font-cairo mb-3">منتجات مشابهة</p>
                            <div className="flex gap-[2px] overflow-x-auto pb-2 no-scrollbar">
                                {similarProducts.map((p) => (
                                    <div key={p.id} className="flex-shrink-0 w-36">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {dedupedRecommended.length > 0 && (
                        <div className="pt-4">
                            <p className="text-sm font-bold font-cairo mb-3">منتجات مقترحة</p>
                            <div className="flex gap-[2px] overflow-x-auto pb-2 no-scrollbar">
                                {dedupedRecommended.map((p) => (
                                    <div key={p.id} className="flex-shrink-0 w-36">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                <div className="fixed bottom-14 inset-x-0 z-40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border-t border-border p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)] max-w-4xl mx-auto">
                    <motion.button onClick={handleAdd} disabled={isOutOfStock || !variantInStock}
                        animate={addedPulse ? { scale: [1, 0.96, 1] } : {}} transition={{ duration: 0.3 }} whileTap={{ scale: 0.97 }}
                        className={`w-full py-3.5 rounded-xl font-cairo font-bold text-sm disabled:opacity-40 transition-all ${addedPulse ? "bg-green-600 text-white" : isOutOfStock ? "bg-red-600/50 text-white" : "bg-foreground text-background"}`}>
                        {isOutOfStock ? "نفذت الكمية" : addedPulse ? "✓ تمت الإضافة!" : "أضف إلى السلة"}
                    </motion.button>
                </div>
            </div>

            {/* Full-screen image lightbox */}
            {lightboxOpen && (
                <ImageLightbox
                    images={product.images}
                    initialIndex={imgIndex}
                    alt={product.title}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </PageTransition>
    );
}
