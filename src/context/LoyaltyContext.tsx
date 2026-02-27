import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/context/CustomerContext";
import { toast } from "@/hooks/use-toast";

interface LoyaltySettings {
    points_per_currency: number;
    redemption_rate: number; // e.g. 10 = every 100 points = 10 EGP
    min_points_redeem: number;
    active: boolean;
}

interface LoyaltyTransaction {
    id: string;
    points: number;
    type: string;
    description: string;
    created_at: string;
}

interface LoyaltyContextType {
    points: number;
    settings: LoyaltySettings | null;
    transactions: LoyaltyTransaction[];
    loading: boolean;
    earnPoints: (orderTotal: number, orderId: string) => Promise<void>;
    redeemPoints: (pointsToRedeem: number, orderId: string) => Promise<boolean>;
    getDiscountForPoints: (pts: number) => number;
    refresh: () => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | null>(null);

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
    const { customer } = useCustomer();
    const [points, setPoints] = useState(0);
    const [settings, setSettings] = useState<LoyaltySettings | null>(null);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("loyalty_settings")
                .select("*")
                .eq("active", true)
                .limit(1)
                .maybeSingle();
            if (error) throw error;
            if (data) {
                setSettings({
                    points_per_currency: Number(data.points_per_currency),
                    redemption_rate: Number(data.redemption_rate),
                    min_points_redeem: data.min_points_redeem,
                    active: data.active,
                });
            }
        } catch {
            // Settings fetch failure is non-critical — loyalty just won't be available
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!customer) {
            setPoints(0);
            setTransactions([]);
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            // Get current points from customer record
            const { data: cust, error: custErr } = await supabase
                .from("customers")
                .select("loyalty_points")
                .eq("id", customer.id)
                .maybeSingle();
            if (custErr) throw custErr;
            setPoints(cust?.loyalty_points || 0);

            // Get transactions
            const { data: txns, error: txnErr } = await supabase
                .from("loyalty_transactions")
                .select("*")
                .eq("customer_id", customer.id)
                .order("created_at", { ascending: false })
                .limit(50);
            if (txnErr) throw txnErr;
            setTransactions(
                (txns || []).map((t: any) => ({
                    id: t.id,
                    points: t.points,
                    type: t.type,
                    description: t.description,
                    created_at: t.created_at,
                }))
            );
        } catch {
            toast({ title: "خطأ في تحميل بيانات الولاء", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [customer]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const earnPoints = useCallback(async (orderTotal: number, orderId: string) => {
        if (!customer || !settings) return;
        const earned = Math.floor(orderTotal * settings.points_per_currency);
        if (earned <= 0) return;

        try {
            const { error: insertErr } = await supabase.from("loyalty_transactions").insert({
                customer_id: customer.id,
                points: earned,
                type: "earn",
                order_id: orderId,
                description: `كسب ${earned} نقطة من طلب بقيمة ${orderTotal} ج.م`,
            });
            if (insertErr) throw insertErr;

            const newTotal = points + earned;
            const { error: updateErr } = await supabase
                .from("customers")
                .update({ loyalty_points: newTotal })
                .eq("id", customer.id);
            if (updateErr) throw updateErr;
            setPoints(newTotal);
        } catch {
            toast({ title: "خطأ في إضافة النقاط", variant: "destructive" });
        }
    }, [customer, settings, points]);

    const redeemPoints = useCallback(async (pointsToRedeem: number, orderId: string): Promise<boolean> => {
        if (!customer || !settings) return false;
        if (pointsToRedeem > points || pointsToRedeem < settings.min_points_redeem) return false;

        const discount = getDiscountForPoints(pointsToRedeem);

        try {
            const { error: insertErr } = await supabase.from("loyalty_transactions").insert({
                customer_id: customer.id,
                points: -pointsToRedeem,
                type: "redeem",
                order_id: orderId,
                description: `استبدال ${pointsToRedeem} نقطة بخصم ${discount} ج.م`,
            });
            if (insertErr) throw insertErr;

            const newTotal = points - pointsToRedeem;
            const { error: updateErr } = await supabase
                .from("customers")
                .update({ loyalty_points: newTotal })
                .eq("id", customer.id);
            if (updateErr) throw updateErr;
            setPoints(newTotal);
            return true;
        } catch {
            toast({ title: "خطأ في استبدال النقاط", variant: "destructive" });
            return false;
        }
    }, [customer, settings, points]);

    const getDiscountForPoints = useCallback((pts: number) => {
        if (!settings) return 0;
        return Math.floor(pts / 100) * settings.redemption_rate;
    }, [settings]);

    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return (
        <LoyaltyContext.Provider value={{ points, settings, transactions, loading, earnPoints, redeemPoints, getDiscountForPoints, refresh }}>
            {children}
        </LoyaltyContext.Provider>
    );
}

export function useLoyalty() {
    const ctx = useContext(LoyaltyContext);
    if (!ctx) throw new Error("useLoyalty must be used within LoyaltyProvider");
    return ctx;
}
