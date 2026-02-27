import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Banner {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    bg_color: string;
}

export function useBanners() {
    return useQuery({
        queryKey: ["banners"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("banners")
                .select("*")
                .eq("active", true)
                .order("sort_order");
            if (error) throw error;
            return (data || []) as Banner[];
        },
        staleTime: 10 * 60 * 1000,
    });
}
