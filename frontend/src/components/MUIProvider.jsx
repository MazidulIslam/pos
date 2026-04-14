"use client";

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeContextProvider, useThemeSettings } from '@/context/ThemeContext';

function ThemeWrapper({ children }) {
    const { theme, isLoaded } = useThemeSettings();
    
    // Prevent flash of unstyled content/wrong theme
    if (!isLoaded) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

export default function MUIProvider({ children }) {
    return (
        <AppRouterCacheProvider>
            <ThemeContextProvider>
                <ThemeWrapper>
                    {children}
                </ThemeWrapper>
            </ThemeContextProvider>
        </AppRouterCacheProvider>
    );
}
