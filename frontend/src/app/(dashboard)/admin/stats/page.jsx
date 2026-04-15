"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import { 
  Activity, 
  BarChart3, 
  Users, 
  Building2, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Globe
} from "lucide-react";
import PageHeader from "../../../../components/common/PageHeader";
import api from "../../../../utils/api";

const AdminStatsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/stats");
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading platform metrics...</Typography></Box>;
    }

    const { summary, organizationsByStatus } = stats || {};

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid var(--border)' }} elevation={0}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, p: 1, borderRadius: 2 }}>
                        {icon}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                        {title}
                    </Typography>
                </Stack>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp size={12} /> {subtitle}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader 
                title="Global Platform Stats" 
                subtitle="Real-time performance and usage metrics across all ProntoStack tenants"
                icon={<BarChart3 size={24} />}
            />

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Total Organizations" 
                        value={summary?.totalOrganizations || 0} 
                        icon={<Building2 size={24} />} 
                        color="primary"
                        subtitle="Total tenants registered"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Active Users" 
                        value={summary?.totalUsers || 0} 
                        icon={<Users size={24} />} 
                        color="success"
                        subtitle="Platform-wide active accounts"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Activation Rate" 
                        value={`${Math.round((summary?.activeOrganizations / summary?.totalOrganizations) * 100) || 0}%`} 
                        icon={<Activity size={24} />} 
                        color="info"
                        subtitle="Percentage of active tenants"
                    />
                </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={800} sx={{ mt: 5, mb: 3 }}>
                Tenant Breakdown
            </Typography>

            <Grid container spacing={3}>
                {organizationsByStatus?.map((item) => (
                    <Grid item xs={12} sm={4} key={item.status}>
                        <Card sx={{ borderRadius: 4, border: '1px solid var(--border)' }} elevation={0}>
                            <CardContent>
                                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                            {item.status}
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                                            {item.count}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ 
                                        bgcolor: item.status === 'active' ? 'success.light' : 'error.light', 
                                        color: item.status === 'active' ? 'success.main' : 'error.main'
                                    }}>
                                        {item.status === 'active' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                    </Avatar>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Platform Health Visual */}
            <Card sx={{ mt: 5, borderRadius: 6, bgcolor: 'primary.main', color: 'white' }} elevation={0}>
                <CardContent sx={{ p: 4 }}>
                    <Grid container alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" fontWeight={800} mb={1}>
                                Platform Status: Optimal
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                                All systems are operational. ProntoStack RBAC engine is processing requests at 100% capacity. 
                                Transactional emails are being dispatched normally via Gmail SMTP service.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                <Globe size={24} />
                                <Typography fontWeight={700}>System Healthy</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AdminStatsPage;
