"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Grid,
    Divider,
    Snackbar,
    Alert,
    Chip,
    Stack,
    Avatar,
} from "@mui/material";
import { 
    ShieldCheck, 
    Building2, 
    Fingerprint, 
    Lock, 
    Key,
    Info
} from "lucide-react";
import config from "../../../../config";
import { useRouter } from "next/navigation";
import api from "../../../../utils/api";
import { usePermissions } from "../../../../hooks/usePermissions";


export default function AccountSettingsPage() {
    const router = useRouter();
    const { hasPermission, permissions: allPermissions } = usePermissions();
    const canUpdate = hasPermission('account-settings.update');
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [activeOrg, setActiveOrg] = useState(null);
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedOrg = localStorage.getItem("active_organization");
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedOrg) setActiveOrg(JSON.parse(storedOrg));
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            setSnackbar({ open: true, message: "New passwords do not match", severity: "error" });
            return;
        }

        setSaving(true);
        try {
            const data = await api.put("/users/change-password", {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            
            if (data.success) {
                setSnackbar({ open: true, message: "Password updated successfully!", severity: "success" });
                setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
            } else {
                throw new Error(data.message || "Failed to update password");
            }
        } catch (error) {
            setSnackbar({ open: true, message: error.message, severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    // Group permissions by category for better visualization
    const groupedPermissions = allPermissions.length === 1 && allPermissions[0] === '*' 
        ? { 'Full Access': ['*'] }
        : allPermissions.reduce((acc, perm) => {
            const category = perm.split('.')[0] || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(perm);
            return acc;
        }, {});

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
                    Account & Security
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your workspace membership, permissions, and security settings.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Active Session Info */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 4, border: '1px solid var(--border)', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 48, height: 48, borderRadius: 2 }}>
                                    <Building2 size={24} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>Active Workspace</Typography>
                                    <Typography variant="body2" color="text.secondary">Current organization session details</Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>ORGANIZATION</Typography>
                                    <Typography variant="body1" fontWeight={600}>{activeOrg?.name || 'N/A'}</Typography>
                                    <Typography variant="caption" color="text.secondary">{activeOrg?.subdomain}.prontostack.com</Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>ACTIVE ROLE</Typography>
                                    <Chip 
                                        icon={<ShieldCheck size={14} />}
                                        label={user?.role?.name || 'Standard User'} 
                                        size="small"
                                        color="primary"
                                        sx={{ borderRadius: 1.5, fontWeight: 700 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>AUTH METHOD</Typography>
                                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Fingerprint size={16} /> JWT Secure Token
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Permissions Breakdown */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid var(--border)', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <Box sx={{ p: 1, bgcolor: 'rgba(79,70,229,0.05)', color: 'primary.main', borderRadius: 1.5 }}>
                                    <Key size={20} />
                                </Box>
                                <Typography variant="h6" fontWeight={700}>Active Permissions</Typography>
                            </Box>
                            
                            <Divider sx={{ mb: 3 }} />

                            <Stack spacing={3}>
                                {Object.entries(groupedPermissions).map(([category, perms]) => (
                                    <Box key={category}>
                                        <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 1, display: 'block' }}>
                                            {category.toUpperCase()}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {perms.map(p => (
                                                <Chip 
                                                    key={p} 
                                                    label={p === '*' ? 'ALL_PERMISSIONS' : p} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ 
                                                        borderRadius: 1, 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 600,
                                                        borderColor: 'divider',
                                                        bgcolor: p === '*' ? 'rgba(79,70,229,0.05)' : 'transparent',
                                                        color: p === '*' ? 'primary.main' : 'text.primary'
                                                    }} 
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Change Password */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ borderRadius: 4, border: '1px solid var(--border)', boxShadow: 'none' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                                <Box sx={{ p: 1, bgcolor: 'rgba(239,68,68,0.05)', color: 'error.main', borderRadius: 1.5 }}>
                                    <Lock size={20} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Security</Typography>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Current Password"
                                        name="currentPassword"
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        disabled={!canUpdate}
                                    />
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        name="newPassword"
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        disabled={!canUpdate}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmNewPassword"
                                        type="password"
                                        value={formData.confirmNewPassword}
                                        onChange={handleChange}
                                        disabled={!canUpdate}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="error"
                                        disabled={saving || !canUpdate}
                                        sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        {saving ? "Updating..." : "Update Password"}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
