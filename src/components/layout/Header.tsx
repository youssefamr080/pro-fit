import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, X, Bell, Sun, Moon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useHeaderSearch } from "@/hooks/useSearch";
import { useNotifications } from "@/context/NotificationContext";
import { useCompare } from "@/context/CompareContext";
import { useTheme } from "@/hooks/useUX";
import { useCategories } from "@/hooks/useCategories";
import LazyImage from "@/components/LazyImage";

const TRENDING_SEARCHES = ["سويت شيرت أوفر سايز", "بوكسر قطن", "شورت رياضي", "هودي"];

export default function Header() {
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const { unreadCount } = useNotifications();
    const { count: compareCount } = useCompare();
    const { isDark, toggle: toggleTheme } = useTheme();
    const { data: results = [] } = useHeaderSearch(query);
    const { data: categories = [] } = useCategories();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setSearchOpen(false);
            setQuery("");
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
            {/* Search overlay */}
            <AnimatePresence>
                {searchOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-x-0 top-0 bg-background z-50 flex flex-col border-b border-border shadow-lg"
                    >
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-4 h-12">
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ابحث عن منتج..."
                                className="flex-1 border-none bg-secondary text-sm font-cairo px-3 py-1.5 outline-none"
                            />
                            <button type="submit" className="text-muted-foreground">
                                <Search className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => { setSearchOpen(false); setQuery(""); }}>
                                <X className="h-5 w-5" />
                            </button>
                        </form>
                        {/* Empty state: Trending Searches */}
                        {query.trim() === "" ? (
                            <div className="px-4 pb-4">
                                <h3 className="text-xs font-bold text-muted-foreground mb-3">عمليات البحث الشائعة</h3>
                                <div className="flex flex-wrap gap-2">
                                    {TRENDING_SEARCHES.map(term => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="px-3 py-1.5 bg-secondary text-xs font-bold rounded-full"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Search Results */}
                        {results.length > 0 ? (
                            <div className="px-4 pb-4 space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground mb-2">مقترحات</h3>
                                {results.map((p) => (
                                    <Link
                                        key={p.id}
                                        to={`/product/${p.id}`}
                                        onClick={() => { setSearchOpen(false); setQuery(""); }}
                                        className="flex items-center gap-3 hover:bg-secondary p-2 -mx-2 rounded transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-secondary rounded overflow-hidden flex-shrink-0">
                                            {p.images?.[0] ? <LazyImage src={p.images[0]} alt={p.title} className="w-full h-full object-cover" /> : null}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold">{p.title}</div>
                                            <div className="text-[10px] text-muted-foreground">{p.category}</div>
                                        </div>
                                        <div className="text-xs font-bold font-cairo">
                                            {p.sale_price ?? p.price} ج.م
                                        </div>
                                    </Link>
                                ))}
                                <button
                                    onClick={() => {
                                        navigate(`/search?q=${encodeURIComponent(query)}`);
                                        setSearchOpen(false);
                                        setQuery("");
                                    }}
                                    className="text-xs font-bold font-cairo text-muted-foreground pt-1"
                                >
                                    عرض كل النتائج ←
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <div className="flex items-center justify-between px-4 h-12">
                {/* Hamburger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <motion.button whileTap={{ scale: 0.9 }} aria-label="القائمة">
                            <Menu className="h-5 w-5" />
                        </motion.button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72 p-0">
                        <nav className="flex flex-col pt-12 font-cairo">
                            <Link to="/" className="px-6 py-4 text-lg font-bold border-b border-border">الرئيسية</Link>
                            <Link to="/search" className="px-6 py-4 text-lg font-bold border-b border-border">بحث</Link>
                            <Link to="/sales" className="px-6 py-4 text-lg font-bold border-b border-border">عروض وتخفيضات</Link>
                            {/* Dynamic categories from DB */}
                            {categories.map(cat => (
                                <Link key={cat.slug} to={`/category/${cat.slug}`} className="px-6 py-4 border-b border-border">
                                    {cat.name}
                                </Link>
                            ))}
                            <Link to="/cart" className="px-6 py-4 text-lg font-bold border-b border-border">السلة</Link>
                            <Link to="/compare" className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <span>مقارنة المنتجات</span>
                                {compareCount > 0 ? <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded-full">{compareCount}</span> : null}
                            </Link>
                            <Link to="/notifications" className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <span>الإشعارات</span>
                                {unreadCount > 0 ? <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded-full">{unreadCount}</span> : null}
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <Link to="/" className="font-cairo font-black text-xl tracking-tight text-[#389a9c]">
                    PRO FIT
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="text-foreground transition-colors">
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    {/* Notifications */}
                    <Link to="/notifications" className="relative">
                        <motion.span whileTap={{ scale: 0.9 }}>
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 ? (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            ) : null}
                        </motion.span>
                    </Link>
                    {/* Search */}
                    <motion.button whileTap={{ scale: 0.9 }} aria-label="بحث" onClick={() => setSearchOpen(true)}>
                        <Search className="h-5 w-5" />
                    </motion.button>
                </div>
            </div>
        </header>
    );
}
