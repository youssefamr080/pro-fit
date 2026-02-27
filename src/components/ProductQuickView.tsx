import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useFlashSaleMap } from "@/hooks/useFlashSales";
import LazyImage from "@/components/LazyImage";
import type { Product } from "@/types/product";

interface Props {
    product: Product;
    onClose: () => void;
}

export default function ProductQuickView({ product, onClose }: Props) {
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const { addItem } = useCart();
    const { toggle, isWished } = useWishlist();
    const flashSaleMap = useFlashSaleMap();
    const flashSale = flashSaleMap.get(product.id);

    const sizes = [...new Set(product.variants.map(v => v.size))];
    const colors = [...new Set(product.variants.map(v => v.color))];
    const effectivePrice = flashSale?.flash_price ?? product.sale_price;
    const discount = effectivePrice ? Math.round((1 - effectivePrice / product.price) * 100) : 0;

    const handleAdd = () => {
        if (!selectedSize || !selectedColor) return;
        addItem(product, selectedSize, selectedColor, flashSale?.flash_price);
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col md:flex-row"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Image */}
                    <div className="relative w-full md:w-1/2 aspect-square bg-secondary flex-shrink-0">
                        <LazyImage
                            src={product.images?.[0] || ""}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                        {discount > 0 && (
                            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                -{discount}%
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-background transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto font-cairo" dir="rtl">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                            <h3 className="text-lg font-black leading-tight">{product.title}</h3>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black">
                                {flashSale?.flash_price ?? product.sale_price ?? product.price} ج.م
                            </span>
                            {(flashSale || product.sale_price) && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {product.price} ج.م
                                </span>
                            )}
                        </div>

                        {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {product.description}
                            </p>
                        )}

                        {/* Sizes */}
                        {sizes.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-muted-foreground mb-2">المقاس</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {sizes.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            className={`px-3 py-1.5 text-xs font-bold border rounded transition-colors ${selectedSize === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {colors.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-muted-foreground mb-2">اللون</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedColor(c)}
                                            className={`px-3 py-1.5 text-xs font-bold border rounded transition-colors ${selectedColor === c ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto pt-3">
                            <button
                                onClick={handleAdd}
                                disabled={!selectedSize || !selectedColor}
                                className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-lg font-bold text-sm disabled:opacity-40 transition-all hover:opacity-90"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                أضف إلى السلة
                            </button>
                            <button
                                onClick={() => toggle(product)}
                                className={`p-2.5 rounded-lg border transition-colors ${isWished(product.id) ? "bg-red-50 border-red-200 text-red-500" : "border-border hover:border-foreground"}`}
                            >
                                <Heart className="h-4 w-4" fill={isWished(product.id) ? "currentColor" : "none"} />
                            </button>
                            <Link
                                to={`/product/${product.id}`}
                                onClick={onClose}
                                className="p-2.5 rounded-lg border border-border hover:border-foreground transition-colors"
                            >
                                <Eye className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
