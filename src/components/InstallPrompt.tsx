import { useState, useEffect, useCallback } from "react";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_COOLDOWN_DAYS = 7;
const STORAGE_KEY_DISMISSED_AT = "pwa_prompt_dismissed_at";
const STORAGE_KEY_INSTALLED = "pwa_installed";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    // Check if we should show the prompt based on cooldown
    const shouldShowPrompt = useCallback(() => {
        // If user already installed, never show again
        if (localStorage.getItem(STORAGE_KEY_INSTALLED) === "true") return false;

        // Check if running as installed PWA (standalone mode)
        if (window.matchMedia("(display-mode: standalone)").matches) {
            localStorage.setItem(STORAGE_KEY_INSTALLED, "true");
            return false;
        }

        // Check cooldown period
        const dismissedAt = localStorage.getItem(STORAGE_KEY_DISMISSED_AT);
        if (dismissedAt) {
            const elapsed = Date.now() - parseInt(dismissedAt, 10);
            const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
            if (elapsed < cooldownMs) return false;
        }

        return true;
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            if (shouldShowPrompt()) {
                // Delay showing by 8 seconds to not overwhelm
                setTimeout(() => setShowPrompt(true), 8000);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Detect app installed event
        const installedHandler = () => {
            localStorage.setItem(STORAGE_KEY_INSTALLED, "true");
            setShowPrompt(false);
            setDeferredPrompt(null);
        };
        window.addEventListener("appinstalled", installedHandler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", installedHandler);
        };
    }, [shouldShowPrompt]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        setShowPrompt(false);
        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            localStorage.setItem(STORAGE_KEY_INSTALLED, "true");
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Store the timestamp so we can respect the cooldown
        localStorage.setItem(STORAGE_KEY_DISMISSED_AT, Date.now().toString());
    };

    return (
        <AnimatePresence>
            {showPrompt && deferredPrompt ? (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-20 left-4 right-4 bg-background border border-border shadow-2xl p-4 rounded-xl z-[100] font-cairo max-w-lg mx-auto"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center rounded-lg flex-shrink-0">
                                <img src="/icon-192.png" alt="App Icon" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">تطبيق PRO FIT</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">ثبّت التطبيق لتجربة تسوق أسرع وأفضل</p>
                            </div>
                        </div>
                        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        onClick={handleInstall}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded font-bold text-sm"
                    >
                        <Download className="h-4 w-4" />
                        تثبيت التطبيق
                    </button>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
