import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Tag, X, Loader2, Gift, Copy, ExternalLink, MessageCircle, AlertTriangle } from "lucide-react";

interface AppliedCoupon {
    code: string;
    discount_type: string;
    discount_value: number;
}

interface LoyaltySettings {
    points_per_currency: number;
    redemption_rate: number;
    min_points_redeem: number;
    active: boolean;
}

interface Props {
    payMethod: string;
    setPayMethod: (method: string) => void;
    onBack: () => void;
    onNext: () => void;
    finalPrice: number;
    // Coupon props
    couponCode: string;
    setCouponCode: (code: string) => void;
    couponLoading: boolean;
    couponError: string;
    setCouponError: (error: string) => void;
    appliedCoupon: AppliedCoupon | null;
    discountAmount: number;
    applyCoupon: () => void;
    removeCoupon: () => void;
    // Loyalty props
    settings: LoyaltySettings | null;
    hasCustomer: boolean;
    points: number;
    usePoints: boolean;
    setUsePoints: (use: boolean) => void;
    pointsToRedeem: number;
    setPointsToRedeem: (points: number) => void;
    loyaltyDiscount: number;
    getDiscountForPoints: (pts: number) => number;
}

const PAYMENT_METHODS = [
    { id: "cod", label: "الدفع عند الاستلام", desc: "ادفع نقداً عند وصول طلبك", icon: "💵" },
    { id: "instapay", label: "InstaPay", desc: "تحويل فوري عبر InstaPay", icon: "⚡" },
];

const INSTAPAY_LINK = "https://ipn.eg/S/omstore/instapay/1YtnnW";
const WHATSAPP_NUMBER = "201550525643";

export default function PaymentStep({
    payMethod, setPayMethod, onBack, onNext, finalPrice,
    couponCode, setCouponCode, couponLoading, couponError, setCouponError,
    appliedCoupon, discountAmount, applyCoupon, removeCoupon,
    settings, hasCustomer, points, usePoints, setUsePoints,
    pointsToRedeem, setPointsToRedeem, loyaltyDiscount, getDiscountForPoints,
}: Props) {
    const [copied, setCopied] = React.useState(false);

    const copyAmount = () => {
        navigator.clipboard.writeText(String(finalPrice)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const openWhatsAppProof = () => {
        const msg = encodeURIComponent(
            `✅ تم التحويل عبر InstaPay\n💰 المبلغ: ${finalPrice} ج.م\n📎 مرفق صورة إيصال التحويل`
        );
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    };

    return (
        <motion.div
            key="payment"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="px-4 pt-6"
        >
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <ChevronLeft className="h-4 w-4" /> رجوع
            </button>
            <h2 className="text-lg font-black mb-4">طريقة الدفع</h2>

            {/* Payment methods */}
            <div className="space-y-3 mb-6">
                {PAYMENT_METHODS.map((m) => (
                    <motion.button
                        key={m.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPayMethod(m.id)}
                        className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl text-right transition-colors ${payMethod === m.id ? "border-foreground bg-foreground/5" : "border-border"}`}
                    >
                        <span className="text-2xl">{m.icon}</span>
                        <div className="flex-1">
                            <p className="text-sm font-black">{m.label}</p>
                            <p className="text-xs text-muted-foreground">{m.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${payMethod === m.id ? "border-foreground bg-foreground" : "border-border"}`} />
                    </motion.button>
                ))}
            </div>

            {/* InstaPay details */}
            <AnimatePresence>
                {payMethod === "instapay" ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 space-y-3 overflow-hidden"
                    >
                        {/* Amount + Copy */}
                        <div className="bg-secondary rounded-xl p-4 space-y-3">
                            <p className="text-sm font-black">تفاصيل التحويل</p>
                            <div className="flex items-center justify-between bg-background rounded-xl border border-border p-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">المبلغ المطلوب</p>
                                    <p className="text-xl font-black">{finalPrice} ج.م</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={copyAmount}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${copied ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-foreground/10 text-foreground hover:bg-foreground/20"}`}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    {copied ? "تم النسخ ✓" : "نسخ المبلغ"}
                                </motion.button>
                            </div>

                            {/* Direct InstaPay Link */}
                            <motion.a
                                whileTap={{ scale: 0.97 }}
                                href={INSTAPAY_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white py-3 rounded-xl font-bold text-sm transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                                حوّل الآن عبر InstaPay
                            </motion.a>

                            <p className="text-[11px] text-muted-foreground text-center">
                                الحساب: <span className="font-bold text-foreground">omstore@instapay</span>
                            </p>
                        </div>

                        {/* Warning notice */}
                        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="text-xs font-cairo space-y-1">
                                <p className="font-bold text-amber-700 dark:text-amber-400">ملاحظة مهمة</p>
                                <p className="text-amber-600 dark:text-amber-500">
                                    سيبقى الطلب في حالة <span className="font-bold">معلّق</span> إلى حين إرسال صورة من إيصال التحويل عبر واتساب، وسيتم مراجعته واعتماده من قبل المسؤول.
                                </p>
                            </div>
                        </div>

                        {/* WhatsApp send proof */}
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={openWhatsAppProof}
                            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1fb855] text-white py-3 rounded-xl font-bold text-sm transition-colors"
                        >
                            <MessageCircle className="h-4 w-4" />
                            أرسل إيصال الدفع على واتساب
                        </motion.button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Coupon Section */}
            <div className="mb-6 border border-border p-4 space-y-3">
                <p className="text-sm font-black flex items-center gap-2"><Tag className="h-4 w-4" /> كود الخصم</p>
                {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-900">
                        <div>
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</p>
                            <p className="text-xs text-green-600 dark:text-green-500">
                                خصم {appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : `${appliedCoupon.discount_value} ج.م`}
                                {" "}= -{discountAmount} ج.م
                            </p>
                        </div>
                        <button onClick={removeCoupon}><X className="h-4 w-4 text-muted-foreground" /></button>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <input
                                value={couponCode}
                                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                                placeholder="أدخل كود الخصم"
                                className="flex-1 bg-secondary px-3 py-2 text-sm font-cairo outline-none border border-border focus:border-foreground transition-colors"
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={applyCoupon}
                                disabled={couponLoading || !couponCode.trim()}
                                className="bg-foreground text-background px-4 py-2 text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                            >
                                {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "تطبيق"}
                            </motion.button>
                        </div>
                        {couponError ? <p className="text-xs text-destructive font-bold">{couponError}</p> : null}
                    </>
                )}
            </div>

            {/* Loyalty Points Section */}
            {settings?.active && hasCustomer ? (
                <div className={`mb-6 border p-4 space-y-3 transition-colors ${usePoints
                    ? "border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20"
                    : "border-border"
                    }`}>
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-black flex items-center gap-2">
                            <Gift className="h-4 w-4 text-amber-500" />
                            نقاط الولاء
                        </p>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                            {points} نقطة
                        </span>
                    </div>

                    {points >= (settings?.min_points_redeem || 0) ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setUsePoints(!usePoints);
                                    if (!usePoints) {
                                        setPointsToRedeem(Math.min(points, Math.floor(points / 100) * 100));
                                    } else {
                                        setPointsToRedeem(0);
                                    }
                                }}
                                className={`w-full flex items-center justify-between p-3 border-2 text-right transition-all ${usePoints
                                    ? "border-amber-400 dark:border-amber-600 bg-amber-100/50 dark:bg-amber-900/30"
                                    : "border-border hover:border-amber-300 dark:hover:border-amber-700"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${usePoints
                                        ? "border-amber-500 bg-amber-500 text-white"
                                        : "border-muted-foreground/40"
                                        }`}>
                                        {usePoints ? (
                                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs">✓</motion.span>
                                        ) : null}
                                    </div>
                                    <span className="text-sm font-bold">
                                        {usePoints ? "نقاطك مفعّلة" : "استخدم نقاطك كخصم"}
                                    </span>
                                </div>
                                {usePoints ? (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-xs font-black text-green-600 dark:text-green-400"
                                    >
                                        −{getDiscountForPoints(pointsToRedeem)} ج.م
                                    </motion.span>
                                ) : null}
                            </button>

                            <AnimatePresence>
                                {usePoints ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 overflow-hidden"
                                    >
                                        <div className="pt-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-muted-foreground">عدد النقاط</label>
                                                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                                                    {pointsToRedeem} / {points}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={settings?.min_points_redeem || 100}
                                                max={Math.floor(points / 100) * 100}
                                                step={100}
                                                value={pointsToRedeem}
                                                onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                                                className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                                <span>{settings?.min_points_redeem || 100} نقطة</span>
                                                <span>{Math.floor(points / 100) * 100} نقطة</span>
                                            </div>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 p-3 border border-green-200 dark:border-green-800"
                                        >
                                            <span className="text-xs text-green-700 dark:text-green-400">ستوفر من هذا الطلب</span>
                                            <span className="text-sm font-black text-green-600 dark:text-green-400">
                                                {getDiscountForPoints(pointsToRedeem)} ج.م
                                            </span>
                                        </motion.div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground bg-secondary p-3">
                            تحتاج {settings?.min_points_redeem || 100} نقطة على الأقل للاستبدال. تسوّق أكتر واكسب نقاط! 🛍️
                        </p>
                    )}
                </div>
            ) : null}

            <button onClick={onNext} className="w-full bg-foreground text-background py-3.5 font-bold text-sm">
                التالي — مراجعة الطلب
            </button>
        </motion.div>
    );
}
