// Service Worker for Web Push Notifications + Auto Updates
// This file handles push events, notification clicks, and update lifecycle

// Handle skip waiting message from UpdatePrompt
self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('push', function (event) {
    const options = {
        body: 'عرض جديد من PRO FIT! لا تفوّت الخصومات',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        dir: 'rtl',
        lang: 'ar',
        data: {
            url: '/'
        },
        actions: [
            { action: 'open', title: 'فتح التطبيق' },
            { action: 'close', title: 'إغلاق' }
        ]
    };

    try {
        const data = event.data ? event.data.json() : {};
        options.body = data.body || options.body;
        options.data.url = data.url || '/';
        event.waitUntil(
            self.registration.showNotification(data.title || 'PRO FIT', options)
        );
    } catch (e) {
        event.waitUntil(
            self.registration.showNotification('PRO FIT', options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // If a tab is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
