"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Collapse,
} from "@mui/material";
import { LogOut, ChevronRight, ChevronDown } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { availableIcons } from "../../utils/iconMap";
import config from "../../config";
import api from "../../utils/api";

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 260;

const isPathActive = (pathname, href) => {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

export const Sidebar = () => {
  const pathname = usePathname();
  const {
    isExpanded: isDesktopExpanded,
    setIsExpanded,
    isMobileOpen,
    setIsMobileOpen,
  } = useSidebar();
  const isExpanded = isDesktopExpanded || isMobileOpen;

  const [menuItems, setMenuItems] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("menus");
      if (stored) {
        const flatMenus = JSON.parse(stored);
        
        const map = {};
        const roots = [];
        
        flatMenus.forEach(menu => {
          map[menu.id] = {
            label: menu.name,
            icon: availableIcons[menu.icon] || availableIcons["Folder"],
            href: menu.path,
            id: menu.id,
            parent_id: menu.parent_id,
            children: []
          };
        });

        flatMenus.forEach(menu => {
          if (menu.parent_id && map[menu.parent_id]) {
            map[menu.parent_id].children.push(map[menu.id]);
          } else {
            roots.push(map[menu.id]);
          }
        });

        setMenuItems(roots);
      }
    } catch (e) {
      console.error("Failed to parse menus from local storage", e);
    }
  }, []);

  const handleLogout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error("Failed to blacklist token on logout", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  useEffect(() => {
    setOpenMenus((prev) => {
      const next = { ...prev };
      
      const checkAndOpen = (items) => {
        let found = false;
        items.forEach((item) => {
          const hasActiveChild = item.children && checkAndOpen(item.children);
          const isMeActive = isPathActive(pathname, item.href);
          if (hasActiveChild || (isMeActive && item.children?.length > 0)) {
            next[item.id] = true;
            found = true;
          }
        });
        return found;
      };

      checkAndOpen(menuItems);
      return next;
    });
  }, [pathname, menuItems]);

  const toggleMenu = (id) => {
    if (!isExpanded) return;
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const NavItem = ({ item, level = 0 }) => {
    const hasChildren = Boolean(item.children?.length);
    const isOpen = Boolean(openMenus[item.id]);
    
    // Inject Overview if parent has a path AND children
    const displayChildren = useMemo(() => {
        const hasValidPath = item.href && !["#", "/#", ""].includes(item.href);
        if (hasChildren && hasValidPath) {
            return [
                {
                    id: `overview-${item.id}`,
                    label: "Overview",
                    href: item.href,
                    icon: item.icon,
                    children: []
                },
                ...item.children
            ];
        }
        return item.children || [];
    }, [item.children, item.href, item.id, item.icon, hasChildren]);

    const isInternalActive = useMemo(() => {
        if (isPathActive(pathname, item.href)) return true;
        
        const checkChildren = (children) => {
            return children.some(child => 
                isPathActive(pathname, child.href) || (child.children && checkChildren(child.children))
            );
        };
        return checkChildren(item.children || []);
    }, [item.href, item.children]);

    const buttonContent = (
      <ListItemButton
        component={hasChildren ? "button" : Link}
        href={hasChildren ? undefined : item.href}
        onClick={(e) => {
          if (hasChildren) {
            toggleMenu(item.id);
          } else {
            setIsMobileOpen(false);
          }
        }}
        sx={{
          borderRadius: 2,
          py: 1.25,
          px: isExpanded ? 1.5 : 0,
          minHeight: level === 0 ? 48 : 40,
          width: "100%",
          justifyContent: isExpanded ? "flex-start" : "center",
          bgcolor: isInternalActive ? (level === 0 ? "primary.main" : "rgba(var(--primary-color-rgb), 0.12)") : "transparent",
          color: isInternalActive ? (level === 0 ? "primary.contrastText" : "primary.main") : "text.secondary",
          ml: isExpanded ? level * 1.5 : 0, // Indentation
          "& .MuiListItemText-primary": {
            color: 'inherit',
          },
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: isInternalActive
              ? (level === 0 ? "primary.main" : "rgba(var(--primary-color-rgb), 0.18)")
              : "secondary.main",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isExpanded ? 1.5 : 0,
            color: isInternalActive ? (level === 0 ? "primary.contrastText" : "primary.main") : "inherit",
            justifyContent: "center",
            transition: "margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <item.icon sx={{ fontSize: level === 0 ? 20 : 18 }} />
        </ListItemIcon>

        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: level === 0 ? 14 : 13,
            fontWeight: isInternalActive ? 700 : 500,
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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            opacity: isExpanded ? 1 : 0,
            maxWidth: isExpanded ? 24 : 0,
            overflow: "hidden",
            color: isInternalActive ? (level === 0 ? "primary.contrastText" : "primary.main") : "text.secondary",
            transition:
              "opacity 0.2s ease, max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : isInternalActive ? (
            <ChevronRight size={16} />
          ) : null}
        </Box>
      </ListItemButton>
    );

    return (
      <Box sx={{ mb: 0.5 }}>
        <ListItem disablePadding>
          <Tooltip
            title={!isExpanded ? item.label : ""}
            placement="right"
            arrow
            disableInteractive
          >
            {buttonContent}
          </Tooltip>
        </ListItem>

        {hasChildren && (
          <Collapse
            in={isExpanded && isOpen}
            timeout="auto"
            unmountOnExit
          >
            <List disablePadding sx={{ mt: 0.5 }}>
              {displayChildren.map((child) => (
                <NavItem key={child.id} item={child} level={level + 1} />
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawerContent = (
    <>
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
        <Link 
          href="/" 
          style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => setIsMobileOpen(false)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
        </Link>
      </Box>

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
          {menuItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </List>
      </Box>

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
            onClick={handleLogout}
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
    </>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { lg: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH },
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: { lg: 0 },
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: EXPANDED_WIDTH,
            borderRight: "1px solid var(--border)",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        sx={{
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
        {drawerContent}
      </Drawer>
    </Box>
  );
};
