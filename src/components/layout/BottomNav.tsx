import { Link, useLocation } from "react-router-dom";
import { Home, ArrowLeftRight, ShoppingBag, User, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";

const navItems = [
    { to: "/", icon: Home, label: "الرئيسية" },
    { to: "/compare", icon: ArrowLeftRight, label: "المقارنة" },
    { to: "/cart", icon: ShoppingBag, label: "السلة" },
    { to: "/wishlist", icon: Heart, label: "المفضلة" },
    { to: "/profile", icon: User, label: "حسابي" },
];

export default function BottomNav() {
    const { pathname } = useLocation();
    const { totalItems } = useCart();
    const { count: wishCount } = useWishlist();
    const { count: compareCount } = useCompare();

    return (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.2)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
                {navItems.map(({ to, icon: Icon, label }) => {
                    const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
                    const badge = to === "/cart" ? totalItems : to === "/wishlist" ? wishCount : to === "/compare" ? compareCount : 0;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex flex-col items-center gap-0.5 text-[10px] font-cairo font-bold transition-colors ${active ? "text-foreground" : "text-muted-foreground"
                                }`}
                        >
                            <motion.span
                                className="relative"
                                animate={{ scale: active ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    strokeWidth={active ? 2.5 : 1.5}
                                    fill={active && to === "/wishlist" ? "currentColor" : "none"}
                                />
                                {badge > 0 ? (
                                    <motion.span
                                        key={badge}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                        className="absolute -top-1.5 -left-2 bg-foreground text-background text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                                    >
                                        {badge}
                                    </motion.span>
                                ) : null}
                            </motion.span>
                            {label}
                            {active ? (
                                <motion.span
                                    layoutId="nav-indicator"
                                    className="absolute bottom-0 w-8 h-0.5 bg-foreground"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            ) : null}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
