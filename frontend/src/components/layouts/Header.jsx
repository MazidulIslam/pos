"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import { useSidebar } from "./SidebarContext";
import { Search, Bell, Menu as MenuIcon, User, Settings, LogOut } from "lucide-react";
import { styled, alpha } from "@mui/material/styles";

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
  const { setIsMobileOpen } = useSidebar();
  const sidebarWidth = COLLAPSED_WIDTH;

  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
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
        zIndex: 1100, // Ensure header sits slightly below sidebar flyout
        transition: "width 0.3s ease, margin-left 0.3s ease",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setIsMobileOpen(true)}
          sx={{ mr: 2, display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }}>
          <SearchContainer>
            <SearchIconWrapper>
              <Search size={18} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products, sales, customers..."
              inputProps={{ "aria-label": "search" }}
            />
          </SearchContainer>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="inherit" size="large">
            <Badge variant="dot" color="error">
              <Bell size={22} />
            </Badge>
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: 2,
              gap: 1.5,
              borderLeft: "1px solid var(--border)",
              pl: 2,
            }}
          >
            <Box
              sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Mazidul Islam
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin
              </Typography>
            </Box>
            <Avatar
              onClick={handleMenuOpen}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.light",
                color: "primary.main",
                fontWeight: "bold",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              MI
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
                    "&:hover": {
                      bgcolor: "secondary.main",
                    },
                  },
                  "& .MuiListItemIcon-root": {
                    minWidth: 32,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, display: { xs: "block", sm: "none" } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Mazidul Islam
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Admin
                </Typography>
              </Box>
              <Box sx={{ display: { xs: "block", sm: "none" } }}>
                <Divider sx={{ my: 0.5 }} />
              </Box>

              <MenuItem onClick={() => { handleMenuClose(); router.push('/profile'); }}>
                <ListItemIcon>
                  <User size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="My Profile"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); router.push('/settings/account'); }}>
                <ListItemIcon>
                  <Settings size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="Account Settings"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "error.main",
                  "&:hover": {
                    bgcolor: "error.light !important",
                    color: "error.dark",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit !important" }}>
                  <LogOut size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="Sign Out"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
