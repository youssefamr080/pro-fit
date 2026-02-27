import { useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string;
    objectFit?: "cover" | "contain" | "fill";
    blurHash?: string;
    onClick?: () => void;
}

/**
 * Professional lazy-loading image with:
 * - IntersectionObserver for viewport-based loading
 * - Animated shimmer placeholder
 * - Smooth fade-in on load
 * - Error fallback
 */
function LazyImageInner({
    src,
    alt,
    className = "",
    objectFit = "cover",
    onClick,
}: LazyImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [inView, setInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px 0px", threshold: 0.01 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Reset state when src changes
    useEffect(() => {
        setLoaded(false);
        setError(false);
    }, [src]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            onClick={onClick}
        >
            {/* Shimmer placeholder */}
            {!loaded && (
                <div className="absolute inset-0 bg-secondary">
                    <div className="absolute inset-0 shimmer-placeholder" />
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-2xl block mb-1">📷</span>
                        <span className="text-[10px] text-muted-foreground">تعذّر تحميل الصورة</span>
                    </div>
                </div>
            )}

            {/* Actual image */}
            {inView && !error && (
                <motion.img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loaded ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`w-full h-full`}
                    style={{ objectFit }}
                />
            )}
        </div>
    );
}

export const LazyImage = memo(LazyImageInner);
export default LazyImage;
