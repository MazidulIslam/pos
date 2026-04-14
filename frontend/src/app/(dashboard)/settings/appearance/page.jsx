"use client";

import React from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Slider,
    Divider,
    Card,
    CardContent,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel
} from "@mui/material";
import { Check } from "lucide-react";
import { useThemeSettings } from "@/context/ThemeContext";
import { PageHeader } from "@/components/common/PageHeader";

const THEME_COLORS = [
    { name: "Indigo", hex: "#4f46e5", label: "Professional" },
    { name: "Emerald", hex: "#10b981", label: "Eco-Friendly" },
    { name: "Rose", hex: "#f43f5e", label: "Vibrant" },
    { name: "Amber", hex: "#f59e0b", label: "Warning/Energy" },
    { name: "Slate", hex: "#475569", label: "Neutral" },
    { name: "Sky Blue", hex: "#0ea5e9", label: "Fresh & Clean" },

];

const FONT_SCALES = [
    { value: 12, label: "Compact" },
    { value: 14, label: "Medium" },
    { value: 16, label: "Large" },
];

export default function AppearancePage() {
    const { primaryColor, setPrimaryColor, fontSize, setFontSize } = useThemeSettings();

    return (
        <Box maxWidth="lg">
            <PageHeader
                title="Appearance Settings"
                searchPlaceholder="Search themes..."
                searchPlaceholderHidden={true}
            />

            <Grid container spacing={4}>
                {/* 1. Theme Color Selection */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 4, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="700">
                            Primary Theme Color
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={4}>
                            Select a core color that will be applied across your entire POS system buttons, links, and sidebar.
                        </Typography>

                        <Box display="flex" flexWrap="wrap" gap={3}>
                            {THEME_COLORS.map((color) => {
                                const isSelected = primaryColor === color.hex;
                                return (
                                    <Box
                                        key={color.name}
                                        onClick={() => setPrimaryColor(color.hex)}
                                        sx={{
                                            position: 'relative',
                                            width: 120,
                                            height: 100,
                                            borderRadius: 3,
                                            bgcolor: 'background.default',
                                            border: '2px solid',
                                            borderColor: isSelected ? color.hex : 'divider',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)',
                                                borderColor: isSelected ? color.hex : 'grey.400'
                                            },
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                bgcolor: color.hex,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {isSelected && <Check size={18} color="white" />}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="700" noWrap>
                                                {color.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                {color.label}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {/* 2. Typography Selection */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="700">
                            Typography & Scaling
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={4}>
                            Adjust the global text size to find your preferred balance between information density and readability.
                        </Typography>

                        <FormControl>
                            <FormLabel id="font-size-label" sx={{ mb: 2, fontWeight: '600' }}>Font Size Scale</FormLabel>
                            <RadioGroup
                                aria-labelledby="font-size-label"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                            >
                                {FONT_SCALES.map((scale) => (
                                    <FormControlLabel
                                        key={scale.value}
                                        value={scale.value}
                                        control={<Radio />}
                                        label={
                                            <Box>
                                                <Typography variant="body1" fontWeight="600">{scale.label}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Base size: {scale.value}px
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{
                                            mb: 2,
                                            p: 1.5,
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor: fontSize === scale.value ? 'primary.main' : 'divider',
                                            bgcolor: fontSize === scale.value ? 'primary.50' : 'transparent',
                                            width: '100%',
                                            m: 0,
                                            '&:hover': { bgcolor: fontSize === scale.value ? 'primary.50' : 'action.hover' }
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                </Grid>

                {/* 3. Real-time Preview */}
                <Grid item xs={12}>
                    <Typography variant="h6" mb={2} fontWeight="700">Live Preview</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                                <CardContent>
                                    <Typography variant="subtitle2">Primary Container</Typography>
                                    <Typography variant="h5" fontWeight="800">$12,450.00</Typography>
                                    <Typography variant="caption">Total Sales Today</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>Action Preview</Typography>
                                    <Box display="flex" gap={1}>
                                        <Button variant="contained" size="small">Save Changes</Button>
                                        <Button variant="outlined" size="small">Cancel</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2">Text Density Preview</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        The quick brown fox jumps over the lazy dog. Experience how font scaling impacts your readability.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
