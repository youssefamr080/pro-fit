import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { RecentProvider } from "@/context/RecentContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { CompareProvider } from "@/context/CompareContext";
import { LoyaltyProvider } from "@/context/LoyaltyContext";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstallPrompt from "@/components/InstallPrompt";
import ScrollToTopRoute from "@/components/ScrollToTopRoute";

// ── Lazy-loaded pages (code splitting) ──
const HomePage = lazy(() => import("@/pages/HomePage"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrderTrackingPage = lazy(() => import("@/pages/OrderTrackingPage"));
const MyOrdersPage = lazy(() => import("@/pages/MyOrdersPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const OfflinePage = lazy(() => import("@/pages/OfflinePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const LoyaltyPage = lazy(() => import("@/pages/LoyaltyPage"));
const SalesPage = lazy(() => import("@/pages/SalesPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground font-cairo">جارٍ التحميل...</p>
            </div>
        </div>
    );
}

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
                <Route element={<AppShell />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/order-tracking" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
                    <Route path="/order-tracking/:orderId" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
                    <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Route>
                <Route path="/offline" element={<OfflinePage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AnimatePresence>
    );
}

const App = () => (
    <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <CustomerProvider>
                    <LoyaltyProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <RecentProvider>
                                    <NotificationProvider>
                                        <CompareProvider>
                                            <Toaster />
                                            <Sonner />
                                            <InstallPrompt />
                                            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                                <ScrollToTopRoute />
                                                <Suspense fallback={<PageLoader />}>
                                                    <AnimatedRoutes />
                                                </Suspense>
                                            </BrowserRouter>
                                        </CompareProvider>
                                    </NotificationProvider>
                                </RecentProvider>
                            </WishlistProvider>
                        </CartProvider>
                    </LoyaltyProvider>
                </CustomerProvider>
            </TooltipProvider>
        </QueryClientProvider>
    </ErrorBoundary>
);

export default App;
