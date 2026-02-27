import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomer } from "@/context/CustomerContext";
import { Link } from "react-router-dom";

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    customer_name?: string;
}

interface Props {
    productId: string;
}

export default function ProductReviews({ productId }: Props) {
    const { customer } = useCustomer();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const fetchReviews = async () => {
        // @ts-expect-error: Supabase generated types cause deep instantiation with chained .eq()
        const { data } = await supabase
            .from("reviews")
            .select("id, rating, comment, created_at, customer_id")
            .eq("product_id", productId)
            .eq("approved", true)
            .order("created_at", { ascending: false });

        if (data && data.length > 0) {
            // Fetch customer names
            const customerIds = [...new Set(data.map(r => r.customer_id))];
            const { data: customers } = await supabase
                .from("customers")
                .select("id, name")
                .in("id", customerIds);

            const nameMap = new Map(customers?.map(c => [c.id, c.name]) || []);

            setReviews(data.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment || "",
                created_at: r.created_at,
                customer_name: nameMap.get(r.customer_id) || "عميل",
            })));
        } else {
            setReviews([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    // Check if user already reviewed
    useEffect(() => {
        if (!customer) return;
        const existing = reviews.find(r => r.customer_name === customer.name);
        // Simple check; real check is via unique index
    }, [reviews, customer]);

    const handleSubmit = async () => {
        if (!customer || rating === 0) return;
        setSubmitting(true);

        const { error } = await supabase.from("reviews").upsert(
            {
                product_id: productId,
                customer_id: customer.id,
                rating,
                comment: comment.trim(),
            },
            { onConflict: "customer_id,product_id" }
        );

        if (!error) {
            setSubmitted(true);
            setComment("");
            setRating(0);
            fetchReviews();
            setTimeout(() => setSubmitted(false), 2000);
        }
        setSubmitting(false);
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="space-y-4">
            {/* Header with average */}
            <div className="flex items-center justify-between">
                <p className="text-sm font-bold font-cairo">التقييمات والمراجعات</p>
                {avgRating && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="h-3 w-3" fill={i <= Math.round(Number(avgRating)) ? "currentColor" : "none"} strokeWidth={2} style={{ color: i <= Math.round(Number(avgRating)) ? "#f59e0b" : "#d1d5db" }} />
                            ))}
                        </div>
                        <span className="text-xs font-bold">{avgRating}</span>
                        <span className="text-[10px] text-muted-foreground">({reviews.length})</span>
                    </div>
                )}
            </div>

            {/* Write review form */}
            {customer ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-secondary p-3 rounded-xl space-y-3"
                >
                    <p className="text-xs font-bold font-cairo">أضف تقييمك</p>
                    {/* Star selector */}
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.8 }}
                                onMouseEnter={() => setHoverRating(i)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(i)}
                            >
                                <Star
                                    className="h-6 w-6 transition-colors"
                                    fill={(hoverRating || rating) >= i ? "currentColor" : "none"}
                                    style={{ color: (hoverRating || rating) >= i ? "#f59e0b" : "#d1d5db" }}
                                />
                            </motion.button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="اكتب رأيك عن المنتج... (اختياري)"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-cairo outline-none resize-none h-16 focus:border-foreground transition-colors"
                    />
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                            className="bg-foreground text-background px-4 py-2 text-xs font-bold font-cairo rounded-xl flex items-center gap-1.5 disabled:opacity-40"
                        >
                            <Send className="h-3 w-3" />
                            {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                        </motion.button>
                        <AnimatePresence>
                            {submitted && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs text-green-600 font-bold"
                                >
                                    ✓ تم إرسال تقييمك
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            ) : (
                <Link to="/login">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-secondary/60 border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary transition-colors"
                    >
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-bold text-muted-foreground font-cairo">سجّل دخولك لتضيف تقييمك ⭐</span>
                    </motion.div>
                </Link>
            )}

            {/* Reviews list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-secondary animate-pulse rounded" />)}
                </div>
            ) : reviews.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b border-border/50 pb-3"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
                                        {review.customer_name?.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold">{review.customer_name}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString("ar-EG")}
                                </span>
                            </div>
                            <div className="flex gap-0.5 mb-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="h-3 w-3" fill={i <= review.rating ? "currentColor" : "none"} style={{ color: i <= review.rating ? "#f59e0b" : "#d1d5db" }} />
                                ))}
                            </div>
                            {review.comment && (
                                <p className="text-xs text-muted-foreground font-cairo leading-relaxed">{review.comment}</p>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Hook to get average rating for product cards
export function useProductRating(productId: string) {
    const [avg, setAvg] = useState<number | null>(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from("reviews")
                .select("rating")
                .eq("product_id", productId);
            if (data && data.length > 0) {
                setAvg(data.reduce((s, r) => s + r.rating, 0) / data.length);
                setCount(data.length);
            }
        })();
    }, [productId]);

    return { avg, count };
}
