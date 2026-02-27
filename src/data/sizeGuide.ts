/**
 * Size guide types — kept for reference / backwards compatibility.
 * All actual data is now fetched from the database.
 */

export interface Measurement {
    label: string;
    key: string;
    unit: "cm" | "kg";
}

export interface SizeRow {
    size: string;
    values: Record<string, number | string>;
}

export interface SizeGuideCategory {
    slug: string;
    nameAr: string;
    measurements: Measurement[];
    sizes: SizeRow[];
    howToMeasure: { key: string; instruction: string }[];
    tips: string[];
}

export interface SizeRecommendation {
    weight: [number, number];
    height: [number, number];
    size: string;
}

// All size guide data is now in the database.
// Use the Supabase tables: size_guide_fields, category_size_fields, product_size_guide
