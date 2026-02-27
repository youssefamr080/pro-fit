import { describe, it, expect } from "vitest";
import { mapProduct, ALL_SIZES, ALL_COLORS } from "@/lib/productUtils";

describe("productUtils", () => {
    describe("mapProduct", () => {
        it("should map a raw DB row to a typed Product object", () => {
            const raw = {
                id: "abc-123",
                title: "بوكسر رياضي",
                price: "69",
                sale_price: "49",
                description: "بوكسر مرن",
                images: ["img1.jpg", "img2.jpg"],
                category: "بوكسرات",
                variants: [{ size: "M", color: "أسود", colorHex: "#1a1a1a", stock: 10 }],
                tags: ["الأكثر مبيعاً"],
                brand: "PRO FIT",
                sku: "BX-001",
                stock: 50,
            };

            const product = mapProduct(raw);

            expect(product.id).toBe("abc-123");
            expect(product.title).toBe("بوكسر رياضي");
            expect(product.price).toBe(69);
            expect(product.sale_price).toBe(49);
            expect(product.images).toHaveLength(2);
            expect(product.variants).toHaveLength(1);
            expect(product.tags).toContain("الأكثر مبيعاً");
        });

        it("should handle null sale_price", () => {
            const raw = { id: "1", title: "T", price: 100, sale_price: null, images: [], category: "c", variants: [], tags: [], brand: "", sku: "", stock: 0 };
            const product = mapProduct(raw);
            expect(product.sale_price).toBeNull();
        });

        it("should default brand to PRO FIT if missing", () => {
            const raw = { id: "1", title: "T", price: 100, sale_price: null, images: [], category: "c", variants: [], tags: [] };
            const product = mapProduct(raw);
            expect(product.brand).toBe("PRO FIT");
        });

        it("should default stock to 0 if missing", () => {
            const raw = { id: "1", title: "T", price: 100, sale_price: null, images: [], category: "c", variants: [], tags: [] };
            const product = mapProduct(raw);
            expect(product.stock).toBe(0);
        });

        it("should handle missing description gracefully", () => {
            const raw = { id: "1", title: "T", price: 100, sale_price: null, images: [], category: "c", variants: [], tags: [] };
            const product = mapProduct(raw);
            expect(product.description).toBe("");
        });

        it("should parse price as number even if string", () => {
            const raw = { id: "1", title: "T", price: "150.50", sale_price: "99.99", images: [], category: "c", variants: [], tags: [] };
            const product = mapProduct(raw);
            expect(product.price).toBe(150.50);
            expect(product.sale_price).toBe(99.99);
        });
    });

    describe("ALL_SIZES", () => {
        it("should contain standard sizes", () => {
            expect(ALL_SIZES).toContain("S");
            expect(ALL_SIZES).toContain("M");
            expect(ALL_SIZES).toContain("L");
            expect(ALL_SIZES).toContain("XL");
            expect(ALL_SIZES).toContain("XXL");
            expect(ALL_SIZES).toHaveLength(5);
        });
    });

    describe("ALL_COLORS", () => {
        it("should have name and hex for each color", () => {
            ALL_COLORS.forEach((c) => {
                expect(c.name).toBeTruthy();
                expect(c.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
            });
        });

        it("should include at least 5 colors", () => {
            expect(ALL_COLORS.length).toBeGreaterThanOrEqual(5);
        });
    });
});
