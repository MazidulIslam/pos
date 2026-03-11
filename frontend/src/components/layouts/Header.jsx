"use client";

import React from 'react';
import { AppBar, Toolbar, Box, InputBase, IconButton, Badge, Typography, Avatar } from '@mui/material';
import { Search, Bell, Menu } from 'lucide-react';
import { styled, alpha } from '@mui/material/styles';

const SearchContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.secondary.dark, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.secondary.dark, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    border: '1px solid var(--border)',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '40ch',
        },
        fontSize: 14,
    },
}));

export const Header = () => {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: { lg: 'calc(100% - var(--sidebar-width))' },
                ml: { lg: 'var(--sidebar-width)' },
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 'none',
                borderBottom: '1px solid var(--border)',
                height: 'var(--header-height)',
                justifyContent: 'center',
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    sx={{ mr: 2, display: { lg: 'none' } }}
                >
                    <Menu />
                </IconButton>

                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
                    <SearchContainer>
                        <SearchIconWrapper>
                            <Search size={18} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search products, sales, customers..."
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </SearchContainer>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton color="inherit" size="large">
                        <Badge variant="dot" color="error">
                            <Bell size={22} />
                        </Badge>
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1.5, borderLeft: '1px solid var(--border)', pl: 2 }}>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Mazidul Islam
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Admin
                            </Typography>
                        </Box>
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                fontWeight: 'bold',
                                fontSize: 14
                            }}
                        >
                            MI
                        </Avatar>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
