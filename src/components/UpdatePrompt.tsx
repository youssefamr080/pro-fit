import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";

/**
 * PWA Update Prompt component.
 * Detects when a new service worker is available and prompts the user to refresh.
 * This ensures that updates to the app are automatically pushed to installed PWA users.
 */
export default function UpdatePrompt() {
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        const checkForUpdates = async () => {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (!registration) return;

                // Check if there's already a waiting worker
                if (registration.waiting) {
                    setWaitingWorker(registration.waiting);
                    setShowUpdatePrompt(true);
                }

                // Listen for new updates
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                            // New update available
                            setWaitingWorker(newWorker);
                            setShowUpdatePrompt(true);
                        }
                    });
                });

                // Periodic check for updates (every 60 minutes)
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
            } catch (err) {
                console.error("SW update check failed:", err);
            }
        };

        checkForUpdates();

        // Listen for the controlling service worker changing
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });
    }, []);

    const handleUpdate = () => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: "SKIP_WAITING" });
        }
        setShowUpdatePrompt(false);
    };

    const handleDismiss = () => {
        setShowUpdatePrompt(false);
    };

    return (
        <AnimatePresence>
            {showUpdatePrompt && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed top-16 left-4 right-4 bg-blue-600 text-white shadow-2xl p-4 rounded-xl z-[100] font-cairo max-w-lg mx-auto"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold">تحديث جديد متاح! 🎉</p>
                                <p className="text-xs opacity-80 mt-0.5">حدّث التطبيق للحصول على أحدث الميزات</p>
                            </div>
                        </div>
                        <button onClick={handleDismiss} className="text-white/60 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <button
                        onClick={handleUpdate}
                        className="w-full mt-3 bg-white text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
                    >
                        تحديث الآن
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
