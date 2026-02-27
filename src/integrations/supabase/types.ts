export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            announcements: {
                Row: {
                    active: boolean
                    bg_color: string
                    created_at: string
                    ends_at: string | null
                    id: string
                    sort_order: number
                    starts_at: string | null
                    text: string
                    text_color: string
                }
                Insert: {
                    active?: boolean
                    bg_color?: string
                    created_at?: string
                    ends_at?: string | null
                    id?: string
                    sort_order?: number
                    starts_at?: string | null
                    text: string
                    text_color?: string
                }
                Update: {
                    active?: boolean
                    bg_color?: string
                    created_at?: string
                    ends_at?: string | null
                    id?: string
                    sort_order?: number
                    starts_at?: string | null
                    text?: string
                    text_color?: string
                }
                Relationships: []
            }
            banners: {
                Row: {
                    active: boolean
                    bg_color: string
                    created_at: string
                    cta_link: string
                    cta_text: string
                    id: string
                    image: string
                    sort_order: number
                    subtitle: string
                    title: string
                }
                Insert: {
                    active?: boolean
                    bg_color?: string
                    created_at?: string
                    cta_link?: string
                    cta_text?: string
                    id?: string
                    image?: string
                    sort_order?: number
                    subtitle?: string
                    title?: string
                }
                Update: {
                    active?: boolean
                    bg_color?: string
                    created_at?: string
                    cta_link?: string
                    cta_text?: string
                    id?: string
                    image?: string
                    sort_order?: number
                    subtitle?: string
                    title?: string
                }
                Relationships: []
            }
            categories: {
                Row: {
                    active: boolean
                    color: string
                    created_at: string
                    id: string
                    image: string | null
                    name: string
                    slug: string
                    sort_order: number
                }
                Insert: {
                    active?: boolean
                    color?: string
                    created_at?: string
                    id?: string
                    image?: string | null
                    name: string
                    slug: string
                    sort_order?: number
                }
                Update: {
                    active?: boolean
                    color?: string
                    created_at?: string
                    id?: string
                    image?: string | null
                    name?: string
                    slug?: string
                    sort_order?: number
                }
                Relationships: []
            }
            category_size_fields: {
                Row: {
                    id: string
                    category_id: string
                    field_id: string
                    sort_order: number
                }
                Insert: {
                    id?: string
                    category_id: string
                    field_id: string
                    sort_order?: number
                }
                Update: {
                    id?: string
                    category_id?: string
                    field_id?: string
                    sort_order?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "category_size_fields_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "category_size_fields_field_id_fkey"
                        columns: ["field_id"]
                        isOneToOne: false
                        referencedRelation: "size_guide_fields"
                        referencedColumns: ["id"]
                    },
                ]
            }
            coupons: {
                Row: {
                    active: boolean
                    code: string
                    created_at: string
                    discount_type: string
                    discount_value: number
                    expires_at: string | null
                    id: string
                    max_uses: number | null
                    min_order: number | null
                    used_count: number
                }
                Insert: {
                    active?: boolean
                    code: string
                    created_at?: string
                    discount_type?: string
                    discount_value?: number
                    expires_at?: string | null
                    id?: string
                    max_uses?: number | null
                    min_order?: number | null
                    used_count?: number
                }
                Update: {
                    active?: boolean
                    code?: string
                    created_at?: string
                    discount_type?: string
                    discount_value?: number
                    expires_at?: string | null
                    id?: string
                    max_uses?: number | null
                    min_order?: number | null
                    used_count?: number
                }
                Relationships: []
            }
            customers: {
                Row: {
                    address: string
                    city: string | null
                    created_at: string
                    id: string
                    loyalty_points: number
                    name: string
                    phone: string
                    updated_at: string
                }
                Insert: {
                    address: string
                    city?: string | null
                    created_at?: string
                    id?: string
                    loyalty_points?: number
                    name: string
                    phone: string
                    updated_at?: string
                }
                Update: {
                    address?: string
                    city?: string | null
                    created_at?: string
                    id?: string
                    loyalty_points?: number
                    name?: string
                    phone?: string
                    updated_at?: string
                }
                Relationships: []
            }
            loyalty_settings: {
                Row: {
                    active: boolean
                    id: string
                    min_points_redeem: number
                    points_per_currency: number
                    redemption_rate: number
                    updated_at: string
                }
                Insert: {
                    active?: boolean
                    id?: string
                    min_points_redeem?: number
                    points_per_currency?: number
                    redemption_rate?: number
                    updated_at?: string
                }
                Update: {
                    active?: boolean
                    id?: string
                    min_points_redeem?: number
                    points_per_currency?: number
                    redemption_rate?: number
                    updated_at?: string
                }
                Relationships: []
            }
            loyalty_transactions: {
                Row: {
                    created_at: string
                    customer_id: string
                    description: string
                    id: string
                    order_id: string | null
                    points: number
                    type: string
                }
                Insert: {
                    created_at?: string
                    customer_id: string
                    description?: string
                    id?: string
                    order_id?: string | null
                    points: number
                    type?: string
                }
                Update: {
                    created_at?: string
                    customer_id?: string
                    description?: string
                    id?: string
                    order_id?: string | null
                    points?: number
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "loyalty_transactions_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notifications: {
                Row: {
                    body: string
                    created_at: string
                    customer_id: string
                    data: Json | null
                    id: string
                    read: boolean
                    title: string
                    type: string
                }
                Insert: {
                    body: string
                    created_at?: string
                    customer_id: string
                    data?: Json | null
                    id?: string
                    read?: boolean
                    title: string
                    type?: string
                }
                Update: {
                    body?: string
                    created_at?: string
                    customer_id?: string
                    data?: Json | null
                    id?: string
                    read?: boolean
                    title?: string
                    type?: string
                }
                Relationships: []
            }
            orders: {
                Row: {
                    created_at: string
                    customer_id: string
                    delivery_address: string
                    delivery_city: string | null
                    delivery_name: string
                    delivery_phone: string
                    id: string
                    items: Json
                    payment_method: string
                    status: string
                    total: number
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    customer_id: string
                    delivery_address: string
                    delivery_city?: string | null
                    delivery_name: string
                    delivery_phone: string
                    id?: string
                    items?: Json
                    payment_method?: string
                    status?: string
                    total?: number
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    customer_id?: string
                    delivery_address?: string
                    delivery_city?: string | null
                    delivery_name?: string
                    delivery_phone?: string
                    id?: string
                    items?: Json
                    payment_method?: string
                    status?: string
                    total?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_views: {
                Row: {
                    customer_id: string
                    id: string
                    product_id: string
                    viewed_at: string
                }
                Insert: {
                    customer_id: string
                    id?: string
                    product_id: string
                    viewed_at?: string
                }
                Update: {
                    customer_id?: string
                    id?: string
                    product_id?: string
                    viewed_at?: string
                }
                Relationships: []
            }
            product_size_guide: {
                Row: {
                    id: string
                    product_id: string
                    size: string
                    field_key: string
                    value: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    size: string
                    field_key: string
                    value?: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    size?: string
                    field_key?: string
                    value?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_size_guide_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    active: boolean
                    brand: string
                    category: string
                    created_at: string
                    description: string
                    id: string
                    images: Json
                    price: number
                    sale_price: number | null
                    sku: string
                    sort_order: number
                    stock: number
                    tags: string[]
                    title: string
                    updated_at: string
                    variants: Json
                }
                Insert: {
                    active?: boolean
                    brand?: string
                    category?: string
                    created_at?: string
                    description?: string
                    id?: string
                    images?: Json
                    price?: number
                    sale_price?: number | null
                    sku?: string
                    sort_order?: number
                    stock?: number
                    tags?: string[]
                    title: string
                    updated_at?: string
                    variants?: Json
                }
                Update: {
                    active?: boolean
                    brand?: string
                    category?: string
                    created_at?: string
                    description?: string
                    id?: string
                    images?: Json
                    price?: number
                    sale_price?: number | null
                    sku?: string
                    sort_order?: number
                    stock?: number
                    tags?: string[]
                    title?: string
                    updated_at?: string
                    variants?: Json
                }
                Relationships: []
            }
            reviews: {
                Row: {
                    comment: string | null
                    created_at: string
                    customer_id: string
                    id: string
                    product_id: string
                    rating: number
                }
                Insert: {
                    comment?: string | null
                    created_at?: string
                    customer_id: string
                    id?: string
                    product_id: string
                    rating: number
                }
                Update: {
                    comment?: string | null
                    created_at?: string
                    customer_id?: string
                    id?: string
                    product_id?: string
                    rating?: number
                }
                Relationships: []
            }
            size_guide_fields: {
                Row: {
                    id: string
                    key: string
                    label: string
                    unit: string
                    sort_order: number
                }
                Insert: {
                    id?: string
                    key: string
                    label: string
                    unit?: string
                    sort_order?: number
                }
                Update: {
                    id?: string
                    key?: string
                    label?: string
                    unit?: string
                    sort_order?: number
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const
