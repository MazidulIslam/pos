"use client";

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import {
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  Plus
} from "lucide-react";

export default function Home() {
  const stats = [
    { label: 'Total Sales', value: '$24,560', icon: DollarSign, trend: '+12.5%', color: 'success.main', bg: '#ecfdf5' },
    { label: 'Active Orders', value: '142', icon: ArrowUpRight, trend: '+5.2%', color: 'primary.main', bg: '#eff6ff' },
    { label: 'Total Products', value: '1,205', icon: Package, trend: '0%', color: 'warning.main', bg: '#fffbeb' },
    { label: 'New Customers', value: '12', icon: Users, trend: '+2', color: 'secondary.dark', bg: '#f5f3ff' },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.025em' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Welcome back, here's what's happening with your POS system today.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          sx={{
            ml: 'auto',
            px: 3,
            py: 1.25,
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgb(79 70 229 / 0.2)',
          }}
        >
          Create New Sale
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.label}>
            <Card sx={{ transition: 'border-color 0.2s', '&:hover': { borderColor: 'primary.light' } }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Avatar
                    sx={{
                      bgcolor: stat.bg,
                      color: stat.color,
                      width: 40,
                      height: 40,
                      borderRadius: 1.5
                    }}
                  >
                    <stat.icon size={20} />
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: stat.trend.startsWith('+') ? 'success.main' : 'text.secondary'
                    }}
                  >
                    {stat.trend}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <Box sx={{ p: 3, borderBottom: '1px solid var(--border)' }}>
              <Typography variant="h6" fontWeight={700}>
                Recent Transactions
              </Typography>
            </Box>
            <CardContent sx={{ p: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'secondary.main' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.dark', color: 'text.primary', fontWeight: 'bold' }}>
                      {String.fromCharCode(64 + i)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Customer #{1000 + i}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        March 12, 2026 • 10:24 AM
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      +$240.00
                    </Typography>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, fontSize: 10, letterSpacing: 0.5, color: 'text.disabled' }}>
                      Completed
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <Box sx={{ p: 3, borderBottom: '1px solid var(--border)' }}>
              <Typography variant="h6" fontWeight={700}>
                Inventory Status
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { name: 'Redmi Note 12', stock: 12, max: 50, color: '#10b981' },
                  { name: 'Samsung Galaxy S23', stock: 4, max: 20, color: '#ef4444' },
                  { name: 'Apple iPhone 15', stock: 35, max: 40, color: '#3b82f6' },
                  { name: 'Sony Headphones', stock: 15, max: 30, color: '#f59e0b' },
                ].map((item) => (
                  <Box key={item.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.stock} / {item.max}</Typography>
                    </Box>
                    <Box sx={{ height: 8, width: '100%', bgcolor: 'secondary.main', borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${(item.stock / item.max) * 100}%`, bgcolor: item.color }} />
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button variant="outlined" fullWidth sx={{ mt: 4, py: 1.25, borderRadius: 2 }}>
                View Full Inventory
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
