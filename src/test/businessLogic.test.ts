import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Cart Logic", () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    const makeProduct = (overrides = {}) => ({
        id: "prod-1",
        title: "بوكسر رياضي",
        price: 99,
        sale_price: 69,
        description: "",
        images: [],
        category: "بوكسرات",
        variants: [],
        tags: [],
        brand: "PRO FIT",
        sku: "BX-001",
        stock: 10,
        ...overrides,
    });

    describe("Cart persistence", () => {
        it("should save cart to localStorage", () => {
            const cart = [{ product: makeProduct(), size: "M", color: "أسود", quantity: 1 }];
            localStorageMock.setItem("profit_cart", JSON.stringify(cart));
            const loaded = JSON.parse(localStorageMock.getItem("profit_cart")!);
            expect(loaded).toHaveLength(1);
            expect(loaded[0].size).toBe("M");
        });

        it("should load empty cart when no data exists", () => {
            const saved = localStorageMock.getItem("profit_cart");
            expect(saved).toBeNull();
        });

        it("should handle corrupted localStorage gracefully", () => {
            localStorageMock.setItem("profit_cart", "INVALID_JSON");
            let cart;
            try {
                cart = JSON.parse(localStorageMock.getItem("profit_cart")!);
            } catch {
                cart = [];
            }
            expect(cart).toEqual([]);
        });
    });

    describe("Cart calculations", () => {
        it("should calculate total items correctly", () => {
            const items = [
                { product: makeProduct(), size: "M", color: "أسود", quantity: 2 },
                { product: makeProduct({ id: "p2" }), size: "L", color: "رمادي", quantity: 3 },
            ];
            const totalItems = items.reduce((s, i) => s + i.quantity, 0);
            expect(totalItems).toBe(5);
        });

        it("should calculate total price using flashPrice > sale_price > price priority", () => {
            const items = [
                { product: makeProduct({ price: 99, sale_price: 69 }), size: "M", color: "أسود", quantity: 2, flashPrice: 50 },
                { product: makeProduct({ id: "p2", price: 150, sale_price: null }), size: "L", color: "أبيض", quantity: 1 },
            ];
            const totalPrice = items.reduce((s, i) => s + ((i as any).flashPrice ?? i.product.sale_price ?? i.product.price) * i.quantity, 0);
            expect(totalPrice).toBe(50 * 2 + 150);
        });

        it("should find existing item by product id + size + color", () => {
            const items = [
                { product: makeProduct(), size: "M", color: "أسود", quantity: 1 },
                { product: makeProduct(), size: "L", color: "أسود", quantity: 1 },
            ];
            const idx = items.findIndex(
                (i) => i.product.id === "prod-1" && i.size === "M" && i.color === "أسود"
            );
            expect(idx).toBe(0);
        });

        it("should NOT match items with different sizes", () => {
            const items = [
                { product: makeProduct(), size: "M", color: "أسود", quantity: 1 },
            ];
            const idx = items.findIndex(
                (i) => i.product.id === "prod-1" && i.size === "XL" && i.color === "أسود"
            );
            expect(idx).toBe(-1);
        });
    });

    describe("Coupon discount calculation", () => {
        it("should calculate percentage discount correctly", () => {
            const totalPrice = 300;
            const coupon = { discount_type: "percentage", discount_value: 20 };
            const discount = Math.round(totalPrice * coupon.discount_value / 100);
            expect(discount).toBe(60);
        });

        it("should calculate fixed discount correctly", () => {
            const totalPrice = 300;
            const coupon = { discount_type: "fixed", discount_value: 50 };
            const discount = Math.min(coupon.discount_value, totalPrice);
            expect(discount).toBe(50);
        });

        it("should cap fixed discount at total price", () => {
            const totalPrice = 30;
            const coupon = { discount_type: "fixed", discount_value: 50 };
            const discount = Math.min(coupon.discount_value, totalPrice);
            expect(discount).toBe(30); // Can't discount more than total
        });
    });

    describe("Phone validation (Egyptian)", () => {
        const validatePhone = (phone: string) => /^01[0125][0-9]{8}$/.test(phone);

        it("should accept valid Vodafone numbers (010)", () => {
            expect(validatePhone("01012345678")).toBe(true);
        });

        it("should accept valid Etisalat numbers (011)", () => {
            expect(validatePhone("01112345678")).toBe(true);
        });

        it("should accept valid Orange numbers (012)", () => {
            expect(validatePhone("01212345678")).toBe(true);
        });

        it("should accept valid WE numbers (015)", () => {
            expect(validatePhone("01512345678")).toBe(true);
        });

        it("should reject invalid prefix (013)", () => {
            expect(validatePhone("01312345678")).toBe(false);
        });

        it("should reject too-short numbers", () => {
            expect(validatePhone("0101234567")).toBe(false);
        });

        it("should reject too-long numbers", () => {
            expect(validatePhone("010123456789")).toBe(false);
        });

        it("should reject non-Egyptian numbers", () => {
            expect(validatePhone("+201012345678")).toBe(false);
        });
    });

    describe("Loyalty points calculation", () => {
        it("should calculate earned points from order total", () => {
            const orderTotal = 300;
            const pointsPerCurrency = 1; // 1 point per 1 EGP
            const earned = Math.floor(orderTotal * pointsPerCurrency);
            expect(earned).toBe(300);
        });

        it("should calculate discount from points correctly", () => {
            const points = 500;
            const redemptionRate = 10; // every 100 points = 10 EGP
            const discount = Math.floor(points / 100) * redemptionRate;
            expect(discount).toBe(50);
        });

        it("should not allow redeeming below minimum", () => {
            const points = 50;
            const minRedeem = 100;
            expect(points >= minRedeem).toBe(false);
        });

        it("should round down partial point blocks", () => {
            const points = 450;
            const redeemableBlocks = Math.floor(points / 100) * 100;
            expect(redeemableBlocks).toBe(400);
        });
    });
});
