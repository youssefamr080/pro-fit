import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BDEJaE6n65ruObBx65p08lgpiIHqYBI-jqvRbxpGPzhWJ_O4HWDvT18nlkqLi6VWjULeUE0d9uoKEnHo4ZvZghg";

/**
 * Hook for managing Web Push Notifications.
 * Registers push SW, subscribes via VAPID, and saves subscription to Supabase.
 */
export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
        setIsSupported(supported);
        if (supported) {
            setPermission(Notification.permission);
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    setIsSubscribed(!!sub);
                });
            });
        }
    }, []);

    const subscribe = useCallback(async (customerId?: string) => {
        if (!isSupported) return false;

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            if (perm !== "granted") return false;

            const registration = await navigator.serviceWorker.register("/push-sw.js");
            await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
            });

            // Save subscription to Supabase
            const subJson = subscription.toJSON();
            // @ts-expect-error: push_subscriptions table exists but types not regenerated
            await supabase.from("push_subscriptions").upsert({
                endpoint: subJson.endpoint,
                keys: subJson.keys,
                customer_id: customerId || null,
                subscribed_at: new Date().toISOString(),
            }, { onConflict: "endpoint" });

            setIsSubscribed(true);
            return true;
        } catch (err) {
            console.error("Push subscription failed:", err);
            return false;
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                const endpoint = subscription.endpoint;
                await subscription.unsubscribe();
                // Remove from Supabase
                // @ts-expect-error: push_subscriptions table
                await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
                setIsSubscribed(false);
            }
        } catch (err) {
            console.error("Unsubscribe failed:", err);
        }
    }, []);

    return { isSupported, isSubscribed, permission, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
