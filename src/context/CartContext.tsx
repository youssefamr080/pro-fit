import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { CartItem, Product } from "@/types/product";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "profit_cart";
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, size: string, color: string, flashPrice?: number) => void;
    removeItem: (productId: string, size: string, color: string) => void;
    updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];
        const { items, timestamp } = JSON.parse(saved);
        // Expire cart after 7 days
        if (timestamp && Date.now() - timestamp > CART_TTL_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
        return Array.isArray(items) ? items : JSON.parse(saved); // backward compat
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, timestamp: Date.now() }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(loadCart);

    // Persist whenever items change
    useEffect(() => {
        saveCart(items);
    }, [items]);

    const addItem = useCallback(
        (product: Product, size: string, color: string, flashPrice?: number) => {
            setItems((prev) => {
                const idx = prev.findIndex(
                    (i) => i.product.id === product.id && i.size === size && i.color === color
                );
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
                    return next;
                }
                return [...prev, { product, size, color, quantity: 1, flashPrice }];
            });
            toast({ title: "تمت الإضافة", description: `${product.title} أُضيف إلى السلة` });
        },
        []
    );

    const removeItem = useCallback((productId: string, size: string, color: string) => {
        setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size && i.color === color)));
        toast({ title: "تمت الإزالة", description: "تم حذف المنتج من السلة" });
    }, []);

    const updateQuantity = useCallback(
        (productId: string, size: string, color: string, qty: number) => {
            if (qty <= 0) {
                removeItem(productId, size, color);
                return;
            }
            setItems((prev) =>
                prev.map((i) =>
                    i.product.id === productId && i.size === size && i.color === color
                        ? { ...i, quantity: qty }
                        : i
                )
            );
        },
        [removeItem]
    );

    const clearCart = useCallback(() => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
    const totalPrice = useMemo(
        () => items.reduce(
            (s, i) => s + (i.flashPrice ?? i.product.sale_price ?? i.product.price) * i.quantity,
            0
        ),
        [items]
    );

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
