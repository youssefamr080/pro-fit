import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

interface Props {
    images: string[];
    initialIndex?: number;
    alt?: string;
    onClose: () => void;
}

/**
 * Full-screen professional image lightbox with:
 * - Pinch-to-zoom on mobile
 * - Scroll to zoom on desktop
 * - Pan when zoomed in
 * - Swipe to navigate between images
 * - Smooth animations
 */
export default function ImageLightbox({ images, initialIndex = 0, alt = "", onClose }: Props) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const pinchStartDist = useRef(0);
    const pinchStartScale = useRef(1);
    const panStart = useRef({ x: 0, y: 0 });
    const translateStart = useRef({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const resetZoom = useCallback(() => {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
    }, []);

    const goNext = useCallback(() => {
        resetZoom();
        setCurrentIndex(i => Math.min(i + 1, images.length - 1));
    }, [images.length, resetZoom]);

    const goPrev = useCallback(() => {
        resetZoom();
        setCurrentIndex(i => Math.max(i - 1, 0));
    }, [resetZoom]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") goNext(); // RTL
            if (e.key === "ArrowRight") goPrev(); // RTL
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose, goNext, goPrev]);

    // Scroll to zoom (desktop)
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        setScale(s => {
            const next = Math.max(1, Math.min(5, s + delta));
            if (next === 1) setTranslate({ x: 0, y: 0 });
            return next;
        });
    }, []);

    // Touch events for pinch-to-zoom and pan
    const getDistance = (t1: React.Touch, t2: React.Touch) => {
        return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch start
            pinchStartDist.current = getDistance(e.touches[0], e.touches[1]);
            pinchStartScale.current = scale;
        } else if (e.touches.length === 1) {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
            if (scale > 1) {
                // Pan start
                isPanning.current = true;
                panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                translateStart.current = { ...translate };
            }
        }
    }, [scale, translate]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch zoom
            const dist = getDistance(e.touches[0], e.touches[1]);
            const newScale = Math.max(1, Math.min(5, pinchStartScale.current * (dist / pinchStartDist.current)));
            setScale(newScale);
            if (newScale === 1) setTranslate({ x: 0, y: 0 });
        } else if (e.touches.length === 1 && isPanning.current && scale > 1) {
            // Pan
            const dx = e.touches[0].clientX - panStart.current.x;
            const dy = e.touches[0].clientY - panStart.current.y;
            setTranslate({
                x: translateStart.current.x + dx,
                y: translateStart.current.y + dy,
            });
        }
    }, [scale]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (isPanning.current) {
            isPanning.current = false;
            return;
        }
        // Swipe to navigate (only when not zoomed)
        if (scale <= 1 && e.changedTouches.length === 1) {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            const vertDiff = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
            if (Math.abs(diff) > 60 && vertDiff < 100) {
                if (diff > 0) goNext();
                else goPrev();
            }
        }
    }, [scale, goNext, goPrev]);

    // Double-tap to zoom
    const lastTap = useRef(0);
    const handleDoubleTap = useCallback(() => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            if (scale > 1) {
                resetZoom();
            } else {
                setScale(2.5);
            }
        }
        lastTap.current = now;
    }, [scale, resetZoom]);

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black flex flex-col"
            >
                {/* Top bar */}
                <div className="flex items-center justify-between p-4 z-10">
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1">
                        <X className="h-6 w-6" />
                    </button>
                    <span className="text-white/60 text-sm font-cairo">
                        {currentIndex + 1} / {images.length}
                    </span>
                    <span className="text-white/40 text-xs font-cairo flex items-center gap-1">
                        <ZoomIn className="h-3.5 w-3.5" />
                        {Math.round(scale * 100)}%
                    </span>
                </div>

                {/* Image area */}
                <div
                    ref={containerRef}
                    className="flex-1 flex items-center justify-center overflow-hidden touch-none select-none"
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={handleDoubleTap}
                >
                    <motion.img
                        key={currentIndex}
                        src={images[currentIndex]}
                        alt={`${alt} ${currentIndex + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            scale: scale,
                            x: translate.x,
                            y: translate.y,
                        }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="max-w-full max-h-full object-contain"
                        draggable={false}
                    />
                </div>

                {/* Navigation arrows (desktop) */}
                {images.length > 1 ? (
                    <>
                        {currentIndex > 0 ? (
                            <button
                                onClick={goPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-colors"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        ) : null}
                        {currentIndex < images.length - 1 ? (
                            <button
                                onClick={goNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-colors"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        ) : null}
                    </>
                ) : null}

                {/* Thumbnail strip */}
                {images.length > 1 ? (
                    <div className="flex justify-center gap-2 p-4">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => { resetZoom(); setCurrentIndex(i); }}
                                className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${i === currentIndex ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"}`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                ) : null}
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
