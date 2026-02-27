import { useState, useEffect, useCallback, memo } from "react";
import { Zap } from "lucide-react";
import { useFlashSales } from "@/hooks/useFlashSales";
import { useAllProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";

/* ─── Simple inline countdown ──────────────────────── */
const pad = (n: number) => String(n).padStart(2, "0");

function useCountdown(endsAt: string) {
    const calc = useCallback(() => {
        const diff = new Date(endsAt).getTime() - Date.now();
        if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
        return {
            h: Math.floor(diff / 3600000),
            m: Math.floor((diff % 3600000) / 60000),
            s: Math.floor((diff % 60000) / 1000),
            expired: false,
        };
    }, [endsAt]);

    const [t, setT] = useState(calc);
    useEffect(() => {
        setT(calc());
        const id = setInterval(() => setT(calc()), 1000);
        return () => clearInterval(id);
    }, [calc]);
    return t;
}

/* ─── Header timer — compact red blocks like Noon ──── */
function HeaderCountdown({ endsAt }: { endsAt: string }) {
    const { h, m, s, expired } = useCountdown(endsAt);
    if (expired) return <span className="text-xs text-muted-foreground">انتهى</span>;
    return (
        <div className="flex items-center gap-0.5 text-[11px] font-mono font-bold" dir="ltr">
            <span className="text-muted-foreground text-[10px] ml-1">ينتهي في</span>
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded">{pad(h)}</span>
            <span className="text-red-500 font-black">:</span>
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded">{pad(m)}</span>
            <span className="text-red-500 font-black">:</span>
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded">{pad(s)}</span>
        </div>
    );
}

/* ─── Mini countdown for ProductCard badge ─────────── */
export function MiniCountdown({ endsAt }: { endsAt: string }) {
    const { h, m, s, expired } = useCountdown(endsAt);
    if (expired) return null;
    return (
        <span className="font-mono text-[9px] font-bold tracking-tight tabular-nums">
            {pad(h)}:{pad(m)}:{pad(s)}
        </span>
    );
}

/* ─── Main Section ─────────────────────────────────── */
function FlashSaleSection() {
    const { data: flashSales = [] } = useFlashSales();
    const { data: products = [] } = useAllProducts();

    const flashProducts = flashSales
        .map(sale => {
            const product = products.find(p => p.id === sale.product_id);
            return product ? { sale, product } : null;
        })
        .filter(Boolean) as { sale: any; product: any }[];

    if (flashProducts.length === 0) return null;

    // Use the soonest-expiring sale for the header countdown
    const soonest = flashProducts.reduce((a, b) =>
        new Date(a.sale.ends_at) < new Date(b.sale.ends_at) ? a : b
    );

    return (
        <section dir="rtl" className="py-4 px-1">
            {/* ── Simple header — matches existing section headers ── */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-red-500" />
                    <h2 className="text-sm font-cairo font-bold">عروض فلاش</h2>
                </div>
                <HeaderCountdown endsAt={soonest.sale.ends_at} />
            </div>

            {/* ── Horizontal scroll of EXISTING ProductCards ── */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar">
                {flashProducts.map(({ product }) => (
                    <div key={product.id} className="snap-start shrink-0 w-[42vw] max-w-[180px]">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default memo(FlashSaleSection);
export { useCountdown };
