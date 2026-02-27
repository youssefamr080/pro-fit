import { motion } from "framer-motion";
import { ChevronLeft, Loader2, Gift, Truck } from "lucide-react";
import type { CartItem } from "@/types/product";

interface AppliedCoupon {
    code: string;
    discount_type: string;
    discount_value: number;
}

const PAYMENT_LABELS: Record<string, string> = {
    cod: "الدفع عند الاستلام",
    instapay: "InstaPay",
};

interface Props {
    items: CartItem[];
    form: { name: string; phone: string; city: string; address: string };
    payMethod: string;
    totalPrice: number;
    finalPrice: number;
    shippingCost: number;
    discountAmount: number;
    appliedCoupon: AppliedCoupon | null;
    usePoints: boolean;
    pointsToRedeem: number;
    loyaltyDiscount: number;
    isAddressChanged: boolean;
    addressMode: string;
    submitting: boolean;
    onBack: () => void;
    onConfirm: () => void;
}

export default function ConfirmStep({
    items, form, payMethod, totalPrice, finalPrice, shippingCost, discountAmount,
    appliedCoupon, usePoints, pointsToRedeem, loyaltyDiscount,
    isAddressChanged, addressMode, submitting, onBack, onConfirm,
}: Props) {
    return (
        <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="px-4 pt-6"
        >
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <ChevronLeft className="h-4 w-4" /> رجوع
            </button>
            <h2 className="text-lg font-black mb-4">مراجعة الطلب</h2>

            {/* Order items */}
            <div className="border border-border rounded-xl mb-4 overflow-hidden">
                {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex justify-between items-center px-4 py-3 border-b border-border last:border-0 text-sm">
                        <div>
                            <p className="font-bold">{item.product.title}</p>
                            <p className="text-xs text-muted-foreground">{item.size} · {item.color} · ×{item.quantity}</p>
                        </div>
                        <span className="font-bold">{((item as any).flashPrice ?? item.product.sale_price ?? item.product.price) * item.quantity} ج.م</span>
                    </div>
                ))}
            </div>

            {/* Order summary */}
            <div className="bg-secondary rounded-xl p-4 text-sm space-y-2 mb-6">
                <div className="flex justify-between"><span className="text-muted-foreground">الاسم</span><span className="font-bold">{form.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">الهاتف</span><span className="font-bold">{form.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">المدينة</span><span className="font-bold">{form.city}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">العنوان</span><span className="font-bold">{form.address}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">الدفع</span><span className="font-bold">{PAYMENT_LABELS[payMethod] || payMethod}</span></div>
                {isAddressChanged ? (
                    <div className="flex justify-between text-xs">
                        <span className="text-orange-500">تغيير العنوان</span>
                        <span className="font-bold text-orange-500">{addressMode === "permanent" ? "دائم" : "لهذا الطلب فقط"}</span>
                    </div>
                ) : null}
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">المجموع</span><span className="font-bold">{totalPrice} ج.م</span></div>
                    {shippingCost > 0 ? (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                            <span className="text-xs flex items-center gap-1">
                                <Truck className="h-3 w-3" />
                                مصاريف الشحن ({form.city})
                            </span>
                            <span className="font-bold">+{shippingCost} ج.م</span>
                        </div>
                    ) : null}
                    {appliedCoupon ? (
                        <div className="flex justify-between text-green-600">
                            <span className="text-xs">خصم ({appliedCoupon.code})</span>
                            <span className="font-bold">-{discountAmount} ج.م</span>
                        </div>
                    ) : null}
                    {usePoints && loyaltyDiscount > 0 ? (
                        <div className="flex justify-between text-amber-600 dark:text-amber-400">
                            <span className="text-xs flex items-center gap-1">
                                <Gift className="h-3 w-3" />
                                نقاط الولاء ({pointsToRedeem} نقطة)
                            </span>
                            <span className="font-bold">-{loyaltyDiscount} ج.م</span>
                        </div>
                    ) : null}
                    <div className="flex justify-between"><span className="font-black">الإجمالي</span><span className="font-black text-lg">{finalPrice} ج.م</span></div>
                </div>
            </div>

            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                disabled={submitting}
                className="w-full bg-foreground text-background py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ تأكيد الطلب...</> : "تأكيد الطلب 🎉"}
            </motion.button>
        </motion.div>
    );
}
