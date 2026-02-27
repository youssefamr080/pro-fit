import { motion } from "framer-motion";
import { Star, Gift, TrendingUp, TrendingDown, Clock } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useLoyalty } from "@/context/LoyaltyContext";
import { useCustomer } from "@/context/CustomerContext";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

export default function LoyaltyPage() {
    const { customer } = useCustomer();
    const { points, settings, transactions, loading } = useLoyalty();

    if (!customer) {
        return (
            <PageTransition>
                <div className="font-cairo min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">سجّل دخولك لعرض نقاطك</p>
                    <Link to="/login" className="bg-foreground text-background px-6 py-2.5 rounded-xl text-sm font-bold">تسجيل الدخول</Link>
                </div>
            </PageTransition>
        );
    }

    const discount = settings ? Math.floor(points / 100) * settings.redemption_rate : 0;

    return (
        <PageTransition>
            <SEO title="نقاط الولاء" description="اكسب نقاط واستبدلها بخصومات في PRO FIT" />
            <div className="font-cairo min-h-screen pb-20">
                <div className="px-4 py-6 border-b border-border text-center">
                    <Gift className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                    <h1 className="text-xl font-black mb-1">نقاط الولاء</h1>
                    <motion.p
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-black text-amber-500"
                    >
                        {points}
                    </motion.p>
                    <p className="text-xs text-muted-foreground mt-1">نقطة متاحة</p>
                    {discount > 0 && (
                        <p className="text-sm text-green-600 font-bold mt-2">
                            يمكنك استبدالها بخصم {discount} ج.م
                        </p>
                    )}
                </div>

                {settings && (
                    <div className="px-4 py-4 border-b border-border">
                        <h2 className="text-sm font-black mb-3">كيف تعمل النقاط؟</h2>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <p>• تكسب <span className="font-bold text-foreground">{settings.points_per_currency} نقطة</span> لكل ١ ج.م تنفقه</p>
                            <p>• كل <span className="font-bold text-foreground">100 نقطة</span> = <span className="font-bold text-foreground">{settings.redemption_rate} ج.م</span> خصم</p>
                            <p>• الحد الأدنى للاستبدال: <span className="font-bold text-foreground">{settings.min_points_redeem} نقطة</span></p>
                        </div>
                    </div>
                )}

                <div className="px-4 py-4">
                    <h2 className="text-sm font-black mb-3">سجل النقاط</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-secondary animate-pulse rounded" />)}
                        </div>
                    ) : transactions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">لا توجد حركات نقاط بعد. ابدأ التسوق لتكسب نقاط!</p>
                    ) : (
                        <div className="space-y-2">
                            {transactions.map((t, idx) => (
                                <motion.div
                                    key={t.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="flex items-center gap-3 p-3 bg-secondary"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "earn" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                                        {t.type === "earn" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate">{t.description}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(t.created_at).toLocaleDateString("ar-EG")}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-black ${t.points > 0 ? "text-green-600" : "text-red-600"}`}>
                                        {t.points > 0 ? "+" : ""}{t.points}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
