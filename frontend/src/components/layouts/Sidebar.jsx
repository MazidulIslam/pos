"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    Button as MuiButton,
    Divider
} from '@mui/material';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Products', icon: Package, href: '/products' },
    { label: 'Customers', icon: Users, href: '/customers' },
    { label: 'Sales', icon: ShoppingCart, href: '/sales' },
    { label: 'Reports', icon: BarChart3, href: '/reports' },
    { label: 'Settings', icon: Settings, href: '/settings' },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 'var(--sidebar-width)',
                flexShrink: 0,
                display: { xs: 'none', lg: 'block' },
                '& .MuiDrawer-paper': {
                    width: 'var(--sidebar-width)',
                    boxSizing: 'border-box',
                    borderRight: '1px solid var(--border)',
                    bgcolor: 'background.paper',
                },
            }}
        >
            <Box sx={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            height: 32,
                            width: 32,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.2)',
                        }}
                    >
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                            M
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: '-0.025em' }}>
                        Modern<Box component="span" sx={{ color: 'primary.main' }}>POS</Box>
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 3 }}>
                <List sx={{ p: 0 }}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    component={Link}
                                    href={item.href}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.25,
                                        px: 1.5,
                                        bgcolor: isActive ? 'primary.light' : 'transparent',
                                        color: isActive ? 'primary.main' : 'text.secondary',
                                        '&:hover': {
                                            bgcolor: isActive ? 'primary.light' : 'secondary.main',
                                            color: isActive ? 'primary.main' : 'text.primary',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                        <item.icon size={20} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontSize: 14,
                                            fontWeight: isActive ? 600 : 500,
                                        }}
                                    />
                                    {isActive && <ChevronRight size={16} />}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            <Box sx={{ p: 2, mb: 1 }}>
                <Divider sx={{ mb: 2 }} />
                <MuiButton
                    fullWidth
                    startIcon={<LogOut size={20} />}
                    sx={{
                        justifyContent: 'flex-start',
                        color: 'error.main',
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'error.main', color: 'white', opacity: 0.1 },
                        textTransform: 'none',
                        fontSize: 14,
                    }}
                >
                    Sign Out
                </MuiButton>
            </Box>
        </Drawer>
    );
};
