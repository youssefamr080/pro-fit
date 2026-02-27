import type { Product } from "@/types/product";

/**
 * Maps a raw Supabase DB row to a typed Product object.
 * Centralized to avoid duplication across hooks.
 */
export function mapProduct(row: any): Product {
    return {
        id: row.id,
        title: row.title,
        price: Number(row.price),
        sale_price: row.sale_price != null ? Number(row.sale_price) : null,
        description: row.description || "",
        images: (row.images as string[]) || [],
        category: row.category,
        variants: (row.variants as Product["variants"]) || [],
        tags: (row.tags as Product["tags"]) || [],
        brand: row.brand || "PRO FIT",
        sku: row.sku || "",
        stock: row.stock || 0,
    };
}

/**
 * Available product sizes for filtering.
 */
export const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

/**
 * Available product colors with Arabic names and hex values.
 * Synced with admin dashboard palette (admin/src/data/colors.ts).
 */
export const ALL_COLORS = [
    // Neutrals
    { name: "أبيض", hex: "#FFFFFF" },
    { name: "أوف وايت", hex: "#FAF9F6" },
    { name: "بيج", hex: "#D4C5A9" },
    { name: "رمادي فاتح", hex: "#C0C0C0" },
    { name: "رمادي", hex: "#808080" },
    { name: "رمادي غامق", hex: "#404040" },
    { name: "فحمي", hex: "#36454F" },
    { name: "أسود", hex: "#1A1A1A" },
    // Blues
    { name: "أزرق فاتح", hex: "#87CEEB" },
    { name: "سماوي", hex: "#4FC3F7" },
    { name: "أزرق", hex: "#2196F3" },
    { name: "أزرق ملكي", hex: "#1A47B8" },
    { name: "كحلي", hex: "#1B2A4A" },
    { name: "تيل", hex: "#008080" },
    // Reds
    { name: "أحمر", hex: "#E53935" },
    { name: "نبيتي", hex: "#800020" },
    { name: "عنابي", hex: "#6B2737" },
    { name: "كورال", hex: "#FF7F50" },
    { name: "وردي", hex: "#E91E63" },
    // Greens
    { name: "أخضر", hex: "#4CAF50" },
    { name: "زيتي", hex: "#6B8E23" },
    { name: "أخضر زيتوني", hex: "#4B5320" },
    { name: "نعناعي", hex: "#98FF98" },
    // Warm
    { name: "أصفر", hex: "#FFEB3B" },
    { name: "ذهبي", hex: "#CFB53B" },
    { name: "خردلي", hex: "#FFDB58" },
    { name: "برتقالي", hex: "#FF9800" },
    // Purples
    { name: "بنفسجي فاتح", hex: "#B39DDB" },
    { name: "بنفسجي", hex: "#9C27B0" },
    { name: "موف", hex: "#E0B0FF" },
    // Browns
    { name: "بني فاتح", hex: "#D2B48C" },
    { name: "بني", hex: "#795548" },
    { name: "شوكولاته", hex: "#7B3F00" },
    { name: "جملي", hex: "#C19A6B" },
    { name: "قهوة", hex: "#6F4E37" },
    // Special
    { name: "ميليتري", hex: "#4A5D23" },
    { name: "جينز", hex: "#4169E1" },
];

