import { motion } from "framer-motion";

/* ────────── Hero Skeleton ────────── */
export function HeroSkeleton() {
    return (
        <div className="relative w-full h-[85vh] bg-secondary/50 overflow-hidden animate-pulse">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8">
                <div className="h-10 w-64 bg-muted/80 rounded-full" />
                <div className="h-5 w-40 bg-muted/80 rounded-full" />
                <div className="h-12 w-36 bg-foreground/10 rounded-xl mt-4" />
            </div>
        </div>
    );
}

/* ────────── Category Grid Skeleton ────────── */
export function CategoryGridSkeleton() {
    return (
        <section className="py-8 max-w-6xl mx-auto">
            <div className="h-6 w-40 bg-secondary rounded mx-4 mb-5 relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
            <div className="flex gap-3 overflow-hidden px-4 md:grid md:grid-cols-4 md:gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-shrink-0 w-32 md:w-full aspect-square rounded-xl bg-secondary relative overflow-hidden">
                        <div className="absolute inset-0 shimmer-placeholder" />
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ────────── Product Detail Skeleton ────────── */
export function ProductDetailSkeleton() {
    return (
        <div className="pb-20 max-w-4xl mx-auto animate-pulse">
            <div className="aspect-[3/4] md:aspect-square bg-secondary/50 rounded-b-3xl" />
            <div className="p-5 space-y-6">
                <div className="space-y-3">
                    <div className="h-7 w-3/4 bg-secondary rounded-full" />
                    <div className="h-5 w-1/3 bg-secondary rounded-full" />
                </div>

                {/* Price block */}
                <div className="flex gap-3">
                    <div className="h-8 w-24 bg-secondary rounded-xl" />
                    <div className="h-8 w-16 bg-secondary/50 rounded-xl" />
                </div>

                {/* Size block */}
                <div className="space-y-3 pt-2">
                    <div className="h-4 w-16 bg-secondary rounded-full" />
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 w-16 bg-secondary rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Color block */}
                <div className="space-y-3 pt-2">
                    <div className="h-4 w-16 bg-secondary rounded-full" />
                    <div className="flex gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 w-10 bg-secondary rounded-full" />
                        ))}
                    </div>
                </div>

                {/* Description lines */}
                <div className="space-y-3 pt-4">
                    <div className="h-4 w-16 bg-secondary rounded-full mb-4" />
                    <div className="h-3 w-full bg-secondary rounded-full" />
                    <div className="h-3 w-5/6 bg-secondary rounded-full" />
                    <div className="h-3 w-4/6 bg-secondary rounded-full" />
                </div>
            </div>
        </div>
    );
}

/* ────────── Cart Page Skeleton ────────── */
export function CartSkeleton() {
    return (
        <div className="px-4 py-4 space-y-5 max-w-4xl mx-auto font-cairo animate-pulse">
            <div className="h-8 w-32 bg-secondary rounded-full mb-6" />
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-4 border border-border rounded-2xl">
                    <div className="w-24 h-32 bg-secondary rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-5 w-3/4 bg-secondary rounded-full" />
                        <div className="h-4 w-1/3 bg-secondary rounded-full" />
                        <div className="h-5 w-1/4 bg-secondary rounded-full mt-4" />
                        <div className="flex justify-between items-end mt-4">
                            <div className="h-8 w-24 bg-secondary rounded-lg" />
                            <div className="h-8 w-8 bg-secondary rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ────────── Profile Skeleton ────────── */
export function ProfileSkeleton() {
    return (
        <div className="px-5 py-8 space-y-8 max-w-md mx-auto font-cairo animate-pulse">
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-secondary" />
                <div className="space-y-3 flex-1">
                    <div className="h-6 w-2/3 bg-secondary rounded-full" />
                    <div className="h-4 w-1/2 bg-secondary rounded-full" />
                </div>
            </div>
            <div className="space-y-4 pt-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-14 w-full bg-secondary rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
