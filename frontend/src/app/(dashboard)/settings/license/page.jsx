"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider,
} from "@mui/material";
import { ShieldCheck, ShieldAlert, Key, ShoppingCart, ExternalLink, Sparkles } from "lucide-react";
import PageHeader from "../../../../components/common/PageHeader";
import api from "../../../../utils/api";

const LicenseActivation = () => {
    const [status, setStatus] = useState({ isActivated: false, loading: true });
    const [purchaseCode, setPurchaseCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchStatus = async () => {
        try {
            const response = await api.get("/system/status");
            if (response.success) {
                setStatus({ isActivated: response.isActivated, loading: false });
            }
        } catch (error) {
            console.error("Failed to fetch license status:", error);
            setStatus({ isActivated: false, loading: false });
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleActivate = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        setIsSubmitting(true);

        try {
            const response = await api.post("/system/activate", { purchaseCode });
            if (response.success) {
                setMessage({ type: "success", text: "System activated successfully! You now have full access." });
                setStatus({ isActivated: true, loading: false });
                setPurchaseCode("");
                // Refresh page after a delay to clear all guards
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: error.response?.data?.message || "Invalid purchase code. Please try again." 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <PageHeader 
                title="System License" 
                subtitle="Manage your software activation and license status"
                icon={<ShieldCheck size={24} />}
            />

            <Stack spacing={4} sx={{ mt: 4 }}>
                {/* Status Card */}
                <Card sx={{ 
                    borderRadius: 4, 
                    border: '1px solid',
                    borderColor: status.isActivated ? 'success.light' : 'warning.light',
                    bgcolor: status.isActivated ? 'rgba(34,197,94,0.02)' : 'rgba(245,158,11,0.02)',
                    overflow: 'hidden'
                }} elevation={0}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Box sx={{ 
                                width: 64, 
                                height: 64, 
                                borderRadius: 3, 
                                bgcolor: status.isActivated ? 'success.main' : 'warning.main',
                                color: 'white',
                                display: 'grid',
                                placeItems: 'center',
                                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)'
                            }}>
                                {status.isActivated ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" fontWeight={800} gutterBottom>
                                    {status.isActivated ? "System Activated" : "Activation Required"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {status.isActivated 
                                        ? "Your software is properly licensed and all professional features are unlocked." 
                                        : "Your software is currently running in unactivated mode. Please enter your purchase code below."}
                                </Typography>
                            </Box>
                            {status.isActivated && (
                                <Box sx={{ 
                                    px: 2, py: 0.5, 
                                    borderRadius: 10, 
                                    bgcolor: 'success.main', 
                                    color: 'white',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1
                                }}>
                                    Official
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Activation Form */}
                {!status.isActivated && (
                    <Card sx={{ borderRadius: 4, border: '1px solid var(--border)' }} elevation={0}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Enter Purchase Code
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                You can find your purchase code in your account dashboard where you bought the script.
                            </Typography>

                            {message.text && (
                                <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
                                    <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                    {message.text}
                                </Alert>
                            )}

                            <Stack component="form" onSubmit={handleActivate} spacing={2.5}>
                                <TextField
                                    fullWidth
                                    label="Purchase Code"
                                    placeholder="e.g. PRONTO-XXXX-XXXX"
                                    value={purchaseCode}
                                    onChange={(e) => setPurchaseCode(e.target.value)}
                                    disabled={isSubmitting}
                                    InputProps={{
                                        startAdornment: <Key size={18} style={{ marginRight: 12, opacity: 0.5 }} />
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={isSubmitting || !purchaseCode}
                                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={20} />}
                                    sx={{ 
                                        borderRadius: 2, 
                                        py: 1.5, 
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        boxShadow: '0 8px 24px -6px rgba(79,70,229,0.4)'
                                    }}
                                >
                                    {isSubmitting ? "Verifying..." : "Activate Now"}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Help Section */}
                <Card sx={{ borderRadius: 4, border: '1px solid var(--border)', bgcolor: 'rgba(0,0,0,0.01)' }} elevation={0}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShoppingCart size={18} /> Need a License?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            If you don't have a valid purchase code yet, you can buy one from the official marketplace.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            endIcon={<ExternalLink size={16} />}
                            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                            href="https://prontostack.com"
                            target="_blank"
                        >
                            Buy License
                        </Button>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        <Typography variant="caption" color="text.secondary">
                            Your license is bound to this installation. For more information about our licensing terms, please visit our documentation.
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
};

export default LicenseActivation;
