import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FlashSale {
    id: string;
    product_id: string;
    flash_price: number;
    starts_at: string;
    ends_at: string;
}

/** Fetches all currently-active flash sales (within start/end window, active=true) */
export function useFlashSales() {
    return useQuery<FlashSale[]>({
        queryKey: ["flash_sales"],
        queryFn: async () => {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from<any, any>("flash_sales")
                .select("id, product_id, flash_price, starts_at, ends_at")
                .eq("active", true)
                .lte("starts_at", now)
                .gte("ends_at", now);
            if (error) throw error;
            return (data || []).map((s: any) => ({
                id: s.id,
                product_id: s.product_id,
                flash_price: Number(s.flash_price),
                starts_at: s.starts_at,
                ends_at: s.ends_at,
            }));
        },
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000, // re-check every 30s so expired sales disappear
    });
}

/** O(1) product_id → FlashSale lookup map */
export function useFlashSaleMap(): Map<string, FlashSale> {
    const { data = [] } = useFlashSales();
    return useMemo(() => new Map(data.map(s => [s.product_id, s])), [data]);
}

export function getFlashSaleForProduct(sales: FlashSale[], productId: string): FlashSale | undefined {
    return sales.find(s => s.product_id === productId);
}
