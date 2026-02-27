import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Product } from "@/types/product";

interface WishlistContextType {
    items: Product[];
    toggle: (product: Product) => void;
    isWished: (id: string) => boolean;
    count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Product[]>(() => {
        try {
            const saved = localStorage.getItem("profit_wishlist");
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const toggle = useCallback((product: Product) => {
        setItems((prev) => {
            const exists = prev.some((p) => p.id === product.id);
            const next = exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
            localStorage.setItem("profit_wishlist", JSON.stringify(next));
            return next;
        });
    }, []);

    const wishedIds = useMemo(() => new Set(items.map(p => p.id)), [items]);
    const isWished = useCallback((id: string) => wishedIds.has(id), [wishedIds]);

    return (
        <WishlistContext.Provider value={{ items, toggle, isWished, count: items.length }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}
