"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 260;

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Products", icon: Package, href: "/products" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Sales", icon: ShoppingCart, href: "/sales" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isExpanded, setIsExpanded } = useSidebar();

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      sx={{
        width: COLLAPSED_WIDTH,
        flexShrink: 0,
        display: { xs: "none", lg: "block" },
        "& .MuiDrawer-paper": {
          width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid var(--border)",
          bgcolor: "background.paper",
          overflow: "hidden",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: isExpanded ? 1300 : 1200,
          boxShadow: isExpanded ? "4px 0 24px -4px rgba(0,0,0,0.10)" : "none",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Logo ── */}
      <Box
        sx={{
          height: "var(--header-height)",
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "flex-start" : "center",
          px: isExpanded ? 3 : 0,
          flexShrink: 0,
          overflow: "hidden",
          transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Logo icon — always visible */}
          <Box
            sx={{
              height: 32,
              width: 32,
              minWidth: 32,
              borderRadius: 1,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 6px -1px rgb(79 70 229 / 0.25)",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "bold",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              M
            </Typography>
          </Box>

          {/* Brand name — fades in when expanded */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              letterSpacing: "-0.025em",
              whiteSpace: "nowrap",
              opacity: isExpanded ? 1 : 0,
              maxWidth: isExpanded ? 160 : 0,
              overflow: "hidden",
              transition:
                "opacity 0.2s ease, max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Modern
            <Box component="span" sx={{ color: "primary.main" }}>
              POS
            </Box>
          </Typography>
        </Box>
      </Box>

      {/* ── Nav Items ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: isExpanded ? 2 : 1,
          py: 3,
          transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip
                  title={!isExpanded ? item.label : ""}
                  placement="right"
                  arrow
                  disableInteractive
                >
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      px: isExpanded ? 1.5 : 0,
                      minHeight: 48,
                      justifyContent: isExpanded ? "flex-start" : "center",
                      bgcolor: isActive ? "primary.light" : "transparent",
                      color: isActive ? "primary.main" : "text.secondary",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: isActive ? "primary.light" : "secondary.main",
                        color: isActive ? "primary.main" : "text.primary",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isExpanded ? 1.5 : 0,
                        color: "inherit",
                        justifyContent: "center",
                        transition: "margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <item.icon size={20} />
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 500,
                        noWrap: true,
                      }}
                      sx={{
                        opacity: isExpanded ? 1 : 0,
                        maxWidth: isExpanded ? 160 : 0,
                        overflow: "hidden",
                        m: 0,
                        transition:
                          "opacity 0.2s ease, max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />

                    {/* Active chevron */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        opacity: isActive && isExpanded ? 1 : 0,
                        maxWidth: isActive && isExpanded ? 20 : 0,
                        overflow: "hidden",
                        transition:
                          "opacity 0.2s ease, max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <ChevronRight size={16} />
                    </Box>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* ── Sign Out ── */}
      <Box
        sx={{
          px: isExpanded ? 2 : 1,
          pb: 2,
          flexShrink: 0,
          transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Divider sx={{ mb: 1.5 }} />
        <Tooltip
          title={!isExpanded ? "Sign Out" : ""}
          placement="right"
          arrow
          disableInteractive
        >
          <ListItemButton
            sx={{
              borderRadius: 2,
              py: 1.25,
              px: isExpanded ? 1.5 : 0,
              minHeight: 48,
              justifyContent: isExpanded ? "flex-start" : "center",
              color: "error.main",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "error.light",
                color: "error.dark",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isExpanded ? 1.5 : 0,
                color: "inherit",
                justifyContent: "center",
                transition: "margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <LogOut size={20} />
            </ListItemIcon>

            <ListItemText
              primary="Sign Out"
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 500,
                noWrap: true,
              }}
              sx={{
                opacity: isExpanded ? 1 : 0,
                maxWidth: isExpanded ? 160 : 0,
                overflow: "hidden",
                m: 0,
                transition:
                  "opacity 0.2s ease, max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};
