import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Scale, ArrowUpDown, Info, Sparkles } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";

interface Props {
    category: string;        // Arabic category name
    productId?: string;      // product ID for per-product size guide data
    selectedSize?: string;   // currently selected size to highlight
}

interface SizeField { id: string; key: string; label: string; unit: string; }
interface SizeGuideRow { size: string; field_key: string; value: string; }

function useCategorySizeFields(categoryName: string) {
    const { data: categories = [] } = useCategories();
    const catId = categories.find(c => c.name === categoryName)?.id;

    return useQuery({
        queryKey: ["category-size-fields", catId],
        queryFn: async () => {
            if (!catId) return [];
            const { data, error } = await supabase
                .from("category_size_fields")
                .select("*, size_guide_fields(*)")
                .eq("category_id", catId)
                .order("sort_order");
            if (error) throw error;
            return (data || []).map((row: any) => row.size_guide_fields as SizeField).filter(Boolean);
        },
        enabled: !!catId,
        staleTime: 10 * 60 * 1000,
    });
}

function useProductSizeGuide(productId?: string) {
    return useQuery({
        queryKey: ["product-size-guide", productId],
        queryFn: async () => {
            if (!productId) return [];
            const { data, error } = await supabase
                .from("product_size_guide")
                .select("*")
                .eq("product_id", productId);
            if (error) throw error;
            return (data || []) as SizeGuideRow[];
        },
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
    });
}

export default function SizeGuideSheet({ category, productId, selectedSize }: Props) {
    const { data: fields = [] } = useCategorySizeFields(category);
    const { data: sizeGuideRows = [] } = useProductSizeGuide(productId);

    const [activeTab, setActiveTab] = useState<"table" | "calculator" | "howto">("table");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");

    // Build size guide table from DB data
    const { sizes, valueMap } = useMemo(() => {
        const sizeSet = new Set<string>();
        const map: Record<string, Record<string, string>> = {};
        for (const row of sizeGuideRows) {
            sizeSet.add(row.size);
            if (!map[row.size]) map[row.size] = {};
            map[row.size][row.field_key] = row.value;
        }
        // Sort sizes in standard order
        const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
        const sorted = Array.from(sizeSet).sort((a, b) => {
            const ia = sizeOrder.indexOf(a);
            const ib = sizeOrder.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });
        return { sizes: sorted, valueMap: map };
    }, [sizeGuideRows]);

    const hasData = fields.length > 0 && sizes.length > 0;

    // Simple recommendation by weight (if weight field exists in data)
    const recommended = useMemo(() => {
        if (!weight || !height) return null;
        // Try to find a size where the weight field range includes user weight
        const w = Number(weight);
        for (const size of sizes) {
            const val = valueMap[size]?.weight;
            if (val && val.includes("-")) {
                const [min, max] = val.split("-").map(Number);
                if (w >= min && w <= max) return size;
            }
        }
        return null;
    }, [weight, height, sizes, valueMap]);

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Ruler className="h-3.5 w-3.5" />
                    دليل المقاسات
                </motion.button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh] font-cairo">
                <div className="px-4 pt-4 pb-2">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <Ruler className="h-5 w-5" />
                            دليل المقاسات — {category}
                        </h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-4 bg-secondary rounded-xl p-1">
                        {[
                            { key: "table" as const, label: "جدول المقاسات", icon: Ruler },
                            { key: "calculator" as const, label: "اقترح لي", icon: Sparkles },
                            { key: "howto" as const, label: "كيف تقيس", icon: Info },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${activeTab === key
                                    ? "bg-foreground text-background shadow-sm"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: "60vh" }}>
                    <AnimatePresence mode="wait">
                        {/* ── Table Tab ── */}
                        {activeTab === "table" && (
                            <motion.div
                                key="table"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {hasData ? (
                                    <div className="overflow-x-auto -mx-1">
                                        <table className="w-full text-center border-collapse">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="p-3 text-xs font-black text-right sticky left-0 bg-background">المقاس</th>
                                                    {fields.map((m) => (
                                                        <th key={m.key} className="p-3 text-xs font-bold text-muted-foreground whitespace-nowrap">
                                                            {m.label}
                                                            <span className="block text-[10px] font-normal">({m.unit})</span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sizes.map((size, idx) => {
                                                    const isSelected = size === selectedSize;
                                                    const isRecommended = size === recommended;
                                                    return (
                                                        <motion.tr
                                                            key={size}
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className={`border-b border-border/50 transition-colors ${isSelected
                                                                ? "bg-foreground/5 font-bold"
                                                                : isRecommended
                                                                    ? "bg-green-50 dark:bg-green-950/20"
                                                                    : ""
                                                                }`}
                                                        >
                                                            <td className="p-3 text-sm font-black text-right sticky left-0 bg-background">
                                                                <div className="flex items-center gap-1.5">
                                                                    {size}
                                                                    {isSelected && (
                                                                        <span className="text-[9px] bg-foreground text-background px-1.5 py-0.5 rounded-full">
                                                                            محدد
                                                                        </span>
                                                                    )}
                                                                    {isRecommended && !isSelected && (
                                                                        <span className="text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                                            <Sparkles className="h-2.5 w-2.5" />
                                                                            مقترح
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            {fields.map((m) => (
                                                                <td key={m.key} className="p-3 text-sm tabular-nums">
                                                                    {valueMap[size]?.[m.key] || "—"}
                                                                </td>
                                                            ))}
                                                        </motion.tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Ruler className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="text-sm text-muted-foreground">لم يتم إضافة دليل مقاسات لهذا المنتج بعد</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── Calculator Tab ── */}
                        {activeTab === "calculator" && (
                            <motion.div
                                key="calculator"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    أدخل وزنك وطولك وهنقترح لك المقاس المناسب لـ{category}
                                </p>

                                {/* Weight Input */}
                                <div>
                                    <label className="text-xs font-bold mb-1.5 block flex items-center gap-1.5">
                                        <Scale className="h-3.5 w-3.5" />
                                        الوزن (كيلوجرام)
                                    </label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="مثلاً: 75"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-foreground transition-colors tabular-nums"
                                    />
                                </div>

                                {/* Height Input */}
                                <div>
                                    <label className="text-xs font-bold mb-1.5 block flex items-center gap-1.5">
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        الطول (سنتيمتر)
                                    </label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="مثلاً: 175"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-foreground transition-colors tabular-nums"
                                    />
                                </div>

                                {/* Result */}
                                <AnimatePresence>
                                    {recommended && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl p-4 text-center"
                                        >
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <p className="text-sm font-bold text-green-700 dark:text-green-300">المقاس المقترح</p>
                                            </div>
                                            <motion.p
                                                key={recommended}
                                                initial={{ scale: 0.5 }}
                                                animate={{ scale: 1 }}
                                                className="text-4xl font-black text-green-600 dark:text-green-400"
                                            >
                                                {recommended}
                                            </motion.p>
                                            <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                                                بناءً على وزنك ({weight} كجم) وطولك ({height} سم)
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!recommended && weight && height && (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        لم نجد مقاس مناسب — جرب تعدّل الأرقام
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* ── How to Measure Tab ── */}
                        {activeTab === "howto" && (
                            <motion.div
                                key="howto"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-3"
                            >
                                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                    استخدم شريط قياس مرن (مش المعدني). قيس وأنت لابس ملابس خفيفة.
                                </p>

                                {fields.length > 0 ? fields.map((field, idx) => (
                                    <motion.div
                                        key={field.key}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="flex gap-3 p-3 bg-secondary rounded-xl"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold mb-0.5">
                                                {field.label} ({field.unit})
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                قيس {field.label} باستخدام شريط القياس
                                            </p>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        لا توجد قياسات محددة لهذا القسم
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
