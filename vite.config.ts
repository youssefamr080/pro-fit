import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
        hmr: { overlay: false },
    },
    plugins: [
        react({
            // Optimization for barrel imports
            /* We don't have optimizePackageImports in SWC standard plugin yet, but we can rely on tree-shaking
               or explicitly use babel-plugin-import. For SWC, Vite usually handles it via optimizeDeps. */
        }),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.ico", "robots.txt"],
            manifest: {
                name: "PRO FIT — أزياء عصرية",
                short_name: "PRO FIT",
                description: "PRO FIT — تسوق أحدث صيحات الموضة الرياضية",
                start_url: "/",
                display: "standalone",
                background_color: "#ffffff",
                theme_color: "#0a0a0a",
                orientation: "portrait",
                lang: "ar",
                dir: "rtl",
                icons: [
                    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
                    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
                ],
            },
            workbox: {
                navigateFallback: "/index.html",
                navigateFallbackDenylist: [/^\/~oauth/],
                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
                runtimeCaching: [
                    {
                        // Vendor JS chunks — immutable, cache forever
                        urlPattern: /\/assets\/vendor-.*\.js$/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "vendor-js-cache",
                            expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
                        },
                    },
                    {
                        // Cache images (product images from Supabase Storage)
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "images-cache",
                            expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
                        },
                    },
                    {
                        // Cache Supabase API responses with network-first
                        urlPattern: /supabase\.co\/rest/i,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "api-cache",
                            expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
                            networkTimeoutSeconds: 5,
                        },
                    },
                    {
                        // Cache Google Fonts
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "fonts-cache",
                            expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
                        },
                    },
                ],
            },
        }),
    ].filter(Boolean),
    resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
        dedupe: ["react", "react-dom", "framer-motion"],
    },
    optimizeDeps: {
        include: ["framer-motion"],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    "vendor-react": ["react", "react-dom", "react-router-dom"],
                    "vendor-motion": ["framer-motion"],
                    "vendor-supabase": ["@supabase/supabase-js"],
                    "vendor-query": ["@tanstack/react-query"],
                },
            },
        },
    },
}));

