import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
}

interface CustomerContextType {
    customer: Customer | null;
    loading: boolean;
    login: (name: string, phone: string, address: string, city: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (data: Partial<Pick<Customer, "name" | "address" | "city">>) => Promise<boolean>;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("profit_customer");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setCustomer(parsed);
            } catch { }
        }
        setLoading(false);
    }, []);

    const persist = (c: Customer | null) => {
        if (c) localStorage.setItem("profit_customer", JSON.stringify(c));
        else localStorage.removeItem("profit_customer");
        setCustomer(c);
    };

    const login = useCallback(async (name: string, phone: string, address: string, city: string): Promise<boolean> => {
        try {
            // Check if phone exists
            const { data: existing } = await supabase
                .from("customers")
                .select("*")
                .eq("phone", phone)
                .maybeSingle();

            if (existing) {
                persist(existing as Customer);
                toast({ title: "مرحباً بعودتك!", description: `أهلاً ${existing.name}` });
                return true;
            }

            // Register new customer
            const { data: newCustomer, error } = await supabase
                .from("customers")
                .insert({ name, phone, address, city })
                .select()
                .single();

            if (error) {
                toast({ title: "حدث خطأ", description: "تعذر إنشاء الحساب", variant: "destructive" });
                return false;
            }

            persist(newCustomer as Customer);
            toast({ title: "تم التسجيل بنجاح! 🎉", description: `مرحباً ${name}` });
            return true;
        } catch {
            toast({ title: "حدث خطأ", description: "تحقق من الاتصال بالإنترنت", variant: "destructive" });
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        persist(null);
        toast({ title: "تم تسجيل الخروج" });
    }, []);

    const updateProfile = useCallback(async (data: Partial<Pick<Customer, "name" | "address" | "city">>): Promise<boolean> => {
        if (!customer) return false;
        try {
            const { error } = await supabase
                .from("customers")
                .update(data)
                .eq("id", customer.id);

            if (error) {
                toast({ title: "حدث خطأ", description: "تعذر تحديث البيانات", variant: "destructive" });
                return false;
            }

            const updated = { ...customer, ...data };
            persist(updated);
            toast({ title: "تم التحديث بنجاح ✓" });
            return true;
        } catch {
            return false;
        }
    }, [customer]);

    return (
        <CustomerContext.Provider value={{ customer, loading, login, logout, updateProfile }}>
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomer() {
    const ctx = useContext(CustomerContext);
    if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
    return ctx;
}
