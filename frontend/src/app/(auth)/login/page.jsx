"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import config from "../../../config";


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  React.useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const highlights = useMemo(
    () => [
      "Secure staff sign-in",
      "Fast checkout operations",
      "Real-time inventory access",
    ],
    [],
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.email || !formData.password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      // In Docker composed environment, the frontend browser makes the request to the configured API URL
      const res = await fetch(`${config.API_BASE_URL}/auth/login`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to login");
      }

      // Store token (in a real app, use secure cookies or more robust state management)
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("menus", JSON.stringify(data.data.menus));
      localStorage.setItem("permissions", JSON.stringify(data.data.permissions));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
        bgcolor: "#f8fafc",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(79,70,229,1) 0%, rgba(99,102,241,1) 45%, rgba(129,140,248,1) 100%)",
          color: "white",
          px: 8,
          py: 7,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(255,255,255,0.12), transparent 28%)",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box>
            <Chip
              icon={<ShieldCheck size={16} />}
              label="Modern POS Platform"
              sx={{
                bgcolor: "rgba(255,255,255,0.14)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
                mb: 3,
                "& .MuiChip-icon": { color: "white" },
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontSize: { lg: "3rem", xl: "3.5rem" },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                maxWidth: 520,
              }}
            >
              Run your store smarter with one beautiful POS dashboard.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 2.5,
                maxWidth: 520,
                color: "rgba(255,255,255,0.82)",
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              Sign in to manage products, customers, sales, and reports with a
              fast and modern workflow built for growing retail businesses.
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 4 }}>
              {highlights.map((item) => (
                <Box
                  key={item}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "999px",
                      bgcolor: "rgba(255,255,255,0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={15} />
                  </Box>
                  <Typography sx={{ fontWeight: 600 }}>{item}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              mt: 6,
              p: 3,
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 340,
                mb: 2,
              }}
            >
              <Image
                src="/illustrations/auth-visual.svg"
                alt="Login illustration"
                fill
                priority
                style={{ objectFit: "contain" }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              “A cleaner workflow for billing, stock tracking, and customer
              management — all in one place.”
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 5,
            border: "1px solid rgba(226,232,240,0.9)",
            boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
            bgcolor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
            <Box sx={{ display: { xs: "block", lg: "none" }, mb: 3 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}
              >
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sign in to access your POS workspace.
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", lg: "block" }, mb: 4 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}
              >
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter your credentials to continue to your dashboard.
              </Typography>
            </Box>

            {errorMsg && (
              <Box sx={{ mb: 3, p: 2, bgcolor: "#fee2e2", color: "#b91c1c", borderRadius: 2, border: "1px solid #f87171" }}>
                <Typography variant="body2" fontWeight={600}>{errorMsg}</Typography>
              </Box>
            )}

            <Stack
              component="form"
              spacing={2.25}
              onSubmit={handleLogin}
            >
              <TextField
                fullWidth
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color="#64748b" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} color="#64748b" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  }
                  label={
                    <Typography component="span" variant="body2" color="text.secondary">
                      Remember me
                    </Typography>
                  }
                />

                <Link
                  href="/register"
                  style={{
                    color: "#4f46e5",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                endIcon={<ArrowRight size={18} />}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 15,
                  boxShadow: "0 12px 24px rgba(79,70,229,0.24)",
                }}
              >
                {isLoading ? "Signing in..." : "Sign in to dashboard"}
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }}>or</Divider>

            <Stack spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.35,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Continue with Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.35,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Continue with Microsoft
              </Button>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3.5, textAlign: "center" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{
                  color: "#4f46e5",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Create one
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
