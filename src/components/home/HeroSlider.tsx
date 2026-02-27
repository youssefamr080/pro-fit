import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useBanners } from "@/hooks/useBanners";

export default function HeroSlider() {
    const { data: slides = [] } = useBanners();
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => {
        if (slides.length === 0) return;
        setCurrent((c) => (c + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;
        const id = setInterval(next, 4000);
        return () => clearInterval(id);
    }, [next, slides.length]);

    const touchStartX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) setCurrent(c => (c + 1) % slides.length);
            else setCurrent(c => (c - 1 + slides.length) % slides.length);
        }
    };

    if (slides.length === 0) {
        return <div className="w-full h-[85vh] bg-secondary animate-pulse" />;
    }

    const slide = slides[current];

    return (
        <div
            className="relative w-full h-[85vh] overflow-hidden"
            style={{ backgroundColor: slide.bg_color }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {slide.image ? (
                <>
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                </>
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
                <h1 className="text-5xl md:text-7xl font-black font-cairo text-white mb-4 leading-tight tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                    {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 font-cairo mb-8 max-w-lg mx-auto drop-shadow-md">{slide.subtitle}</p>
                <Link
                    to={slide.cta_link}
                    className="bg-white/90 backdrop-blur-md text-black px-10 py-3.5 rounded-full font-cairo font-black text-sm tracking-widest uppercase hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                    {slide.cta_text}
                </Link>
            </div>

            {slides.length > 1 ? (
                <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-1 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
