import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/context/CustomerContext";
import { toast } from "@/hooks/use-toast";

interface Notification {
    id: string;
    customer_id: string;
    title: string;
    body: string;
    type: string;
    read: boolean;
    data: Record<string, unknown> | null;
    created_at: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllRead: () => void;
    refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: () => { },
    markAllRead: () => { },
    refresh: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { customer } = useCustomer();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const refresh = useCallback(async () => {
        if (!customer) { setNotifications([]); return; }
        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("customer_id", customer.id)
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            if (data) setNotifications(data as Notification[]);
        } catch {
            toast({ title: "خطأ في تحميل الإشعارات", variant: "destructive" });
        }
    }, [customer]);

    useEffect(() => { refresh(); }, [refresh]);

    // Realtime subscription
    useEffect(() => {
        if (!customer) return;
        const channel = supabase
            .channel("notifications")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
                const n = payload.new as Notification;
                if (n.customer_id === customer.id) {
                    setNotifications(prev => [n, ...prev]);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [customer]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
            if (error) throw error;
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch {
            toast({ title: "خطأ في تحديث الإشعار", variant: "destructive" });
        }
    };

    const markAllRead = async () => {
        if (!customer) return;
        try {
            const { error } = await supabase.from("notifications").update({ read: true }).eq("customer_id", customer.id).eq("read", false);
            if (error) throw error;
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch {
            toast({ title: "خطأ في تحديث الإشعارات", variant: "destructive" });
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, refresh }}>
            {children}
        </NotificationContext.Provider>
    );
}
