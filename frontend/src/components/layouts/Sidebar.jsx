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
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:5050/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
      menuItems.forEach((item) => {
        if (
          item.children?.some((child) => isPathActive(pathname, child.href))
        ) {
          next[item.label] = true;
        }
      });
      return next;
    });
  }, [pathname, menuItems]);

  const toggleMenu = (label) => {
    if (!isExpanded) return;
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
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
          {menuItems.map((item) => {
            const isParentActive =
              isPathActive(pathname, item.href) ||
              item.children?.some((child) =>
                isPathActive(pathname, child.href),
              );

            const hasChildren = Boolean(item.children?.length);
            const isOpen = Boolean(openMenus[item.label]);

            const buttonContent = (
              <ListItemButton
                component={hasChildren ? "button" : Link}
                href={hasChildren ? undefined : item.href}
                onClick={(e) => {
                  if (hasChildren) {
                    toggleMenu(item.label);
                  } else {
                    setIsMobileOpen(false);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  px: isExpanded ? 1.5 : 0,
                  minHeight: 48,
                  width: "100%",
                  justifyContent: isExpanded ? "flex-start" : "center",
                  bgcolor: isParentActive ? "primary.light" : "transparent",
                  color: isParentActive ? "primary.dark" : "text.secondary",
                  "& .MuiListItemText-primary": {
                    color: isParentActive ? "primary.dark" : "inherit",
                  },
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isParentActive
                      ? "primary.light"
                      : "secondary.main",
                    color: isParentActive ? "primary.dark" : "text.primary",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isExpanded ? 1.5 : 0,
                    color: isParentActive ? "primary.main" : "inherit",
                    justifyContent: "center",
                    transition: "margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <item.icon sx={{ fontSize: 20 }} />
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isParentActive ? 700 : 500,
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
                    color: isParentActive ? "primary.main" : "text.secondary",
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
                  ) : isParentActive ? (
                    <ChevronRight size={16} />
                  ) : null}
                </Box>
              </ListItemButton>
            );

            return (
              <Box key={item.label} sx={{ mb: 0.5 }}>
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
                      {item.children.map((child) => {
                        const isChildActive = isPathActive(
                          pathname,
                          child.href,
                        );

                        return (
                          <ListItem
                            key={child.href}
                            disablePadding
                            sx={{ mb: 0.25 }}
                          >
                            <ListItemButton
                              component={Link}
                              href={child.href}
                              onClick={() => setIsMobileOpen(false)}
                              sx={{
                                ml: 1,
                                pl: 2,
                                pr: 1.25,
                                py: 1,
                                minHeight: 40,
                                borderRadius: 2,
                                bgcolor: isChildActive
                                  ? "rgba(79, 70, 229, 0.12)"
                                  : "transparent",
                                color: isChildActive
                                  ? "primary.dark"
                                  : "text.secondary",
                                "& .MuiListItemText-primary": {
                                  color: isChildActive
                                    ? "primary.dark"
                                    : "inherit",
                                },
                                "&:hover": {
                                  bgcolor: isChildActive
                                    ? "rgba(79, 70, 229, 0.16)"
                                    : "secondary.main",
                                  color: isChildActive
                                    ? "primary.dark"
                                    : "text.primary",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 28,
                                  color: isChildActive
                                    ? "primary.main"
                                    : "text.disabled",
                                }}
                              >
                                <child.icon sx={{ fontSize: 16 }} />
                              </ListItemIcon>

                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{
                                  fontSize: 13,
                                  fontWeight: isChildActive ? 700 : 500,
                                  noWrap: true,
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
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

