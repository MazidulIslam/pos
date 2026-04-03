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
    Avatar,
    Divider,
    Snackbar,
    Alert,
} from "@mui/material";
import { Save, User as UserIcon, ShieldAlert } from "lucide-react";
import config from "../../../config";
import { useRouter } from "next/navigation";
import api from "../../../utils/api";
import { usePermissions } from "../../../hooks/usePermissions";


export default function ProfilePage() {
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const canUpdate = hasPermission("profile.update");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await api.get("/users/profile");

            if (data.success) {
                setFormData({
                    firstName: data.data.firstName || "",
                    lastName: data.data.lastName || "",
                    email: data.data.email || "",
                    phone: data.data.phone || "",
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = await api.put("/users/profile", {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
            });
            
            if (data.success) {
                // Update local storage user just in case someone is relying on it
                localStorage.setItem("user", JSON.stringify(data.data));
                setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
            } else {
                throw new Error(data.message || "Failed to update profile");
            }
        } catch (error) {
            setSnackbar({ open: true, message: error.message, severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    if (loading) return null;

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                My Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Manage your personal information and contact details.
            </Typography>

            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    {!canUpdate && (
                        <Alert 
                            severity="info" 
                            icon={<ShieldAlert size={20} />}
                            sx={{ mb: 4, borderRadius: 2 }}
                        >
                            You are in read-only mode. You do not have permission to update your profile.
                        </Alert>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: "primary.light",
                                color: "primary.main",
                                fontSize: 32,
                                fontWeight: "bold",
                            }}
                        >
                            {formData.firstName?.[0] || <UserIcon size={32} />}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {formData.firstName} {formData.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {formData.email}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled={!canUpdate}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled={!canUpdate}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    helperText="Email address cannot be changed."
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    variant="outlined"
                                    disabled={!canUpdate}
                                />
                            </Grid>
                        </Grid>

                        {canUpdate && (
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={saving}
                                    startIcon={<Save size={18} />}
                                    sx={{
                                        py: 1.25,
                                        px: 3,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                    }}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </Box>
                        )}
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
