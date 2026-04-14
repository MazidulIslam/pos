"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getDynamicTheme } from "@/theme";

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
    // Initial defaults
    const [primaryColor, setPrimaryColor] = useState("#4f46e5");
    const [fontSize, setFontSize] = useState(14);
    const [isLoaded, setIsLoaded] = useState(false);

    // Sync with localStorage on mount
    useEffect(() => {
        const savedColor = localStorage.getItem("pos_theme_color");
        const savedSize = localStorage.getItem("pos_theme_font_size");

        if (savedColor) setPrimaryColor(savedColor);
        if (savedSize) setFontSize(parseInt(savedSize, 10));
        
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever settings change
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("pos_theme_color", primaryColor);
        localStorage.setItem("pos_theme_font_size", fontSize.toString());
        
        // Update CSS variables for non-MUI elements
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(primaryColor));
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    }, [primaryColor, fontSize, isLoaded]);

    const theme = useMemo(() => getDynamicTheme(primaryColor, fontSize), [primaryColor, fontSize]);

    const value = {
        primaryColor,
        setPrimaryColor,
        fontSize,
        setFontSize,
        theme,
        isLoaded
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeSettings = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeSettings must be used within a ThemeContextProvider");
    }
    return context;
};

// Helper to convert hex to RGB for CSS transparency usage
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : "79, 70, 229";
}
