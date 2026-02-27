import { useState, useRef, lazy, Suspense, memo } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Star, Eye, Zap } from "lucide-react";
import { Product } from "@/types/product";
import { useFlashSaleMap } from "@/hooks/useFlashSales";
import { MiniCountdown } from "@/components/home/FlashSaleSection";
import { useWishlist } from "@/context/WishlistContext";
import { useProductRating } from "@/components/ProductReviews";
import { useToast } from "@/hooks/use-toast";
import LazyImage from "@/components/LazyImage";

const ProductQuickView = lazy(() => import("@/components/ProductQuickView"));

interface Props {
    product: Product;
    forceAspect?: string;
}

function ProductCardInner({ product, forceAspect }: Props) {
    const [imgIndex, setImgIndex] = useState(0);
    const [shareFlash, setShareFlash] = useState(false);
    const touchStartX = useRef(0);
    const { toggle, isWished } = useWishlist();
    const wished = isWished(product.id);
    const { avg, count: reviewCount } = useProductRating(product.id);
    const { toast } = useToast();
    const [showQuickView, setShowQuickView] = useState(false);
    const flashSaleMap = useFlashSaleMap();
    const flashSale = flashSaleMap.get(product.id);

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

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        const url = `${window.location.origin}/product/${product.id}`;
        const text = `${product.title} — ${flashSale?.flash_price ?? product.sale_price ?? product.price} ج.م`;
        if (navigator.share) {
            navigator.share({ title: product.title, text, url });
        } else {
            navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                toast({ title: "تم النسخ ✅", description: "تم نسخ رابط المنتج" });
            }).catch(() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
            });
        }
        setShareFlash(true);
        setTimeout(() => setShareFlash(false), 800);
    };

    const tag = product.tags[0];

    return (
        <motion.div
            className="flex flex-col group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Link to={`/product/${product.id}`} className="block">
                <div
                    className={`relative overflow-hidden bg-secondary rounded-2xl transition-shadow duration-300 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${forceAspect || "aspect-[3/4]"}`}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <LazyImage
                        key={imgIndex}
                        src={product.images[imgIndex]}
                        alt={product.title}
                        className="w-full h-full"
                    />

                    {/* Badge: flash end-timer or regular tag */}
                    {flashSale ? (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-red-200 text-red-500 px-2 py-0.5 rounded-full shadow-sm">
                            <Zap className="w-2.5 h-2.5" />
                            <MiniCountdown endsAt={flashSale.ends_at} />
                        </div>
                    ) : tag ? (
                        <span
                            className={`absolute top-2 right-2 text-[10px] font-cairo font-bold px-2.5 py-1 rounded-full ${tag === "وصل حديثاً"
                                ? "bg-foreground text-background"
                                : "bg-background text-foreground border border-border"
                                }`}
                        >
                            {tag}
                        </span>
                    ) : null}

                    {/* Heart + Share buttons */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => { e.preventDefault(); toggle(product); }}
                            className="w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={wished ? "filled" : "empty"}
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.5 }}
                                >
                                    <Heart
                                        className="h-3.5 w-3.5"
                                        fill={wished ? "currentColor" : "none"}
                                        strokeWidth={wished ? 0 : 2}
                                        style={{ color: wished ? "#e11d48" : "currentColor" }}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleShare}
                            className="w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                            <Share2 className={`h-3.5 w-3.5 transition-colors ${shareFlash ? "text-green-500" : ""}`} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
                            className="w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full items-center justify-center hidden md:flex"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </motion.button>
                    </div>

                    {/* Image dots */}
                    {product.images.length > 1 ? (
                        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                            {product.images.map((_, i) => (
                                <motion.span
                                    key={i}
                                    animate={{ width: i === imgIndex ? 16 : 4 }}
                                    className={`h-1 rounded-full ${i === imgIndex ? "bg-foreground" : "bg-foreground/30"}`}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            </Link>

            <div className="p-2">
                <p className="text-xs font-cairo font-bold truncate">{product.title}</p>
                {avg !== null ? (
                    <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3" fill="currentColor" style={{ color: "#f59e0b" }} />
                        <span className="text-[10px] font-bold">{avg.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
                    </div>
                ) : null}
                <div className="flex items-center gap-2 mt-0.5">
                    {flashSale ? (
                        <>
                            <span className="text-xs font-cairo font-black text-red-500">
                                {flashSale.flash_price} ج.م
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                                {product.price} ج.م
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-xs font-cairo font-bold">
                                {flashSale?.flash_price ?? product.sale_price ?? product.price} ج.م
                            </span>
                            {(flashSale || product.sale_price) ? (
                                <span className="text-xs text-muted-foreground line-through">
                                    {product.price} ج.م
                                </span>
                            ) : null}
                        </>
                    )}
                </div>
            </div>

            {/* Quick View modal (desktop only) — rendered via Portal to avoid Link interference */}
            {showQuickView ? createPortal(
                <Suspense fallback={null}>
                    <ProductQuickView product={product} onClose={() => setShowQuickView(false)} />
                </Suspense>,
                document.body
            ) : null}
        </motion.div>
    );
}

export default memo(ProductCardInner);
