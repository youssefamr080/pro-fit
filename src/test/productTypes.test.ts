import { describe, it, expect } from "vitest";
import type { Product, CartItem, ProductVariant, CategorySlug } from "@/types/product";

describe("Product Types", () => {
    describe("Type structure validation", () => {
        it("should create a valid Product object", () => {
            const product: Product = {
                id: "test-1",
                title: "تي شيرت أسود",
                price: 199,
                sale_price: 149,
                description: "تي شيرت قطن مصري",
                images: ["img.jpg"],
                category: "فانلات",
                variants: [{ size: "M", color: "أسود", colorHex: "#000", stock: 5 }],
                tags: ["جديد"],
                brand: "PRO FIT",
                sku: "TS-001",
                stock: 20,
            };
            expect(product.id).toBeTruthy();
            expect(product.images).toBeInstanceOf(Array);
            expect(product.variants[0].stock).toBe(5);
        });

        it("should create a valid CartItem", () => {
            const cartItem: CartItem = {
                product: {
                    id: "p1", title: "Test", price: 100, sale_price: null,
                    description: "", images: [], category: "c", variants: [],
                    tags: [], brand: "PRO FIT", sku: "S1", stock: 10,
                },
                size: "L",
                color: "أسود",
                quantity: 2,
            };
            expect(cartItem.quantity).toBe(2);
            expect(cartItem.size).toBe("L");
        });

        it("CategorySlug should be a string type", () => {
            const slug: CategorySlug = "any-category-slug";
            expect(typeof slug).toBe("string");
        });
    });
});
