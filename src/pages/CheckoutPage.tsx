import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useLoyalty } from "@/context/LoyaltyContext";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import AddressStep from "@/components/checkout/AddressStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import ConfirmStep from "@/components/checkout/ConfirmStep";
import { useShippingRates, getShippingCost } from "@/hooks/useShippingRates";

type Step = "address" | "payment" | "confirm";

const STEPS: { key: Step; label: string }[] = [
    { key: "address", label: "العنوان" },
    { key: "payment", label: "الدفع" },
    { key: "confirm", label: "التأكيد" },
];

interface AppliedCoupon {
    code: string;
    discount_type: string;
    discount_value: number;
}

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { customer } = useCustomer();
    const { points, settings, earnPoints, redeemPoints, getDiscountForPoints } = useLoyalty();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: shippingRates = [], isLoading: shippingLoading } = useShippingRates();

    const [step, setStep] = useState<Step>("address");
    const [form, setForm] = useState({ name: "", phone: "", city: "", address: "", notes: "" });
    const [payMethod, setPayMethod] = useState("cod");
    const [ordered, setOrdered] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [addressMode, setAddressMode] = useState<"default" | "temp" | "permanent">("default");
    const [usePoints, setUsePoints] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);

    // Coupon state
    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

    // Auto-fill from customer data
    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name,
                phone: customer.phone,
                city: customer.city || "",
                address: customer.address,
                notes: "",
            });
        }
    }, [customer]);

    // Redirect if not logged in (declarative)
    if (!customer) {
        return <Navigate to="/login" replace />;
    }

    const stepIndex = STEPS.findIndex((s) => s.key === step);
    const isAddressChanged = form.address !== customer.address || form.city !== (customer.city || "");

    // Calculate discounts + shipping
    const shippingCost = getShippingCost(shippingRates, form.city);
    const discountAmount = appliedCoupon
        ? appliedCoupon.discount_type === "percentage"
            ? Math.round(totalPrice * appliedCoupon.discount_value / 100)
            : Math.min(appliedCoupon.discount_value, totalPrice)
        : 0;
    const loyaltyDiscount = usePoints ? getDiscountForPoints(pointsToRedeem) : 0;
    const finalPrice = totalPrice - discountAmount - loyaltyDiscount + shippingCost;

    const validatePhone = (phone: string) => /^01[0125][0-9]{8}$/.test(phone);

    const applyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) return;
        setCouponLoading(true);
        setCouponError("");

        const { data } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code)
            .eq("active", true)
            .maybeSingle();

        if (!data) { setCouponError("كود الخصم غير صالح أو منتهي"); setCouponLoading(false); return; }
        if (data.expires_at && new Date(data.expires_at) < new Date()) { setCouponError("كود الخصم منتهي الصلاحية"); setCouponLoading(false); return; }
        if (data.max_uses && data.used_count >= data.max_uses) { setCouponError("تم استخدام هذا الكود الحد الأقصى من المرات"); setCouponLoading(false); return; }
        if (data.min_order && totalPrice < Number(data.min_order)) { setCouponError(`الحد الأدنى للطلب ${data.min_order} ج.م`); setCouponLoading(false); return; }

        setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: Number(data.discount_value) });
        setCouponLoading(false);
    };

    const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(""); setCouponError(""); };

    const handleAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePhone(form.phone)) { toast({ title: "رقم الهاتف غير صحيح", description: "أدخل رقم هاتف مصري صحيح (01XXXXXXXXX)", variant: "destructive" }); return; }
        if (form.name.trim().length < 3) { toast({ title: "الاسم قصير جداً", description: "أدخل الاسم بالكامل", variant: "destructive" }); return; }
        if (form.address.trim().length < 10) { toast({ title: "العنوان غير مكتمل", description: "أدخل عنوان تفصيلي يشمل الشارع والمبنى", variant: "destructive" }); return; }
        setStep("payment");
    };

    const handleConfirm = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            // Stock validation (variant-level)
            for (const item of items) {
                const { data: product } = await supabase.from("products").select("stock,variants,title").eq("id", item.product.id).maybeSingle();
                if (!product) {
                    toast({ title: "خطأ", description: `المنتج "${item.product.title}" غير موجود`, variant: "destructive" });
                    setSubmitting(false);
                    return;
                }
                // Check variant-level stock
                const variants = (product.variants || []) as Array<{ size: string; color: string; colorHex: string; stock: number }>;
                const variant = variants.find(v => v.size === item.size && v.color === item.color);
                const availableStock = variant?.stock ?? product.stock;
                if (availableStock < item.quantity) {
                    toast({ title: "نفاد الكمية", description: `"${product.title}" (${item.size} · ${item.color}) — متبقي ${availableStock} فقط`, variant: "destructive" });
                    setSubmitting(false);
                    return;
                }
            }

            const orderData = {
                customer_id: customer.id,
                items: JSON.stringify(items.map(i => ({ product_id: i.product.id, title: i.product.title, category: i.product.category, size: i.size, color: i.color, quantity: i.quantity, price: i.flashPrice ?? i.product.sale_price ?? i.product.price, image: i.product.images?.[0] || "" }))),
                total: finalPrice,
                shipping_cost: shippingCost,
                payment_method: payMethod,
                delivery_name: form.name,
                delivery_phone: form.phone,
                delivery_address: form.address,
                delivery_city: form.city,
                delivery_notes: form.notes || "",
                coupon_code: appliedCoupon?.code || null,
                coupon_discount: appliedCoupon?.discount_value || 0,
            };

            const { data: orderResult, error: orderError } = await supabase.from("orders").insert(orderData).select("id").single();
            if (orderError) throw orderError;
            const orderId = orderResult?.id;

            // Decrement stock (both product.stock AND variant-level)
            for (const item of items) {
                const { data: current } = await supabase.from("products").select("stock,variants").eq("id", item.product.id).maybeSingle();
                if (current) {
                    const newStock = Math.max(0, current.stock - item.quantity);
                    const variants = (current.variants || []) as Array<{ size: string; color: string; colorHex: string; stock: number }>;
                    const updatedVariants = variants.map(v => {
                        if (v.size === item.size && v.color === item.color) {
                            return { ...v, stock: Math.max(0, (v.stock ?? 0) - item.quantity) };
                        }
                        return v;
                    });
                    await supabase.from("products").update({ stock: newStock, variants: updatedVariants }).eq("id", item.product.id);
                }
            }

            // Update coupon usage
            if (appliedCoupon) {
                const { data: coupon } = await supabase.from("coupons").select("used_count").eq("code", appliedCoupon.code).maybeSingle();
                if (coupon) await supabase.from("coupons").update({ used_count: (coupon.used_count || 0) + 1 }).eq("code", appliedCoupon.code);
            }

            // Loyalty points
            if (usePoints && pointsToRedeem > 0 && orderId) await redeemPoints(pointsToRedeem, orderId);
            if (orderId) await earnPoints(finalPrice, orderId);

            // Update address if permanent
            if (addressMode === "permanent" && isAddressChanged) {
                await supabase.from("customers").update({ address: form.address, city: form.city }).eq("id", customer.id);
                localStorage.setItem("profit_customer", JSON.stringify({ ...customer, address: form.address, city: form.city }));
            }

            // Create notification
            await supabase.from("notifications").insert({ customer_id: customer.id, title: "تم تأكيد طلبك!", body: `طلبك بقيمة ${finalPrice} ج.م قيد المراجعة الآن`, type: "order" });

            setOrdered(true);
            clearCart();
            setTimeout(() => navigate("/my-orders"), 2000);
        } catch {
            toast({ title: "حدث خطأ", description: "لم نتمكن من إتمام الطلب. حاول مرة أخرى.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success screen ──
    if (ordered) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 font-cairo text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-black mb-2">
                    تم تأكيد طلبك! 🎉
                </motion.h2>
                <p className="text-sm text-muted-foreground">جارٍ تحويلك لصفحة طلباتي...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <SEO title="إتمام الشراء" description="أكمل طلبك من PRO FIT — شحن سريع ودفع عند الاستلام" />
            <div className="font-cairo pb-32">
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 px-6 py-4 border-b border-border">
                    {STEPS.map((s, i) => {
                        const done = i < stepIndex;
                        const active = i === stepIndex;
                        return (
                            <div key={s.key} className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 ${active ? "text-foreground" : done ? "text-foreground/60" : "text-muted-foreground"}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-colors ${active ? "border-foreground bg-foreground text-background" : done ? "border-foreground/40 bg-foreground/10" : "border-border"}`}>
                                        {done ? "✓" : i + 1}
                                    </div>
                                    <span className="text-xs font-bold hidden sm:block">{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`w-6 h-px ${i < stepIndex ? "bg-foreground/40" : "bg-border"}`} />}
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {step === "address" && (
                        <AddressStep
                            form={form}
                            setForm={setForm}
                            isAddressChanged={isAddressChanged}
                            addressMode={addressMode}
                            setAddressMode={setAddressMode}
                            onSubmit={handleAddress}
                            shippingRates={shippingRates}
                            shippingLoading={shippingLoading}
                        />
                    )}

                    {step === "payment" && (
                        <PaymentStep
                            payMethod={payMethod}
                            setPayMethod={setPayMethod}
                            onBack={() => setStep("address")}
                            onNext={() => setStep("confirm")}
                            finalPrice={finalPrice}
                            couponCode={couponCode}
                            setCouponCode={setCouponCode}
                            couponLoading={couponLoading}
                            couponError={couponError}
                            setCouponError={setCouponError}
                            appliedCoupon={appliedCoupon}
                            discountAmount={discountAmount}
                            applyCoupon={applyCoupon}
                            removeCoupon={removeCoupon}
                            settings={settings}
                            hasCustomer={!!customer}
                            points={points}
                            usePoints={usePoints}
                            setUsePoints={setUsePoints}
                            pointsToRedeem={pointsToRedeem}
                            setPointsToRedeem={setPointsToRedeem}
                            loyaltyDiscount={loyaltyDiscount}
                            getDiscountForPoints={getDiscountForPoints}
                        />
                    )}

                    {step === "confirm" && (
                        <ConfirmStep
                            items={items}
                            form={form}
                            payMethod={payMethod}
                            totalPrice={totalPrice}
                            finalPrice={finalPrice}
                            shippingCost={shippingCost}
                            discountAmount={discountAmount}
                            appliedCoupon={appliedCoupon}
                            usePoints={usePoints}
                            pointsToRedeem={pointsToRedeem}
                            loyaltyDiscount={loyaltyDiscount}
                            isAddressChanged={isAddressChanged}
                            addressMode={addressMode}
                            submitting={submitting}
                            onBack={() => setStep("payment")}
                            onConfirm={handleConfirm}
                        />
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
