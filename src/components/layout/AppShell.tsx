import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import UpdatePrompt from "@/components/UpdatePrompt";
import ScrollToTop from "@/components/ScrollToTop";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function AppShell() {
    // Activates network status monitoring (shows toast on offline/online)
    useNetworkStatus();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 pb-14">
                <Outlet />
            </main>
            <BottomNav />
            <FloatingWhatsApp />
            <UpdatePrompt />
            <ScrollToTop />
        </div>
    );
}
