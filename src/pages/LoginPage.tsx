import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCustomer } from "@/context/CustomerContext";
import PageTransition from "@/components/PageTransition";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, MapPin, ChevronDown } from "lucide-react";
import { useShippingRates } from "@/hooks/useShippingRates";
import SEO from "@/components/SEO";

const validatePhone = (phone: string) => /^01[0125][0-9]{8}$/.test(phone);

export default function LoginPage() {
    const { login } = useCustomer();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
    const [submitting, setSubmitting] = useState(false);
    const { data: shippingRates = [], isLoading: shippingLoading } = useShippingRates();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.name.trim().length < 3) {
            toast({ title: "الاسم قصير جداً", description: "أدخل الاسم بالكامل (٣ حروف على الأقل)", variant: "destructive" });
            return;
        }
        if (!validatePhone(form.phone.trim())) {
            toast({ title: "رقم الهاتف غير صحيح", description: "أدخل رقم مصري صحيح (01XXXXXXXXX)", variant: "destructive" });
            return;
        }
        if (!form.city) {
            toast({ title: "اختر المحافظة", description: "اختر محافظتك من القائمة", variant: "destructive" });
            return;
        }
        if (form.address.trim().length < 10) {
            toast({ title: "العنوان غير مكتمل", description: "أدخل عنوان تفصيلي يشمل الشارع والمبنى", variant: "destructive" });
            return;
        }
        setSubmitting(true);
        const ok = await login(form.name.trim(), form.phone.trim(), form.address.trim(), form.city.trim());
        setSubmitting(false);
        if (ok) {
            // If there's browser history, go back; otherwise go to homepage
            if (window.history.length > 2) {
                navigate(-1);
            } else {
                navigate("/", { replace: true });
            }
        }
    };

    return (
        <PageTransition>
            <SEO title="تسجيل الدخول" description="سجّل بياناتك للطلب بسهولة من PRO FIT" />
            <div className="font-cairo min-h-screen flex flex-col items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm"
                >
                    <div className="text-center mb-10 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#389a9c]/10 blur-3xl rounded-full pointer-events-none" />
                        <h1 className="text-3xl font-black tracking-tight text-[#389a9c] relative">PRO FIT</h1>
                        <p className="text-sm text-muted-foreground mt-2 relative">سجّل بياناتك للطلب بسهولة</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0 }} className="relative group">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#389a9c] transition-colors z-10 w-5 h-5 flex items-center justify-center">
                                <User className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                className="w-full bg-secondary pr-12 pl-4 py-3.5 text-sm outline-none font-cairo border border-border rounded-xl focus:border-[#389a9c] focus:bg-background transition-all peer placeholder-transparent"
                                placeholder="الاسم بالكامل"
                                id="nameInput"
                            />
                            <label htmlFor="nameInput" className="absolute right-12 text-sm text-muted-foreground transition-all duration-200 pointer-events-none 
                                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-background peer-focus:px-2 peer-focus:text-[#389a9c]
                                peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-2
                                top-3.5">
                                الاسم بالكامل
                            </label>
                        </motion.div>

                        {/* Phone */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="relative group">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#389a9c] transition-colors z-10 w-5 h-5 flex items-center justify-center">
                                <Phone className="h-4 w-4" />
                            </div>
                            <input
                                type="tel"
                                required
                                value={form.phone}
                                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                className="w-full bg-secondary pr-12 pl-4 py-3.5 text-sm outline-none font-cairo border border-border rounded-xl focus:border-[#389a9c] focus:bg-background transition-all peer placeholder-transparent text-left"
                                dir="ltr"
                                placeholder="رقم الهاتف"
                                id="phoneInput"
                            />
                            <label htmlFor="phoneInput" className="absolute right-12 text-sm text-muted-foreground transition-all duration-200 pointer-events-none 
                                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-background peer-focus:px-2 peer-focus:text-[#389a9c]
                                peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-2
                                top-3.5">
                                رقم الهاتف
                            </label>
                        </motion.div>

                        {/* Governorate (Dropdown) */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 }} className="relative group">
                            <label className="text-xs font-bold text-muted-foreground mb-1.5 block px-1">المحافظة</label>
                            <div className="relative">
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <select
                                    required
                                    value={form.city}
                                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                                    className="w-full bg-secondary px-4 py-3.5 text-sm outline-none font-cairo border border-border rounded-xl focus:border-[#389a9c] focus:bg-background transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">— اختر المحافظة —</option>
                                    {shippingLoading ? (
                                        <option disabled>جاري التحميل...</option>
                                    ) : (
                                        shippingRates.map((rate) => (
                                            <option key={rate.id} value={rate.governorate}>
                                                {rate.governorate}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </motion.div>

                        {/* Address */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 }} className="relative group mt-2">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#389a9c] transition-colors z-10 w-5 h-5 flex items-center justify-center">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                required
                                value={form.address}
                                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                                className="w-full bg-secondary pr-12 pl-4 py-3.5 text-sm outline-none font-cairo border border-border rounded-xl focus:border-[#389a9c] focus:bg-background transition-all peer placeholder-transparent"
                                placeholder="الشارع، المبنى، الشقة"
                                id="addressInput"
                            />
                            <label htmlFor="addressInput" className="absolute right-12 text-sm text-muted-foreground transition-all duration-200 pointer-events-none 
                                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-background peer-focus:px-2 peer-focus:text-[#389a9c]
                                peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-2
                                top-3.5">
                                تفاصيل العنوان
                            </label>
                        </motion.div>

                        <motion.button
                            type="submit"
                            disabled={submitting}
                            whileTap={{ scale: 0.97 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 mt-2"
                        >
                            {submitting ? "جارٍ التسجيل..." : "تسجيل الدخول"}
                        </motion.button>
                    </form>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        لو رقمك مسجل عندنا هنسجلك دخول تلقائي 😊
                    </p>
                </motion.div>
            </div>
        </PageTransition>
    );
}

