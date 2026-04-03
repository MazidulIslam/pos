"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Stack,
} from "@mui/material";
import {
  People,
  Security,
  Menu as MenuIcon,
  Storage,
  ManageAccounts,
  ChevronRight,
} from "@mui/icons-material";

const settingsModules = [
  {
    title: "User Management",
    description: "Create, edit, and manage system users and their profiles.",
    icon: <People fontSize="large" />,
    path: "/settings/users",
    color: "#4f46e5",
  },
  {
    title: "Roles & Permissions",
    description: "Define user roles and assign specific access permissions.",
    icon: <Security fontSize="large" />,
    path: "/settings/roles",
    color: "#0891b2",
  },
  {
    title: "Menu Configuration",
    description: "Customize the sidebar navigation structure and hierarchy.",
    icon: <MenuIcon fontSize="large" />,
    path: "/settings/menus",
    color: "#059669",
  },
  {
    title: "Database Backups",
    description: "Generate and download full database backups securely.",
    icon: <Storage fontSize="large" />,
    path: "/settings/backups",
    color: "#dc2626",
  },
  {
    title: "Account Settings",
    description: "Manage your own security settings and password.",
    icon: <ManageAccounts fontSize="large" />,
    path: "/settings/account",
    color: "#4b5563",
  },
];

export default function SettingsDashboard() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mb: 1 }}>
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure and manage all aspects of your POS system from a central dashboard.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {settingsModules.map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.title}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  borderColor: module.color,
                },
              }}
            >
              <CardActionArea
                component={Link}
                href={module.path}
                sx={{ height: "100%", p: 1 }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: `${module.color}15`,
                        color: module.color,
                        borderRadius: 3,
                      }}
                    >
                      {module.icon}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {module.description}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{ color: module.color, fontWeight: 600, fontSize: "0.875rem" }}
                    >
                      <span>Configure</span>
                      <ChevronRight fontSize="small" />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
