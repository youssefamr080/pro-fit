import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import LazyImage from "@/components/LazyImage";
import { motion } from "framer-motion";

export default function CategoryGrid() {
    const { data: categories = [] } = useCategories();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || categories.length === 0) return;

        const interval = setInterval(() => {
            // Check if scrollable (mobile view)
            if (el.scrollWidth > el.clientWidth) {
                const prevScroll = el.scrollLeft;
                // Calculate exactly 1 card + its gap (1rem = 16px)
                const firstCard = el.children[0] as HTMLElement;
                const scrollStep = firstCard ? firstCard.offsetWidth + 16 : 180;

                el.scrollBy({ left: -scrollStep, behavior: "smooth" });

                // If no scroll happened, we reached the end visually in RTL
                setTimeout(() => {
                    if (el.scrollLeft === prevScroll) {
                        el.scrollTo({ left: 0, behavior: "smooth" });
                    }
                }, 800);
            }
        }, 4500);

        return () => clearInterval(interval);
    }, [categories.length]);

    if (categories.length === 0) return null;

    return (
        <section className="py-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-black font-cairo px-4 mb-6 tracking-tight">تسوق حسب القسم</h2>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-4 pb-6 no-scrollbar md:grid md:grid-cols-4 md:gap-5 md:overflow-visible relative z-10 snap-x snap-mandatory scroll-smooth"
            >
                {categories.map((c, i) => (
                    <motion.div
                        key={c.slug}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                        className="relative group snap-start shrink-0"
                    >
                        {/* Deep Glow Effect */}
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#389a9c]/0 via-[#389a9c]/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[40px]" />

                        <motion.div
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="relative z-10"
                        >
                            <Link
                                to={`/category/${c.slug}`}
                                className="relative flex-shrink-0 w-36 md:w-full aspect-[4/5] rounded-[28px] overflow-hidden block shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-2xl transition-all border border-foreground/5 bg-secondary"
                            >
                                {c.image ? (
                                    <LazyImage
                                        src={c.image}
                                        alt={c.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0" style={{ backgroundColor: c.color }} />
                                )}
                                {/* Multi-layered Gradient for depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent mix-blend-multiply" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                {/* Typography and Label */}
                                <div className="absolute bottom-0 inset-x-0 p-5 z-10 flex items-end">
                                    <span className="text-white font-cairo font-black text-lg md:text-xl tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                                        {c.name}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
