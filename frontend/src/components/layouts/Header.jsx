"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Box,
  InputBase,
  IconButton,
  Badge,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Chip,
} from "@mui/material";
import { useSidebar } from "./SidebarContext";
import { 
  Search, 
  Bell, 
  Menu as MenuIcon, 
  User, 
  Settings, 
  LogOut, 
  Users, 
  ShieldCheck, 
  Key, 
  MousePointer2,
  Building2,
  ChevronDown,
  Check,
  Globe
} from "lucide-react";
import { styled, alpha } from "@mui/material/styles";
import { ClickAwayListener, Paper, List, ListItemButton, Avatar as SmallAvatar } from "@mui/material";
import config from "../../config";
import api from "../../utils/api";
import { usePermissions } from "../../hooks/usePermissions";
import { useThemeSettings } from "@/context/ThemeContext";


const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.secondary.dark, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.secondary.dark, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  border: "1px solid var(--border)",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "40ch",
    },
    fontSize: 14,
  },
}));

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 260;

export const Header = () => {
  const { isExpanded, setIsMobileOpen } = useSidebar();
  const sidebarWidth = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  const [anchorEl, setAnchorEl] = useState(null);
  const [orgAnchorEl, setOrgAnchorEl] = useState(null);
  const router = useRouter();
  const { hasPermission } = usePermissions();
  
  const canViewProfile = hasPermission("profile.view") || hasPermission("profile.update");
  const canViewSettings = hasPermission("settings.view") || hasPermission("settings.update");
  
  const [user, setUser] = useState(null);
  const [activeOrg, setActiveOrg] = useState(null);
  const [userOrgs, setUserOrgs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { fontSize } = useThemeSettings();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedOrg = localStorage.getItem("active_organization");
    const storedOrgs = localStorage.getItem("user_organizations");

    if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }
    if (storedOrg) {
        try { setActiveOrg(JSON.parse(storedOrg)); } catch (e) {}
    }
    if (storedOrgs) {
        try { setUserOrgs(JSON.parse(storedOrgs)); } catch (e) {}
    }
  }, []);

  // Global Search Logic
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/search?q=${searchQuery}`);
        if (response.success) {
          setSearchResults(response.data);
          setIsSearchOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchResultClick = (path) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(path);
  };

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : "Loading...";
  const userRole = user?.role?.name || "User";
  const getInitials = (name) => {
    if (!name || name === "Loading...") return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleOrgMenuOpen = (event) => setOrgAnchorEl(event.currentTarget);
  const handleOrgMenuClose = () => setOrgAnchorEl(null);

  const handleSwitchOrg = async (orgId) => {
    if (orgId === activeOrg?.id || isSwitching) return;
    
    setIsSwitching(true);
    try {
        const resp = await api.post("/auth/select-org", {
            userId: user.id,
            organizationId: orgId
        });

        if (resp.success) {
            const { token, user: updatedUser, menus, permissions, activeOrg: newOrg } = resp.data;

            // Update session data
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem("active_organization", JSON.stringify(newOrg));
            localStorage.setItem("menus", JSON.stringify(menus));
            localStorage.setItem("permissions", JSON.stringify(permissions));

            handleOrgMenuClose();
            // Full refresh to reload permissions hooks and menu state
            window.location.reload();
        }
    } catch (err) {
        console.error("Failed to switch organization:", err);
    } finally {
        setIsSwitching(false);
    }
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      if (localStorage.getItem("token")) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error("Failed to blacklist token on logout", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("active_organization");
      localStorage.removeItem("user_organizations");
      localStorage.removeItem("menus");
      localStorage.removeItem("permissions");
      router.push("/login");
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { xs: "100%", lg: `calc(100% - ${sidebarWidth}px)` },
        ml: { xs: 0, lg: `${sidebarWidth}px` },
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: "none",
        borderBottom: "1px solid var(--border)",
        height: "var(--header-height)",
        justifyContent: "center",
        zIndex: 1100,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setIsMobileOpen(true)}
          sx={{ display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Workspace Switcher */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
                onClick={handleOrgMenuOpen}
                startIcon={
                    <Box sx={{ 
                        p: 0.75, 
                        bgcolor: 'primary.light', 
                        borderRadius: 1.5, 
                        display: 'flex',
                        color: 'primary.main',
                        opacity: 0.9
                    }}>
                        <Building2 size={18} />
                    </Box>
                }
                endIcon={<ChevronDown size={14} style={{ opacity: 0.5 }} />}
                sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid transparent',
                    '&:hover': {
                        bgcolor: alpha('#4f46e5', 0.04),
                        borderColor: 'divider'
                    }
                }}
            >
                <Box sx={{ textAlign: 'left', ml: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.2 }}>
                        {activeOrg?.name || "Select Workspace"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Globe size={10} /> {activeOrg?.subdomain}.prontostack.com
                    </Typography>
                </Box>
            </Button>

            <Menu
                anchorEl={orgAnchorEl}
                open={Boolean(orgAnchorEl)}
                onClose={handleOrgMenuClose}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        width: 280,
                        borderRadius: 3,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border)',
                        p: 1
                    }
                }}
            >
                <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                    SWITCH WORKSPACE
                </Typography>
                {userOrgs.map((org) => (
                    <MenuItem 
                        key={org.id} 
                        onClick={() => handleSwitchOrg(org.id)}
                        disabled={isSwitching}
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            my: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: org.id === activeOrg?.id ? alpha('#4f46e5', 0.08) : 'transparent',
                            '&:hover': {
                                bgcolor: alpha('#4f46e5', 0.04)
                            }
                        }}
                    >
                        <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                {org.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {org.subdomain}.prontostack.com
                            </Typography>
                        </Box>
                        {org.id === activeOrg?.id && <Check size={16} color="#4f46e5" />}
                    </MenuItem>
                ))}
            </Menu>
        </Box>

        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" }, position: "relative" }}>
          <ClickAwayListener onClickAway={() => setIsSearchOpen(false)}>
            <Box>
              <SearchContainer>
                <SearchIconWrapper>
                  <Search size={18} />
                </SearchIconWrapper>
                <StyledInputBase
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                  placeholder="Search users, roles, system modules..."
                  inputProps={{ "aria-label": "search" }}
                />
              </SearchContainer>
              
              {isSearchOpen && (
                <Paper sx={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 24,
                  width: "calc(100% - 48px)",
                  maxHeight: 400,
                  overflowY: "auto",
                  zIndex: 1400,
                  borderRadius: 3,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  border: "1px solid var(--border)",
                }}>
                  <List sx={{ p: 1 }}>
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <ListItemButton
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSearchResultClick(result.path)}
                          sx={{ borderRadius: 2, mb: 0.5, py: 1 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box sx={{ bgcolor: "secondary.main", color: "primary.main", p: 1, borderRadius: 1.5, display: "flex" }}>
                              {result.type === 'User' ? <Users size={18} /> : result.type === 'Role' ? <ShieldCheck size={18} /> : <Key size={18} />}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={result.title}
                            secondary={result.subtitle}
                            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                            secondaryTypographyProps={{ fontSize: 12 }}
                          />
                          <MousePointer2 size={14} style={{ opacity: 0.3 }} />
                        </ListItemButton>
                      ))
                    ) : (
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          {isSearching ? "Searching..." : "No results found."}
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Paper>
              )}
            </Box>
          </ClickAwayListener>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="inherit" size="large">
            <Badge variant="dot" color="error">
              <Bell size={22} />
            </Badge>
          </IconButton>

          <Box sx={{
            display: "flex",
            alignItems: "center",
            ml: 1,
            gap: 1.5,
            borderLeft: "1px solid var(--border)",
            pl: 2,
          }}>
            <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{userName}</Typography>
              <Typography variant="caption" color="text.secondary">{userRole}</Typography>
            </Box>
            <Avatar
              onClick={handleMenuOpen}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                color: "white",
                fontWeight: "bold",
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(var(--primary-color-rgb), 0.25)"
              }}
            >
              {getInitials(userName)}
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 10px 25px rgba(0,0,0,0.1))",
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 3,
                  border: "1px solid var(--border)",
                  "& .MuiMenuItem-root": {
                    px: 2,
                    py: 1.25,
                    borderRadius: 1.5,
                    mx: 1,
                    my: 0.5,
                    "&:hover": { bgcolor: "secondary.main" },
                  },
                  "& .MuiListItemIcon-root": { minWidth: 32 },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, display: { xs: "block", sm: "none" } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{userName}</Typography>
                <Typography variant="caption" color="text.secondary">{userRole}</Typography>
              </Box>
              <Box sx={{ display: { xs: "block", sm: "none" } }}>
                <Divider sx={{ my: 0.5 }} />
              </Box>

              {canViewProfile && (
                <MenuItem onClick={() => { handleMenuClose(); router.push('/settings/profile'); }}>
                  <ListItemIcon><User size={18} /></ListItemIcon>
                  <ListItemText primary="My Profile" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                </MenuItem>
              )}
              {canViewSettings && (
                <MenuItem onClick={() => { handleMenuClose(); router.push('/settings/account'); }}>
                  <ListItemIcon><Settings size={18} /></ListItemIcon>
                  <ListItemText primary="Account Settings" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
                </MenuItem>
              )}

              <Divider sx={{ my: 1 }} />

              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "error.main",
                  "&:hover": { bgcolor: "error.light !important", color: "error.dark" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit !important" }}><LogOut size={18} /></ListItemIcon>
                <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
