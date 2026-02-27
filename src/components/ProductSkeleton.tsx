import { motion } from "framer-motion";

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col">
            <div className="aspect-[3/4] bg-secondary relative overflow-hidden">
                <div className="absolute inset-0 shimmer-placeholder" />
            </div>
            <div className="p-2 space-y-2">
                <div className="h-3 bg-secondary rounded w-3/4 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-placeholder" />
                </div>
                <div className="h-3 bg-secondary rounded w-1/3 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer-placeholder" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <ProductCardSkeleton />
                </motion.div>
            ))}
        </div>
    );
}
