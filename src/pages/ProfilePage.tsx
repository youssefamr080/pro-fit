import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, Heart, Package, MessageCircle, LogOut, LogIn, MapPin, Phone, Edit3, Check, X, Gift, Star, Sun, Moon, Bell, BellOff } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomer } from "@/context/CustomerContext";
import { useLoyalty } from "@/context/LoyaltyContext";
import { useTheme } from "@/hooks/useUX";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import SEO from "@/components/SEO";

export default function ProfilePage() {
    const { count } = useWishlist();
    const { customer, logout, updateProfile } = useCustomer();
    const { points } = useLoyalty();
    const { isDark, toggle: toggleTheme } = useTheme();
    const { isSupported: pushSupported, isSubscribed: pushSubscribed, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", address: "", city: "" });
    const [saving, setSaving] = useState(false);

    const startEdit = () => {
        if (!customer) return;
        setEditForm({ name: customer.name, address: customer.address, city: customer.city || "" });
        setEditing(true);
    };

    const saveEdit = async () => {
        setSaving(true);
        await updateProfile(editForm);
        setSaving(false);
        setEditing(false);
    };

    const menuItems = [
        { icon: Package, label: "طلباتي", to: "/my-orders" },
        { icon: Heart, label: "المفضلة", sub: `${count} منتج`, to: "/wishlist" },
        { icon: Gift, label: "نقاط الولاء", sub: `${points} نقطة`, to: "/loyalty" },
        { icon: Package, label: "تتبع الطلب", to: "/order-tracking" },
        { icon: MessageCircle, label: "تواصل معنا", to: "https://wa.me/201550525643", external: true },
    ];

    if (!customer) {
        return (
            <PageTransition>
                <div className="font-cairo min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-[#389a9c]/10 dark:bg-[#389a9c]/20 rounded-full blur-2xl scale-150" />
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="relative bg-background border border-border/50 shadow-sm p-6 rounded-full"
                            >
                                <User className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
                            </motion.div>
                        </div>
                        <h2 className="text-xl font-black mb-3">مرحباً بك في <span className="text-[#389a9c]">PRO FIT</span></h2>
                        <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">سجّل دخولك الآن لتتمتع بتجربة تسوق أسهل، وتتابع طلباتك، وتحفظ منتجاتك المفضلة.</p>
                        <motion.div whileTap={{ scale: 0.95 }} className="w-full max-w-[200px]">
                            <Link to="/login" className="bg-foreground text-background w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md">
                                <LogIn className="h-4 w-4" />
                                تسجيل الدخول
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <SEO title="حسابي" description="إدارة حسابك في PRO FIT — طلباتي، المفضلة، نقاط الولاء" />
            <div className="font-cairo">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-8 border-b border-border">
                    <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center mb-3 text-xl font-black">
                        {customer.name.charAt(0)}
                    </div>
                    <p className="text-lg font-black">{customer.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {customer.phone}
                    </p>
                    {points > 0 && (
                        <Link to="/loyalty" className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="h-3 w-3" fill="currentColor" /> {points} نقطة ولاء
                        </Link>
                    )}
                </motion.div>

                <div className="px-4 py-4 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-black flex items-center gap-2"><MapPin className="h-4 w-4" /> معلوماتي</h3>
                        {!editing ? (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={startEdit} className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                <Edit3 className="h-3 w-3" /> تعديل
                            </motion.button>
                        ) : (
                            <div className="flex gap-2">
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(false)} className="p-1"><X className="h-4 w-4 text-muted-foreground" /></motion.button>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={saveEdit} disabled={saving} className="p-1"><Check className="h-4 w-4 text-green-600" /></motion.button>
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {!editing ? (
                            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-secondary p-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">الاسم</span><span className="font-bold">{customer.name}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">الهاتف</span><span className="font-bold">{customer.phone}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">المدينة</span><span className="font-bold">{customer.city || "—"}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">العنوان</span><span className="font-bold text-left max-w-[60%]">{customer.address}</span></div>
                            </motion.div>
                        ) : (
                            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                {[
                                    { id: "name", label: "الاسم", value: editForm.name },
                                    { id: "city", label: "المدينة", value: editForm.city },
                                    { id: "address", label: "العنوان", value: editForm.address },
                                ].map((f) => (
                                    <div key={f.id}>
                                        <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                                        <input value={f.value} onChange={(e) => setEditForm((p) => ({ ...p, [f.id]: e.target.value }))}
                                            className="w-full bg-secondary px-3 py-2.5 text-sm outline-none font-cairo border border-border focus:border-foreground transition-colors" />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="pb-8">
                    {menuItems.map(({ icon: Icon, label, sub, to, external }, i) => {
                        const inner = (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                whileTap={{ scale: 0.98 }} whileHover={{ x: 5, backgroundColor: "hsl(var(--secondary))" }}
                                className="flex items-center gap-3 w-full px-6 py-4 border-b border-border text-sm font-bold transition-colors group relative">
                                <div className="absolute left-0 inset-y-0 w-1 bg-[#389a9c] scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
                                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-[#389a9c] transition-colors" />
                                <span className="flex-1 transition-transform">{label}</span>
                                {sub && <span className="text-xs text-muted-foreground bg-secondary px-2 rounded-full">{sub}</span>}
                            </motion.div>
                        );
                        if (external) return <a key={label} href={to!} target="_blank" rel="noopener noreferrer">{inner}</a>;
                        return <Link key={label} to={to}>{inner}</Link>;
                    })}

                    <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        whileTap={{ scale: 0.98 }} whileHover={{ x: 5, backgroundColor: "hsl(var(--destructive) / 0.1)" }}
                        onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-3 w-full px-6 py-4 border-b border-border text-sm font-bold text-destructive transition-colors relative group">
                        <div className="absolute left-0 inset-y-0 w-1 bg-destructive scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
                        <LogOut className="h-5 w-5" />
                        <span>تسجيل الخروج</span>
                    </motion.button>

                    {/* Dark mode toggle */}
                    <motion.button
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={toggleTheme}
                        className="flex items-center gap-3 w-full px-6 py-4 border-b border-border text-sm font-bold hover:bg-secondary transition-colors"
                    >
                        {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
                        <span className="flex-1">{isDark ? "الوضع الفاتح" : "الوضع الداكن"}</span>
                    </motion.button>

                    {/* Push Notifications toggle */}
                    {pushSupported && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => pushSubscribed ? pushUnsubscribe() : pushSubscribe()}
                            className="flex items-center gap-3 w-full px-6 py-4 border-b border-border text-sm font-bold hover:bg-secondary transition-colors"
                        >
                            {pushSubscribed ? <Bell className="h-5 w-5 text-green-500" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                            <span className="flex-1">{pushSubscribed ? "الإشعارات مفعّلة" : "تفعيل الإشعارات"}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pushSubscribed ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-secondary text-muted-foreground"}`}>
                                {pushSubscribed ? "مفعّل" : "معطّل"}
                            </span>
                        </motion.button>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
