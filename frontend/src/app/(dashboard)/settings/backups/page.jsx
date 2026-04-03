"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  Backdrop,
} from "@mui/material";
import CloudDownload from "@mui/icons-material/CloudDownload";
import Security from "@mui/icons-material/Security";
import Storage from "@mui/icons-material/Storage";
import Timer from "@mui/icons-material/Timer";
import config from "@/config";
import api from "@/utils/api";
import { usePermissions } from "@/hooks/usePermissions";


export default function BackupsPage() {
  const { hasPermission, loading: permsLoading } = usePermissions();
  const canList = hasPermission("backups.list");
  const canGenerate = hasPermission("backups.generate");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDownloadBackup = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.get("/backups", {
        responseType: 'blob',
        fullResponse: true
      });

      // Handle the stream download
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'pos_backup.sql';
      if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
          filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
    } catch (err) {
      console.error("Download Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (permsLoading) return null;

  if (!canList) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" icon={<Security />} sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Access Denied</Typography>
          <Typography variant="body1">
            You do not have the required permission (backups.list) to access the backup management page. 
            Please contact your administrator if you believe this is an error.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        System Backup
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Securely export your entire database as a standard SQL file. This includes all products, sales, customers, and user configurations.
      </Typography>

      <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", color: "white", p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Storage />
          <Typography variant="h6" fontWeight="bold">Main Database (PostgreSQL)</Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          {!canGenerate && (
            <Alert 
              severity="warning" 
              icon={<Security />}
              sx={{ mb: 4, borderRadius: 2 }}
            >
              You do not have permission to generate database backups. Please contact your system administrator for access.
            </Alert>
          )}
          <Stack spacing={3}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: "action.hover", 
                color: "primary.main",
                display: "flex" 
              }}>
                <Security fontSize="large" />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Secure Streaming</Typography>
                <Typography variant="body2" color="text.secondary">
                  The backup is generated in real-time and streamed directly to your browser. 
                  Nothing is stored permanently on the server side to maintain maximum privacy and security.
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: "action.hover", 
                color: "primary.main",
                display: "flex" 
              }}>
                <CloudDownload fontSize="large" />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Local Storage</Typography>
                <Typography variant="body2" color="text.secondary">
                  The resulting .sql file will be saved to your local computer. We recommend keeping these backups in a safe, encrypted location.
                </Typography>
              </Box>
            </Box>

            {canGenerate && (
              <Box sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudDownload />}
                  onClick={handleDownloadBackup}
                  disabled={loading}
                  sx={{ 
                    py: 1.5, 
                    fontWeight: "bold", 
                    borderRadius: 2,
                    boxShadow: "0 8px 16px rgba(25, 118, 210, 0.3)"
                  }}
                >
                  {loading ? "Generating Backup..." : "Generate and Download Backup"}
                </Button>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                Backup generated successfully! Check your downloads folder.
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: "info.light", color: "info.contrastText" }}>
        <Typography variant="subtitle2" fontWeight="bold">Note for Administrators:</Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          • Large databases might take a few moments to initialize the stream. Do not close the window while the download is in progress.
        </Typography>
        <Typography variant="caption" display="block">
          • Only authorized users with backup permissions can execute this command.
        </Typography>
      </Box>

      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={60} thickness={4} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Generating System Backup
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Timer fontSize="small" sx={{ opacity: 0.8 }} />
            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
              Elapsed Time: {seconds}s
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
            Please don't close this tab while we prepare your data.
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
}
