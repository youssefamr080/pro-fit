import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * Floating scroll-to-top button — appears after scrolling 400px.
 * Positioned above the bottom nav with a smooth spring animation.
 */
export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={scrollToTop}
                    aria-label="العودة للأعلى"
                    className="fixed bottom-20 left-4 z-40 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg shadow-foreground/20 hover:shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                    <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
