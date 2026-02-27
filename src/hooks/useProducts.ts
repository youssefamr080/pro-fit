import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct } from "@/lib/productUtils";
import type { Product } from "@/types/product";

export function useAllProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("active", true)
                .order("sort_order");
            if (error) throw error;
            return (data || []).map(mapProduct);
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useProductsByCategory(category: string) {
    return useQuery({
        queryKey: ["products", "category", category],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("category", category)
                .eq("active", true)
                .order("sort_order");
            if (error) throw error;
            return (data || []).map(mapProduct);
        },
        enabled: !!category,
        staleTime: 5 * 60 * 1000,
    });
}

export function useProductById(id: string) {
    return useQuery({
        queryKey: ["products", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .maybeSingle();
            if (error) throw error;
            return data ? mapProduct(data) : null;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useFeaturedProducts() {
    return useQuery({
        queryKey: ["products", "featured"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("active", true)
                .contains("tags", ["الأكثر مبيعاً"])
                .order("sort_order")
                .limit(4);
            if (error) throw error;
            return (data || []).map(mapProduct);
        },
        staleTime: 5 * 60 * 1000,
    });
}
