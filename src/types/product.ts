export interface ProductVariant {
    size: string;
    color: string;
    colorHex: string;
    stock: number;
}

export interface Product {
    id: string;
    title: string;
    price: number;
    sale_price: number | null;
    description: string;
    images: string[];
    category: string;
    variants: ProductVariant[];
    tags: string[];
    brand: string;
    sku: string;
    stock: number;
}

export type CategorySlug = string;

export interface CartItem {
    product: Product;
    size: string;
    color: string;
    quantity: number;
    /** Flash sale price locked in at add time — overrides sale_price/price in cart total */
    flashPrice?: number;
}
