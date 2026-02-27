import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/context/CustomerContext";
import { mapProduct } from "@/lib/productUtils";
import type { Product } from "@/types/product";

export function useRecommendations(currentProductId?: string, limit = 4) {
    const { customer } = useCustomer();

    return useQuery({
        queryKey: ["recommendations", currentProductId, customer?.id],
        queryFn: async () => {
            const allRes = await supabase.from("products").select("*").eq("active", true);
            const allProducts = (allRes.data || []).map(mapProduct);

            if (allProducts.length <= 1) return [];

            const scores = new Map<string, number>();
            const currentProduct = allProducts.find(p => p.id === currentProductId);

            // Initialize all product scores
            allProducts.forEach(p => {
                if (p.id !== currentProductId) scores.set(p.id, 0);
            });

            // 1. Same category boost (content-based)
            if (currentProduct) {
                allProducts.forEach(p => {
                    if (p.id === currentProductId) return;
                    if (p.category === currentProduct.category) {
                        scores.set(p.id, (scores.get(p.id) || 0) + 3);
                    }
                });
            }

            // 2. Customer purchase history (collaborative)
            if (customer) {
                const { data: orders } = await supabase
                    .from("orders")
                    .select("items")
                    .eq("customer_id", customer.id);

                if (orders) {
                    const purchasedCategories = new Set<string>();
                    const purchasedIds = new Set<string>();
                    orders.forEach((o: any) => {
                        const items = Array.isArray(o.items) ? o.items : [];
                        items.forEach((item: any) => {
                            if (item.id) purchasedIds.add(item.id);
                        });
                    });

                    // Find categories of purchased products
                    allProducts.forEach(p => {
                        if (purchasedIds.has(p.id)) purchasedCategories.add(p.category);
                    });

                    // Boost products in purchased categories (cross-sell)
                    allProducts.forEach(p => {
                        if (p.id === currentProductId || purchasedIds.has(p.id)) return;
                        if (purchasedCategories.has(p.category)) {
                            scores.set(p.id, (scores.get(p.id) || 0) + 2);
                        }
                    });
                }

                // 3. Viewed products boost
                const { data: views } = await supabase
                    .from("product_views")
                    .select("product_id")
                    .eq("customer_id", customer.id)
                    .order("viewed_at", { ascending: false })
                    .limit(20);

                if (views) {
                    const viewedCategories = new Set<string>();
                    views.forEach((v: any) => {
                        const p = allProducts.find(pr => pr.id === v.product_id);
                        if (p) viewedCategories.add(p.category);
                    });

                    allProducts.forEach(p => {
                        if (p.id === currentProductId) return;
                        if (viewedCategories.has(p.category)) {
                            scores.set(p.id, (scores.get(p.id) || 0) + 1);
                        }
                    });
                }
            }

            // 4. Best sellers boost
            allProducts.forEach(p => {
                if (p.id === currentProductId) return;
                if (p.tags.includes("الأكثر مبيعاً")) {
                    scores.set(p.id, (scores.get(p.id) || 0) + 1);
                }
            });

            // 5. Sale items slight boost
            allProducts.forEach(p => {
                if (p.id === currentProductId) return;
                if (p.sale_price != null) {
                    scores.set(p.id, (scores.get(p.id) || 0) + 0.5);
                }
            });

            // Sort by score and return top N
            const sorted = [...scores.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([id]) => allProducts.find(p => p.id === id)!)
                .filter(Boolean);

            return sorted;
        },
        staleTime: 5 * 60 * 1000,
    });
}
