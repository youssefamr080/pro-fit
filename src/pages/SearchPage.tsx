import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAllProducts } from "@/hooks/useProducts";
import { useSearchProducts } from "@/hooks/useSearch";
import { Search, X, ArrowRight, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import PageTransition, { staggerContainer, fadeUpItem } from "@/components/PageTransition";
import SEO from "@/components/SEO";
import { ALL_SIZES, ALL_COLORS } from "@/lib/productUtils";

const POPULAR = ["سويت شيرت", "بوكسر", "بنطلون", "فانلة", "كارجو", "هودي"];
const CATEGORIES = ["الكل", "بوكسرات", "سويت شيرت", "بناطيل", "فانلات"];
const SORT_OPTIONS = [
    { id: "default", label: "الترتيب الافتراضي" },
    { id: "price_asc", label: "السعر: الأقل أولاً" },
    { id: "price_desc", label: "السعر: الأعلى أولاً" },
    { id: "name", label: "الاسم" },
];

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQ = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQ);
    const [showFilters, setShowFilters] = useState(false);
    const [category, setCategory] = useState("الكل");
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [sortBy, setSortBy] = useState("default");

    // Server-side search for text queries
    const { data: searchResults = [] } = useSearchProducts(query);
    // Fallback: load all products only when filters are active but no text query
    const hasFilters = category !== "الكل" || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 500;
    const { data: allProducts = [] } = useAllProducts();
    const baseProducts = query.trim() ? searchResults : (hasFilters ? allProducts : []);

    const toggleSize = (s: string) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    const toggleColor = (c: string) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

    const activeFiltersCount = (category !== "الكل" ? 1 : 0) + (selectedSizes.length > 0 ? 1 : 0) + (selectedColors.length > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0);

    const clearFilters = () => {
        setCategory("الكل");
        setSelectedSizes([]);
        setSelectedColors([]);
        setPriceRange([0, 500]);
        setSortBy("default");
    };

    const results = useMemo(() => {
        let filtered = [...baseProducts];
        if (category !== "الكل") filtered = filtered.filter(p => p.category === category);
        if (selectedSizes.length > 0) filtered = filtered.filter(p => p.variants.some(v => selectedSizes.includes(v.size)));
        if (selectedColors.length > 0) filtered = filtered.filter(p => p.variants.some(v => selectedColors.includes(v.color)));
        filtered = filtered.filter(p => { const price = p.sale_price ?? p.price; return price >= priceRange[0] && price <= priceRange[1]; });
        if (sortBy === "price_asc") filtered.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
        if (sortBy === "price_desc") filtered.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
        if (sortBy === "name") filtered.sort((a, b) => a.title.localeCompare(b.title, "ar"));
        return filtered;
    }, [baseProducts, category, selectedSizes, selectedColors, priceRange, sortBy]);

    const handleChange = (val: string) => {
        setQuery(val);
        if (val.trim()) setSearchParams({ q: val.trim() });
        else setSearchParams({});
    };

    return (
        <PageTransition>
            <SEO title={query ? `بحث: ${query}` : "بحث"} description="ابحث عن منتجات PRO FIT — ملابس رجالي بأفضل الأسعار في مصر" />
            <div className="min-h-screen bg-background font-cairo">
                <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="flex-shrink-0"><ArrowRight className="h-5 w-5" /></button>
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input autoFocus value={query} onChange={(e) => handleChange(e.target.value)} placeholder="ابحث عن منتج، قسم..." className="w-full bg-secondary text-sm font-cairo pr-9 pl-8 py-2 outline-none" />
                            {query && <button onClick={() => handleChange("")} className="absolute left-2 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-muted-foreground" /></button>}
                        </div>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowFilters(!showFilters)} className="relative flex-shrink-0 p-2 bg-secondary border border-border">
                            <SlidersHorizontal className="h-4 w-4" />
                            {activeFiltersCount > 0 && <span className="absolute -top-1 -left-1 w-4 h-4 bg-foreground text-background text-[9px] font-bold rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
                        </motion.button>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border">
                            <div className="px-4 py-4 space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground mb-2">الفئة</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {CATEGORIES.map(c => <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 text-xs font-bold border transition-colors ${category === c ? "bg-foreground text-background border-foreground" : "border-border"}`}>{c}</button>)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground mb-2">المقاس</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ALL_SIZES.map(s => <button key={s} onClick={() => toggleSize(s)} className={`px-3 py-1.5 text-xs font-bold border transition-colors ${selectedSizes.includes(s) ? "bg-foreground text-background border-foreground" : "border-border"}`}>{s}</button>)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground mb-2">اللون</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_COLORS.map(c => <button key={c.name} onClick={() => toggleColor(c.name)} className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColors.includes(c.name) ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c.hex }} title={c.name} />)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground mb-2">السعر: {priceRange[0]} - {priceRange[1]} ج.م</p>
                                    <div className="flex gap-3 items-center">
                                        <input type="range" min="0" max="500" step="10" value={priceRange[0]} onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])} className="flex-1 accent-foreground" />
                                        <input type="range" min="0" max="500" step="10" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])} className="flex-1 accent-foreground" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground mb-2">ترتيب النتائج</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SORT_OPTIONS.map(s => <button key={s.id} onClick={() => setSortBy(s.id)} className={`px-3 py-1.5 text-xs font-bold border transition-colors ${sortBy === s.id ? "bg-foreground text-background border-foreground" : "border-border"}`}>{s.label}</button>)}
                                    </div>
                                </div>
                                {activeFiltersCount > 0 && <button onClick={clearFilters} className="text-xs font-bold text-destructive">مسح كل الفلاتر</button>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {!query.trim() && activeFiltersCount === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-6">
                            <p className="text-xs font-bold text-muted-foreground mb-3 tracking-widest uppercase">عمليات بحث شائعة</p>
                            <div className="flex flex-wrap gap-2">
                                {POPULAR.map((term) => <motion.button key={term} whileTap={{ scale: 0.96 }} onClick={() => handleChange(term)} className="px-4 py-2 bg-secondary text-sm font-bold border border-border">{term}</motion.button>)}
                            </div>
                        </motion.div>
                    ) : results.length === 0 ? (
                        <motion.div key="no-results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1} />
                            <p className="text-base font-bold mb-1">لا توجد نتائج</p>
                            <p className="text-sm text-muted-foreground">جرب تغيير الفلاتر أو كلمة البحث</p>
                        </motion.div>
                    ) : (
                        <motion.div key="results" initial="initial" animate="animate" className="px-1 pt-3 pb-8">
                            <p className="text-xs text-muted-foreground px-3 mb-3 font-bold">{results.length} نتيجة</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]">
                                {results.map((p) => <motion.div key={p.id} variants={fadeUpItem}><ProductCard product={p} /></motion.div>)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
