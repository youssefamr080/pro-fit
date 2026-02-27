import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShippingRate {
    id: string;
    governorate: string;
    shipping_cost: number;
    delivery_days: string;
}

/**
 * Fetches all active shipping rates from Supabase.
 * Returns governorate list with costs and delivery estimates.
 */
export function useShippingRates() {
    return useQuery<ShippingRate[]>({
        queryKey: ["shipping_rates"],
        queryFn: async () => {
            // @ts-expect-error: shipping_rates table exists but types not yet generated
            const { data, error } = await supabase.from("shipping_rates")
                .select("*")
                .eq("active", true)
                .order("sort_order");
            if (error) throw error;
            return (data || []).map((r: any) => ({
                id: r.id,
                governorate: r.governorate,
                shipping_cost: Number(r.shipping_cost),
                delivery_days: r.delivery_days,
            }));
        },
        staleTime: 1000 * 60 * 30, // Cache for 30 min — rates rarely change
    });
}

/**
 * Get shipping cost for a specific governorate.
 */
export function getShippingCost(rates: ShippingRate[], governorate: string): number {
    const rate = rates.find(r => r.governorate === governorate);
    return rate?.shipping_cost ?? 0;
}

/**
 * Get delivery estimate for a specific governorate.
 */
export function getDeliveryDays(rates: ShippingRate[], governorate: string): string {
    const rate = rates.find(r => r.governorate === governorate);
    return rate?.delivery_days ?? "";
}
