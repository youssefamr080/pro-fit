import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 font-cairo text-center">
            <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-8xl font-black text-foreground/10 mb-4"
            >
                404
            </motion.p>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-black mb-2"
            >
                الصفحة غير موجودة
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground mb-8 max-w-xs"
            >
                الصفحة اللي بتدور عليها مش موجودة أو تم نقلها
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.97 }}
            >
                <Link
                    to="/"
                    className="bg-foreground text-background px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                >
                    <Home className="h-4 w-4" />
                    الرجوع للرئيسية
                </Link>
            </motion.div>
        </div>
    );
}
