"use client";

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4f46e5', // Indigo from existing design
            light: '#818cf8',
            dark: '#3730a3',
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
        h1: { fontSize: '2rem', fontWeight: 700 },
        h2: { fontSize: '1.5rem', fontWeight: 600 },
        h3: { fontSize: '1.25rem', fontWeight: 600 },
        body1: { fontSize: '0.875rem' },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #e2e8f0',
                },
            },
        },
    },
});

export default theme;
