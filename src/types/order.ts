export interface OrderItem {
    title: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image?: string;
}

export interface Order {
    id: string;
    created_at: string;
    status: string;
    total: number;
    items: OrderItem[];
    delivery_address: string;
    delivery_city: string | null;
    payment_method: string;
}

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
    confirmed: { label: "تم التأكيد", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    shipping: { label: "جاري الشحن", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
    delivered: { label: "تم التوصيل", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    cancelled: { label: "ملغي", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};
