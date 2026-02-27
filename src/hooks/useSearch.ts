import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct } from "@/lib/productUtils";
import type { Product } from "@/types/product";
import Fuse from "fuse.js";

/**
 * Server-side search with client-side fuzzy search on top
 */
export function useSearchProducts(query: string, limit = 20) {
    const q = query.trim();

    return useQuery<Product[]>({
        queryKey: ["search", q],
        queryFn: async () => {
            if (!q) return [];

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("active", true)
                .order("sort_order");

            if (error) throw error;
            const allProducts = (data || []).map(mapProduct);

            const fuse = new Fuse(allProducts, {
                keys: [
                    { name: 'title', weight: 2 },
                    { name: 'tags', weight: 1.5 },
                    { name: 'category', weight: 1 },
                    { name: 'description', weight: 0.5 }
                ],
                threshold: 0.4, // 0.0 is perfect match, 1.0 matches anything
                ignoreLocation: true,
                minMatchCharLength: 2
            });

            const results = fuse.search(q);
            return results.map(r => r.item).slice(0, limit);
        },
        enabled: q.length >= 2,
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}

/**
 * Quick header autocomplete with fuzzy search
 */
export function useHeaderSearch(query: string) {
    const q = query.trim();

    return useQuery<Product[]>({
        queryKey: ["header-search", q],
        queryFn: async () => {
            if (!q) return [];

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("active", true)
                .order("sort_order");

            if (error) throw error;
            const allProducts = (data || []).map(mapProduct);

            const fuse = new Fuse(allProducts, {
                keys: [
                    { name: 'title', weight: 2 },
                    { name: 'tags', weight: 1.5 },
                    { name: 'category', weight: 1 }
                ],
                threshold: 0.4,
                ignoreLocation: true,
                minMatchCharLength: 2
            });

            return fuse.search(q).map(r => r.item).slice(0, 5);
        },
        enabled: q.length >= 2,
        staleTime: 30_000,
    });
}
