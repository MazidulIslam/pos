"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

export function AuthGuard({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            // Check if token is expired
            const payloadBase64 = token.split('.')[1];
            if (payloadBase64) {
                const decodedJson = atob(payloadBase64);
                const decodedPayload = JSON.parse(decodedJson);
                if (decodedPayload.exp && (decodedPayload.exp * 1000 < Date.now())) {
                    console.warn("Session expired. Redirecting to login...");
                    localStorage.clear();
                    router.push("/login");
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to decode token", e);
            localStorage.clear();
            router.push("/login");
            return;
        }

        try {
            const storedMenus = localStorage.getItem("menus");
            const storedPerms = localStorage.getItem("permissions");
            
            if (storedMenus && storedPerms) {
                const menus = JSON.parse(storedMenus);
                const perms = JSON.parse(storedPerms);

                // Helper to find the safest fallback route
                const getFallbackRoute = () => {
                    const firstMenu = menus.find(m => m.path && m.path !== "/");
                    return firstMenu ? firstMenu.path : "/login";
                };

                // Super Admin override
                if (perms.includes("*")) {
                    setIsAuthenticated(true);
                    return;
                }

                // Root-level components (No explicit map requirement)
                if (pathname.startsWith("/profile") || pathname.startsWith("/settings/account")) {
                    setIsAuthenticated(true);
                    return;
                }

                // Pathname exactly matches a registered allowed menu
                const exactMenu = menus.find(m => m.path === pathname);
                if (exactMenu) {
                    setIsAuthenticated(true);
                    return;
                }

                // If this is the Dashboard ("/") and we have NO exact menu match, the user lacks Dashboard access!
                if (pathname === "/") {
                    router.push(getFallbackRoute());
                    return;
                }

                // Check for valid dynamic sub-routes tied to an allowed parent menu (e.g. /products/create -> /products)
                const matchedParents = menus.filter(m => m.path && m.path !== "/" && pathname.startsWith(m.path + "/"));
                
                if (matchedParents.length > 0) {
                    matchedParents.sort((a, b) => b.path.length - a.path.length);
                    const parentMenu = matchedParents[0];
                    const slug = parentMenu.slug; 
                    const remainingPath = pathname.replace(parentMenu.path, "");

                    let isAuthorizedChild = false;

                    if (remainingPath.includes("/create")) {
                        if (perms.includes(`${slug}.create`)) isAuthorizedChild = true;
                    } else if (remainingPath.includes("/edit") || remainingPath.includes("/update")) {
                        if (perms.includes(`${slug}.update`)) isAuthorizedChild = true;
                    } else if (remainingPath.includes("/view") || remainingPath.match(/\/\d+/)) {
                        if (perms.includes(`${slug}.view`)) isAuthorizedChild = true;
                    }

                    if (isAuthorizedChild) {
                        setIsAuthenticated(true);
                        return;
                    }
                }

                // If path maps to nothing authorized, bounce them to their closest accessible page
                router.push(getFallbackRoute());
                return;
            }

            // Fallback authorization (Uncached)
            setIsAuthenticated(true);
        } catch (error) {
            console.error("AuthGuard Exception", error);
            setIsAuthenticated(true); // Failsafe fallback
        }
    }, [router, pathname]);

    if (!isAuthenticated) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return <>{children}</>;
}
