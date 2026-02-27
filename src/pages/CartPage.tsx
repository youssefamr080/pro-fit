import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition, { fadeUpItem, staggerContainer } from "@/components/PageTransition";
import LazyImage from "@/components/LazyImage";
import { toast } from "@/hooks/use-toast";
import { useRecommendations } from "@/hooks/useRecommendations";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";

export default function CartPage() {
    const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
    const { data: recommended = [] } = useRecommendations(undefined, 4);

    if (items.length === 0) {
        return (
            <PageTransition>
                <div className="flex flex-col items-center justify-center py-28 px-6 text-center font-cairo">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-[#389a9c]/10 dark:bg-[#389a9c]/20 rounded-full blur-2xl scale-150" />
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="relative bg-background border border-border/50 shadow-sm p-6 rounded-full"
                            >
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
                            </motion.div>
                        </div>
                    </motion.div>
                    <p className="text-lg font-bold mb-2">السلة فارغة</p>
                    <p className="text-sm text-muted-foreground mb-6">لم تضف أي منتجات بعد</p>
                    <motion.div whileTap={{ scale: 0.97 }}>
                        <Link to="/" className="bg-foreground text-background px-8 py-3 rounded-xl font-bold text-sm block shadow-lg">
                            تسوق الآن
                        </Link>
                    </motion.div>

                    {recommended.length > 0 ? (
                        <div className="mt-16 w-full text-right">
                            <h2 className="text-lg font-black mb-4">قد يعجبك أيضاً</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {recommended.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <SEO title="السلة" description="سلة التسوق الخاصة بك في PRO FIT" />
            <div className="pb-36 font-cairo">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-black px-4 py-4"
                >
                    السلة ({totalItems})
                </motion.h1>

                <motion.div
                    className="space-y-0"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <AnimatePresence>
                        {items.map((item) => {
                            const key = `${item.product.id}-${item.size}-${item.color}`;
                            const price = item.flashPrice ?? item.product.sale_price ?? item.product.price;
                            return (
                                <motion.div
                                    key={key}
                                    variants={fadeUpItem}
                                    exit={{ opacity: 0, x: 60, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex gap-3 px-4 py-4 border-b border-border"
                                >
                                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                                        <LazyImage
                                            src={item.product.images[0]}
                                            alt={item.product.title}
                                            className="w-20 h-28 rounded-lg"
                                        />
                                    </Link>
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <p className="text-sm font-bold truncate">{item.product.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {item.size} · {item.color}
                                            </p>
                                            <p className="text-sm font-bold mt-1">{price} ج.م</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                                                    className="p-1.5"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </motion.button>
                                                <span className="px-3 text-sm font-bold">{item.quantity}</span>
                                                <motion.button
                                                    whileTap={{ scale: 0.85 }}
                                                    onClick={() => {
                                                        if (item.quantity >= item.product.stock && item.product.stock > 0) {
                                                            toast({ title: "تنبيه", description: `الكمية المتاحة ${item.product.stock} فقط` });
                                                            return;
                                                        }
                                                        updateQuantity(item.product.id, item.size, item.color, item.quantity + 1);
                                                    }}
                                                    className="p-1.5"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </motion.button>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.85 }}
                                                onClick={() => removeItem(item.product.id, item.size, item.color)}
                                                className="p-1.5 text-muted-foreground"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Summary */}
                <div className="fixed bottom-14 inset-x-0 z-40 bg-background border-t border-border p-4 max-w-md mx-auto space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">المجموع</span>
                        <motion.span
                            key={totalPrice}
                            initial={{ scale: 1.2, color: "hsl(var(--foreground))" }}
                            animate={{ scale: 1 }}
                            className="font-bold"
                        >
                            {totalPrice} ج.م
                        </motion.span>
                    </div>
                    <motion.div whileTap={{ scale: 0.98 }}>
                        <Link
                            to="/checkout"
                            className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-sm flex items-center justify-center"
                        >
                            إتمام الشراء →
                        </Link>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
}
