import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { Product } from "@/types/product";

interface CompareContextType {
    items: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (id: string) => void;
    isInCompare: (id: string) => boolean;
    clearCompare: () => void;
    count: number;
}

const CompareContext = createContext<CompareContextType>({
    items: [],
    addToCompare: () => { },
    removeFromCompare: () => { },
    isInCompare: () => false,
    clearCompare: () => { },
    count: 0,
});

export const useCompare = () => useContext(CompareContext);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Product[]>([]);

    const addToCompare = useCallback((product: Product) => {
        setItems(prev => {
            if (prev.find(p => p.id === product.id)) return prev;
            if (prev.length >= 4) return prev; // max 4
            return [...prev, product];
        });
    }, []);

    const removeFromCompare = useCallback((id: string) => {
        setItems(prev => prev.filter(p => p.id !== id));
    }, []);

    const compareIds = useMemo(() => new Set(items.map(p => p.id)), [items]);
    const isInCompare = useCallback((id: string) => compareIds.has(id), [compareIds]);

    const clearCompare = useCallback(() => setItems([]), []);

    return (
        <CompareContext.Provider value={{ items, addToCompare, removeFromCompare, isInCompare, clearCompare, count: items.length }}>
            {children}
        </CompareContext.Provider>
    );
}
