"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs as MUIBreadcrumbs, Typography, Box } from "@mui/material";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumbs = () => {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Return empty if we're on the dashboard root
    if (pathname === "/") return [];

    const segments = pathname.split("/").filter(Boolean);
    let currentPath = "";
    
    // Attempt to get menu names from localStorage for better labels
    let menuMap = {};
    try {
      const stored = localStorage.getItem("menus");
      if (stored) {
        const flatMenus = JSON.parse(stored);
        flatMenus.forEach(m => {
          menuMap[m.path] = m.name;
        });
      }
    } catch (e) {}

    return segments.map((segment, index) => {
      currentPath += `/${segment}`;
      
      // Look for a label in the menu map first
      let label = menuMap[currentPath];
      
      // Fallback: Format the slug (e.g. "users-list" -> "Users List")
      if (!label) {
        label = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      return {
        label,
        href: currentPath,
        isLast: index === segments.length - 1
      };
    });
  }, [pathname]);

  if (breadcrumbs.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <MUIBreadcrumbs 
        separator={<ChevronRight size={14} style={{ opacity: 0.5 }} />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            alignItems: "center"
          }
        }}
      >
        <Link 
          href="/" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            color: "var(--text-secondary)",
            textDecoration: "none",
            transition: "color 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"}
          onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
        >
          <Home size={16} />
        </Link>
        
        {breadcrumbs.map((crumb) => (
          crumb.isLast ? (
            <Typography 
              key={crumb.href} 
              color="text.primary" 
              sx={{ 
                fontSize: 14, 
                fontWeight: 600,
                letterSpacing: "-0.01em"
              }}
            >
              {crumb.label}
            </Typography>
          ) : (
            <Link 
              key={crumb.href} 
              href={crumb.href}
              style={{ 
                fontSize: 14, 
                color: "var(--text-secondary)", 
                textDecoration: "none",
                fontWeight: 500,
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"}
              onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
            >
              {crumb.label}
            </Link>
          )
        ))}
      </MUIBreadcrumbs>
    </Box>
  );
};
