import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Detects online/offline status and shows toast notifications.
 * Provides current status for conditional UI rendering.
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { toast } = useToast();
    const [hasShownOffline, setHasShownOffline] = useState(false);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        if (hasShownOffline) {
            toast({
                title: "تم استعادة الاتصال ✅",
                description: "أنت متصل بالإنترنت مرة أخرى",
            });
            setHasShownOffline(false);
        }
    }, [toast, hasShownOffline]);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        setHasShownOffline(true);
        toast({
            title: "انقطع الاتصال بالإنترنت ⚠️",
            description: "بعض الميزات قد لا تعمل حتى يعود الاتصال",
            variant: "destructive",
        });
    }, [toast]);

    useEffect(() => {
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return { isOnline };
}
