import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 font-cairo text-center">
            <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-8"
            >
                <WifiOff className="h-20 w-20 text-muted-foreground mx-auto" strokeWidth={1} />
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-black mb-3"
            >
                لا يوجد اتصال بالإنترنت
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground mb-10 max-w-xs leading-relaxed"
            >
                تحقق من اتصالك بالإنترنت وحاول مجدداً. يمكنك تصفح الصفحات التي زرتها من قبل.
            </motion.p>
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.reload()}
                className="bg-foreground text-background px-8 py-3 rounded-xl font-bold text-sm mb-4 w-full max-w-xs"
            >
                إعادة المحاولة
            </motion.button>
        </div>
    );
}
