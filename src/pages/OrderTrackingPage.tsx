import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, Home, Clock, ChevronRight, MessageCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { useCustomer } from "@/context/CustomerContext";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderItem } from "@/types/order";

const STATUS_STEPS = [
    { key: "pending", icon: CheckCircle, label: "تم استلام الطلب", desc: "تم تأكيد طلبك بنجاح" },
    { key: "confirmed", icon: Package, label: "جاري التجهيز", desc: "يتم تجهيز منتجاتك" },
    { key: "shipping", icon: Truck, label: "في الطريق إليك", desc: "الطلب مع المندوب" },
    { key: "delivered", icon: Home, label: "تم التسليم", desc: "وصل طلبك بنجاح" },
];

function getStepIndex(status: string): number {
    const idx = STATUS_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
}

export default function OrderTrackingPage() {
    const { customer } = useCustomer();
    const { orderId } = useParams<{ orderId?: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customer) { setLoading(false); return; }

        (async () => {
            let query = supabase
                .from("orders")
                .select("*")
                .eq("customer_id", customer.id)
                .order("created_at", { ascending: false });

            if (orderId) {
                query = query.eq("id", orderId);
            }

            const { data } = await query.limit(1).maybeSingle();
            if (data) {
                setOrder({ ...data, items: (data.items as unknown as OrderItem[]) || [] });
            }
            setLoading(false);
        })();
    }, [customer, orderId]);

    if (loading) {
        return (
            <PageTransition>
                <div className="font-cairo pb-20 px-4 pt-8">
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-11 h-11 rounded-full bg-secondary relative overflow-hidden">
                                    <div className="absolute inset-0 shimmer-placeholder" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-secondary rounded w-1/2 relative overflow-hidden">
                                        <div className="absolute inset-0 shimmer-placeholder" />
                                    </div>
                                    <div className="h-3 bg-secondary rounded w-3/4 relative overflow-hidden">
                                        <div className="absolute inset-0 shimmer-placeholder" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (!order) {
        return (
            <PageTransition>
                <div className="font-cairo min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-bold mb-1">لا يوجد طلب لتتبعه</p>
                    <p className="text-xs text-muted-foreground mb-4">ابدأ التسوق وضع أول طلب لك!</p>
                    <Link to="/" className="bg-foreground text-background px-6 py-2.5 rounded-xl text-sm font-bold">
                        تسوق الآن
                    </Link>
                </div>
            </PageTransition>
        );
    }

    const currentStep = getStepIndex(order.status);
    const orderDate = new Date(order.created_at).toLocaleDateString("ar-EG", {
        year: "numeric", month: "long", day: "numeric",
    });

    return (
        <PageTransition>
            <div className="font-cairo pb-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center pt-8 pb-6"
                >
                    <p className="text-xs text-muted-foreground mb-1">رقم الطلب</p>
                    <h1 className="text-2xl font-black font-mono">#{order.id.slice(0, 8)}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{orderDate}</p>
                </motion.div>

                {/* Timeline */}
                <div className="relative mb-12">
                    {/* Background vertical line */}
                    <div className="absolute right-[22px] top-6 bottom-6 w-0.5 bg-border rounded-full" />
                    {/* Active vertical line filler */}
                    <motion.div
                        className="absolute right-[22px] top-6 w-0.5 bg-foreground rounded-full"
                        initial={{ height: 0 }}
                        animate={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    {STATUS_STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const isDone = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                            <motion.div
                                key={s.key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.18 }}
                                className="flex gap-4 mb-8 relative z-10"
                            >
                                {/* icon */}
                                <motion.div
                                    animate={isDone ? { scale: [1, 1.15, 1] } : {}}
                                    transition={{ delay: i * 0.2, duration: 0.5 }}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${isCurrent ? "bg-foreground border-foreground text-background shadow-lg shadow-foreground/20" :
                                        isDone ? "bg-foreground border-foreground text-background" :
                                            "bg-background border-border text-muted-foreground"
                                        }`}
                                >
                                    {isDone && !isCurrent ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </motion.div>
                                {/* content */}
                                <div className="flex-1 pt-1.5">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-black ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                                            {s.label}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                                    {isCurrent && order.status !== "delivered" && (
                                        <motion.div
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="inline-flex items-center gap-1 mt-2 text-xs font-bold bg-secondary px-2 py-1"
                                        >
                                            <span className="w-2 h-2 bg-orange-400 rounded-full" />
                                            الحالة الحالية
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Order summary */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="border border-border p-4 space-y-3"
                >
                    <p className="text-sm font-black">ملخص الطلب</p>
                    {(Array.isArray(order.items) ? order.items : typeof order.items === 'string' ? JSON.parse(order.items) : []).map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-bold bg-secondary px-1.5 py-0.5 rounded text-[10px]">x{item.quantity}</span>
                                <span className="truncate max-w-[180px]">{item.title}</span>
                            </div>
                            <span className="font-bold whitespace-nowrap">{item.price} ج.م</span>
                        </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-border text-sm font-black">
                        <span>الإجمالي</span>
                        <span>{order.total} ج.م</span>
                    </div>
                    {order.delivery_address && (
                        <p className="text-[10px] text-muted-foreground">
                            التوصيل: {order.delivery_city ? `${order.delivery_city} — ` : ""}{order.delivery_address}
                        </p>
                    )}
                </motion.div>

                {/* WhatsApp support */}
                <motion.a
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    href={`https://wa.me/201550525643?text=${encodeURIComponent(`استفسار عن طلب رقم #${order.id.slice(0, 8)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full border border-border py-3 text-sm font-bold mt-4"
                >
                    <MessageCircle className="h-4 w-4" /> تواصل معنا على واتساب
                </motion.a>
            </div>
        </PageTransition >
    );
}
