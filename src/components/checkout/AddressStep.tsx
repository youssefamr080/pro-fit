import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Truck, ChevronDown } from "lucide-react";
import type { ShippingRate } from "@/hooks/useShippingRates";

interface AddressForm {
    name: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
}

interface Props {
    form: AddressForm;
    setForm: React.Dispatch<React.SetStateAction<AddressForm>>;
    isAddressChanged: boolean;
    addressMode: "default" | "temp" | "permanent";
    setAddressMode: (mode: "default" | "temp" | "permanent") => void;
    onSubmit: (e: React.FormEvent) => void;
    shippingRates: ShippingRate[];
    shippingLoading: boolean;
}

const TEXT_FIELDS = [
    { id: "name", label: "الاسم بالكامل", placeholder: "محمد أحمد", type: "text" },
    { id: "phone", label: "رقم الهاتف", placeholder: "01XXXXXXXXX", type: "tel" },
];

export default function AddressStep({ form, setForm, isAddressChanged, addressMode, setAddressMode, onSubmit, shippingRates, shippingLoading }: Props) {
    const selectedRate = shippingRates.find(r => r.governorate === form.city);

    return (
        <motion.form
            key="address"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            onSubmit={onSubmit}
            className="px-4 pt-6 space-y-4"
        >
            <h2 className="text-lg font-black mb-2">عنوان التوصيل</h2>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-secondary p-3 text-xs text-muted-foreground"
            >
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>تم ملء بياناتك تلقائياً — يمكنك تعديل العنوان لهذا الطلب</span>
            </motion.div>

            {/* Name & Phone fields */}
            {TEXT_FIELDS.map((f) => (
                <div key={f.id} className="relative group mt-2 pt-2">
                    <input
                        type={f.type}
                        required
                        value={form[f.id as keyof AddressForm]}
                        onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                        className="w-full bg-secondary px-4 py-3.5 text-sm outline-none font-cairo border border-border rounded-xl focus:border-[#389a9c] focus:bg-background transition-all peer placeholder-transparent"
                        placeholder={f.label}
                        id={`${f.id}Input`}
                    />
                    <label htmlFor={`${f.id}Input`} className="absolute right-4 text-sm text-muted-foreground transition-all duration-200 pointer-events-none 
                        peer-focus:-top-1 peer-focus:text-xs peer-focus:bg-background peer-focus:px-2 peer-focus:text-[#389a9c]
                        peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-2
                        top-6">
                        {f.label}
                    </label>
                </div>
            ))}

            {/* Governorate dropdown */}
            <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">المحافظة</label>
                <div className="relative">
                    <select
                        required
                        value={form.city}
                        onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                        className="w-full bg-secondary px-3 py-2.5 text-sm outline-none font-cairo border border-border rounded-xl focus:border-foreground transition-colors appearance-none cursor-pointer"
                    >
                        <option value="">— اختر المحافظة —</option>
                        {shippingLoading ? (
                            <option disabled>جارٍ التحميل...</option>
                        ) : (
                            shippingRates.map((rate) => (
                                <option key={rate.id} value={rate.governorate}>
                                    {rate.governorate} — {rate.shipping_cost} ج.م ({rate.delivery_days})
                                </option>
                            ))
                        )}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Shipping cost preview */}
                {selectedRate ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-center gap-2 mt-2 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-xl text-xs font-bold"
                    >
                        <Truck className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                            مصاريف الشحن لـ {selectedRate.governorate}: <strong>{selectedRate.shipping_cost} ج.م</strong>
                            {selectedRate.delivery_days && ` — ${selectedRate.delivery_days}`}
                        </span>
                    </motion.div>
                ) : null}
            </div>

            {/* Address field */}
            <div className="relative group mt-2 pt-2">
                <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className="w-full bg-secondary px-4 py-3.5 text-sm outline-none font-cairo border border-border rounded-xl focus:border-[#389a9c] focus:bg-background transition-all peer placeholder-transparent"
                    placeholder="العنوان التفصيلي"
                    id="addressInput"
                />
                <label htmlFor="addressInput" className="absolute right-4 text-sm text-muted-foreground transition-all duration-200 pointer-events-none 
                    peer-focus:-top-1 peer-focus:text-xs peer-focus:bg-background peer-focus:px-2 peer-focus:text-[#389a9c]
                    peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-2
                    top-6">
                    العنوان التفصيلي (الشارع، المبنى، الشقة...)
                </label>
            </div>

            {isAddressChanged ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-secondary border border-border rounded-xl p-4 space-y-3"
                >
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span>لاحظنا تغيير في العنوان</span>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2 cursor-pointer">
                            <input type="radio" name="addressMode" checked={addressMode === "temp"} onChange={() => setAddressMode("temp")} className="accent-foreground" />
                            <div>
                                <p className="text-sm font-bold">لهذا الطلب فقط</p>
                                <p className="text-xs text-muted-foreground">العنوان القديم يظل الافتراضي</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 cursor-pointer">
                            <input type="radio" name="addressMode" checked={addressMode === "permanent"} onChange={() => setAddressMode("permanent")} className="accent-foreground" />
                            <div>
                                <p className="text-sm font-bold">تغيير دائم</p>
                                <p className="text-xs text-muted-foreground">هذا العنوان يصبح الافتراضي</p>
                            </div>
                        </label>
                    </div>
                </motion.div>
            ) : null}

            <div className="relative group mt-2 pt-2">
                <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-secondary px-4 py-3.5 text-sm outline-none font-cairo resize-none border border-border rounded-xl focus:border-[#389a9c] focus:bg-background transition-all peer placeholder-transparent"
                    placeholder="ملاحظات (اختياري)"
                    id="notesInput"
                />
                <label htmlFor="notesInput" className="absolute right-4 text-sm text-muted-foreground transition-all duration-200 pointer-events-none 
                    peer-focus:-top-1 peer-focus:text-xs peer-focus:bg-background peer-focus:px-2 peer-focus:text-[#389a9c]
                    peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-2
                    top-6">
                    ملاحظات للطلب (اختياري)
                </label>
            </div>
            <button type="submit" className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-sm mt-2">
                التالي — اختر طريقة الدفع
            </button>
        </motion.form>
    );
}
