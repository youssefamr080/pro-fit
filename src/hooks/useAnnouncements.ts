import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Announcement {
    id: string;
    text: string;
    bg_color: string;
    text_color: string;
}

export function useAnnouncements() {
    return useQuery({
        queryKey: ["announcements"],
        queryFn: async () => {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .eq("active", true)
                .order("sort_order");
            if (error) throw error;
            // Filter by schedule
            return (data || [])
                .filter((a: any) => {
                    if (a.starts_at && new Date(a.starts_at) > new Date()) return false;
                    if (a.ends_at && new Date(a.ends_at) < new Date()) return false;
                    return true;
                })
                .map((a: any) => ({
                    id: a.id,
                    text: a.text,
                    bg_color: a.bg_color,
                    text_color: a.text_color,
                })) as Announcement[];
        },
        staleTime: 5 * 60 * 1000,
    });
}
