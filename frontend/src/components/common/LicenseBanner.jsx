"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Stack, Container } from "@mui/material";
import { ShieldAlert, ArrowRight, Key } from "lucide-react";
import Link from "next/link";
import api from "../../utils/api";

const LicenseBanner = () => {
    const [isActivated, setIsActivated] = useState(true);
    const [loading, setLoading] = useState(true);

    const checkStatus = async () => {
        try {
            const response = await api.get("/system/status");
            if (response.success) {
                setIsActivated(response.isActivated);
            }
        } catch (error) {
            console.error("Banner status check failed:", error);
            setIsActivated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    if (loading || isActivated) return null;

    return (
        <Box sx={{ 
            bgcolor: 'warning.main', 
            color: 'warning.contrastText',
            py: 1,
            zIndex: 2000,
            position: 'relative',
            boxShadow: '0 4px 12px rgba(245,158,11,0.2)'
        }}>
            <Container maxWidth="xl">
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    alignItems="center" 
                    justifyContent="center"
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ShieldAlert size={18} />
                        <Typography variant="body2" fontWeight={700}>
                            System Not Activated: 
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Please enter your license key to unlock all professional features.
                        </Typography>
                    </Stack>
                    <Button 
                        component={Link}
                        href="/settings/license"
                        variant="contained" 
                        size="small"
                        startIcon={<Key size={14} />}
                        endIcon={<ArrowRight size={14} />}
                        sx={{ 
                            bgcolor: 'white', 
                            color: 'warning.main',
                            fontWeight: 800,
                            fontSize: 12,
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                            textTransform: 'none',
                            px: 2
                        }}
                    >
                        Activate Now
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
};

export default LicenseBanner;
