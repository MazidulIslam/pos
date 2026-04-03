"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import { ShieldCheck } from "lucide-react";
import config from "../../../../config";
import { useRouter } from "next/navigation";


export default function AccountSettingsPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({

        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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
            const token = localStorage.getItem("token");
            const res = await fetch(`${config.API_BASE_URL}/users/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });
            
            if (res.status === 401) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }
            
            const data = await res.json();


            if (!res.ok) throw new Error(data.message);

            setSnackbar({ open: true, message: "Password updated successfully!", severity: "success" });
            setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        } catch (error) {
            setSnackbar({ open: true, message: error.message, severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Account Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Manage your account security and password.
            </Typography>

            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "error.light",
                                color: "error.dark",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.8,
                            }}
                        >
                            <ShieldCheck size={20} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Change Password
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    name="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    name="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    name="confirmNewPassword"
                                    type="password"
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={saving}
                                sx={{
                                    py: 1.25,
                                    px: 3,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    bgcolor: "error.main",
                                    "&:hover": {
                                        bgcolor: "error.dark",
                                    },
                                }}
                            >
                                {saving ? "Updating..." : "Update Password"}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>

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
