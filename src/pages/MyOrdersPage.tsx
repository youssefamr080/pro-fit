import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ChevronLeft, ShoppingBag } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { useCustomer } from "@/context/CustomerContext";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderItem } from "@/types/order";
import { STATUS_MAP } from "@/types/order";

export default function MyOrdersPage() {
    const { customer } = useCustomer();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customer) return;
        (async () => {
            const { data } = await supabase
                .from("orders")
                .select("*")
                .eq("customer_id", customer.id)
                .order("created_at", { ascending: false });
            if (data) setOrders(data.map(o => ({ ...o, items: (o.items as unknown as OrderItem[]) || [] })));
            setLoading(false);
        })();
    }, [customer]);

    if (!customer) {
        return (
            <PageTransition>
                <div className="font-cairo min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">سجّل دخولك لعرض طلباتك</p>
                    <Link to="/login" className="bg-foreground text-background px-6 py-2.5 rounded-xl text-sm font-bold">
                        تسجيل الدخول
                    </Link>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <SEO title="طلباتي" description="تتبع جميع طلباتك من PRO FIT" />
            <div className="font-cairo min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                    <Package className="h-5 w-5" />
                    <h1 className="text-lg font-black">طلباتي</h1>
                    <span className="text-xs text-muted-foreground mr-auto">{orders.length} طلب</span>
                </div>

                {loading ? (
                    <div className="space-y-0 divide-y divide-border">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1.5">
                                        <div className="h-3 w-28 bg-secondary rounded relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                        <div className="h-2 w-16 bg-secondary rounded relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                    </div>
                                    <div className="h-5 w-20 bg-secondary rounded-full relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                </div>
                                {[1, 2].map(j => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary rounded relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                        <div className="flex-1 space-y-1">
                                            <div className="h-3 w-3/4 bg-secondary rounded relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                            <div className="h-2 w-1/2 bg-secondary rounded relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                        </div>
                                        <div className="h-3 w-12 bg-secondary rounded relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div className="h-3 w-24 bg-secondary rounded relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                    <div className="h-4 w-16 bg-secondary rounded relative overflow-hidden"><div className="absolute inset-0 shimmer-placeholder" /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-28 px-6 text-center"
                    >
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-[#389a9c]/10 dark:bg-[#389a9c]/20 rounded-full blur-2xl scale-150" />
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="relative bg-background border border-border/50 shadow-sm p-5 rounded-full"
                            >
                                <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                            </motion.div>
                        </div>
                        <p className="text-lg font-black mb-2">لا توجد طلبات بعد!</p>
                        <p className="text-sm text-muted-foreground mb-8 max-w-xs">يبدو أنك لم تقم بأي عملية شراء حتى الآن. ابدأ التسوق الآن واكتشف أحدث العروض.</p>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Link to="/" className="bg-foreground text-background px-8 py-3 rounded-xl font-bold text-sm shadow-md">
                                تسوق الآن
                            </Link>
                        </motion.div>
                    </motion.div>
                ) : (
                    <div className="divide-y divide-border">
                        {orders.map((order, idx) => {
                            const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
                            const parsedItems: OrderItem[] = Array.isArray(order.items)
                                ? order.items
                                : typeof order.items === "string"
                                    ? JSON.parse(order.items)
                                    : [];
                            return (
                                <Link key={order.id} to={`/order-tracking/${order.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-4 space-y-3 hover:bg-secondary/30 transition-colors cursor-pointer">

                                        {/* Order header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString("ar-EG", {
                                                        year: "numeric", month: "long", day: "numeric"
                                                    })}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60 font-mono">
                                                    #{order.id.slice(0, 8)}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.color}`}>
                                                {st.label}
                                            </span>
                                        </div>

                                        {/* Items preview */}
                                        <div className="space-y-2">
                                            {parsedItems.slice(0, 3).map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm">
                                                    <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-xs font-bold">
                                                        x{item.quantity}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold truncate">{item.title}</p>
                                                        <p className="text-[10px] text-muted-foreground">{item.size} · {item.color}</p>
                                                    </div>
                                                    <span className="text-xs font-bold whitespace-nowrap">{item.price} ج.م</span>
                                                </div>
                                            ))}
                                            {parsedItems.length > 3 && (
                                                <p className="text-[10px] text-muted-foreground">+{parsedItems.length - 3} منتجات أخرى</p>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                            <div className="text-xs text-muted-foreground">
                                                {order.delivery_city && <span>{order.delivery_city} · </span>}
                                                {order.payment_method === "cod" ? "دفع عند الاستلام" : order.payment_method}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black">{order.total} ج.م</span>
                                                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
