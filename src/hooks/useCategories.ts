import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
    id: string;
    slug: string;
    name: string;
    color: string;
    image: string | null;
}

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("active", true)
                .order("sort_order");
            if (error) throw error;
            return (data || []) as Category[];
        },
        staleTime: 10 * 60 * 1000,
    });
}
