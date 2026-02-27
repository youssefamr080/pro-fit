import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCustomer } from "@/context/CustomerContext";

interface Props {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * Wraps routes that require authentication.
 * Redirects to login page if no customer is logged in.
 */
export default function ProtectedRoute({ children, redirectTo = "/login" }: Props) {
    const { customer, loading } = useCustomer();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!customer) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
