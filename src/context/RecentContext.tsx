import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types/product";

const MAX = 10;

interface RecentContextType {
    recents: Product[];
    addRecent: (product: Product) => void;
}

const RecentContext = createContext<RecentContextType | null>(null);

export function RecentProvider({ children }: { children: React.ReactNode }) {
    const [recents, setRecents] = useState<Product[]>(() => {
        try {
            const saved = localStorage.getItem("profit_recents");
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const addRecent = (product: Product) => {
        setRecents((prev) => {
            const filtered = prev.filter((p) => p.id !== product.id);
            const next = [product, ...filtered].slice(0, MAX);
            localStorage.setItem("profit_recents", JSON.stringify(next));
            return next;
        });
    };

    return (
        <RecentContext.Provider value={{ recents, addRecent }}>
            {children}
        </RecentContext.Provider>
    );
}

export function useRecent() {
    const ctx = useContext(RecentContext);
    if (!ctx) throw new Error("useRecent must be used within RecentProvider");
    return ctx;
}
