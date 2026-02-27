import { useState, useEffect, useCallback } from "react";

/**
 * usePullToRefresh — adds pull-to-refresh gesture to any page.
 * Returns a container ref and isRefreshing state.
 * Works by detecting touch pull-down gesture at the top of the page.
 */
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);
    const [pulling, setPulling] = useState(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
            setPulling(true);
        }
    }, []);

    const handleTouchEnd = useCallback(async (e: TouchEvent) => {
        if (!pulling) return;
        const diff = e.changedTouches[0].clientY - startY;
        setPulling(false);
        if (diff > 80 && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
    }, [pulling, startY, isRefreshing, onRefresh]);

    useEffect(() => {
        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchend", handleTouchEnd, { passive: true });
        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd]);

    return { isRefreshing };
}

/**
 * useTheme — dark mode toggle with localStorage persistence.
 */
export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === "undefined") return false;
        const stored = localStorage.getItem("profit_theme");
        if (stored) return stored === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("profit_theme", isDark ? "dark" : "light");
    }, [isDark]);

    const toggle = useCallback(() => setIsDark(prev => !prev), []);

    return { isDark, toggle };
}
