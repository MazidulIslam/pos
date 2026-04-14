"use client";

import { createTheme } from '@mui/material/styles';

export const getDynamicTheme = (primaryColor = '#4f46e5', fontSize = 14) => {
    return createTheme({
        palette: {
            primary: {
                main: primaryColor,
                light: `${primaryColor}CC`, // Transparent variant
                dark: `${primaryColor}`, // Fallback
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#f1f5f9',
                light: '#f8fafc',
                dark: '#e2e8f0',
                contrastText: '#0f172a',
            },
            background: {
                default: '#f8fafc',
                paper: '#ffffff',
            },
            text: {
                primary: '#0f172a',
                secondary: '#64748b',
            },
        },
        typography: {
            fontFamily: 'var(--font-outfit), "Inter", ui-sans-serif, system-ui, sans-serif',
            fontSize: fontSize,
            h1: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' },
            h2: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.01em' },
            h3: { fontSize: '1.25rem', fontWeight: 600 },
            body1: { fontSize: '1rem', lineHeight: 1.6 },
            body2: { fontSize: '0.875rem' },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        padding: '8px 16px',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        },
                    },
                    containedPrimary: {
                        '&:hover': {
                            backgroundColor: primaryColor,
                            filter: 'brightness(0.9)',
                        }
                    }
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
                        border: '1px solid #e2e8f0',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                    }
                }
            }
        },
    });
};

// Default export for initial load compatibility
const theme = getDynamicTheme('#4f46e5', 14);
export default theme;
