import { motion } from "framer-motion";
import { ReactNode } from "react";

const variants = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
        >
            {children}
        </motion.div>
    );
}

export const staggerContainer = {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const fadeUpItem = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
};
