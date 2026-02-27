import { motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useNotifications } from "@/context/NotificationContext";
import { useCustomer } from "@/context/CustomerContext";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const typeIcons: Record<string, string> = {
    order: "📦",
    promo: "🎉",
    new_product: "✨",
};

export default function NotificationsPage() {
    const { customer } = useCustomer();
    const { notifications, markAsRead, markAllRead, unreadCount } = useNotifications();

    if (!customer) {
        return (
            <PageTransition>
                <div className="font-cairo min-h-screen flex flex-col items-center justify-center px-6 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">سجّل دخولك لعرض الإشعارات</p>
                    <Link to="/login" className="bg-foreground text-background px-6 py-2.5 rounded-xl text-sm font-bold">تسجيل الدخول</Link>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <SEO title="الإشعارات" description="إشعاراتك في PRO FIT" />
            <div className="font-cairo min-h-screen">
                <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                    <h1 className="text-lg font-black flex items-center gap-2">
                        <Bell className="h-5 w-5" /> الإشعارات
                    </h1>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            <Check className="h-3 w-3" /> قراءة الكل
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Bell className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <p className="text-sm font-bold">لا توجد إشعارات</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map((n, idx) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => !n.read && markAsRead(n.id)}
                                className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors ${!n.read ? "bg-secondary/50" : ""}`}
                            >
                                <span className="text-xl flex-shrink-0 mt-0.5">{typeIcons[n.type] || "🔔"}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold truncate">{n.title}</p>
                                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                                        {new Date(n.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
