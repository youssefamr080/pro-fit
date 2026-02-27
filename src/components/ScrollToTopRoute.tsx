import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A utility component that automatically scrolls the window to the top
 * whenever the route (pathname) changes.
 */
export default function ScrollToTopRoute() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Reset scroll position to top instantly when navigation occurs
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
