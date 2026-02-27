import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import PageTransition, { staggerContainer, fadeUpItem } from "@/components/PageTransition";
import SEO from "@/components/SEO";

export default function WishlistPage() {
    const { items } = useWishlist();

    return (
        <PageTransition>
            <SEO title="المفضلة" description="منتجاتك المفضلة في PRO FIT" />
            <div className="font-cairo min-h-screen pb-20">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-black px-4 py-4 border-b border-border"
                >
                    المفضلة ({items.length})
                </motion.h1>

                <AnimatePresence mode="popLayout">
                    {items.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 px-6 text-center"
                        >
                            <div className="relative mb-8">
                                {/* Decorative Soft Blob behind icon */}
                                <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-2xl scale-150" />
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="relative bg-background border border-border/50 shadow-sm p-5 rounded-full"
                                >
                                    <Heart className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                                </motion.div>
                            </div>
                            <p className="text-lg font-black mb-2">قائمة رغباتك فارغة!</p>
                            <p className="text-sm text-muted-foreground mb-8 max-w-xs">اختفظ بمنتجاتك المفضلة هنا لسهولة الوصول إليها لاحقاً.</p>
                            <motion.div whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/"
                                    className="bg-foreground text-background px-8 py-3 rounded-xl font-bold text-sm shadow-md"
                                >
                                    تصفح أحدث الأزياء
                                </Link>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px] px-0 pt-1"
                        >
                            {items.map((product) => (
                                <motion.div key={product.id} variants={fadeUpItem} layout exit={{ opacity: 0, scale: 0.8 }}>
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
