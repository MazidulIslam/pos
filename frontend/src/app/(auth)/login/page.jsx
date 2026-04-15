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
import api from "../../../utils/api";


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loginStep, setLoginStep] = useState("credentials"); // 'credentials' or 'select-org'
  const [orgList, setOrgList] = useState([]);
  const [tempUser, setTempUser] = useState(null);
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
      const resp = await api.post("/auth/login", formData);
      const { user, organizations } = resp.data;

      if (!organizations || organizations.length === 0) {
          throw new Error("You are not associated with any active organizations. Please contact support.");
      }

      setTempUser(user);
      setOrgList(organizations);
      localStorage.setItem("user_organizations", JSON.stringify(organizations));
      setLoginStep("select-org");

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An unexpected error occurred during login.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrg = async (orgId) => {
      setIsLoading(true);
      setErrorMsg("");
      try {
          const resp = await api.post("/auth/select-org", {
              userId: tempUser.id,
              organizationId: orgId
          });

          const { token, user, menus, permissions, activeOrg } = resp.data;

          // Store final session data
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("active_organization", JSON.stringify(activeOrg));
          localStorage.setItem("menus", JSON.stringify(menus));
          localStorage.setItem("permissions", JSON.stringify(permissions));

          // Redirect to dashboard
          router.push("/");
      } catch (err) {
          const message = err.response?.data?.message || err.message || "Could not access organization.";
          setErrorMsg(message);
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
              label="ProntoStack Platform"
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
                fontSize: { lg: "3.2rem", xl: "3.8rem" },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                maxWidth: 520,
              }}
            >
              One platform, multiple stores. Fast and professional.
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
              ProntoStack allows you to manage multiple organizations under one account.
              Switch between workspaces seamlessly with built-in RBAC and multi-tenant security.
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
              “Switch between your business branches instantly. RBAC control ensures your staff only sees what they need.”
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
            {loginStep === "credentials" ? (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}
                  >
                    Welcome back
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Sign in to access your ProntoStack workspaces.
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
                      alignItems: "center",
                      justifyContent: "space-between",
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
                        <Typography variant="body2" color="text.secondary">
                          Remember me
                        </Typography>
                      }
                    />

                    <Link
                      href="/forgot-password"
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
                    {isLoading ? "Validating..." : "Sign in to account"}
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}
                  >
                    Select Organization
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    You belong to multiple workspaces. Please select one to enter.
                  </Typography>
                </Box>

                {errorMsg && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: "#fee2e2", color: "#b91c1c", borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={600}>{errorMsg}</Typography>
                  </Box>
                )}

                <Stack spacing={2}>
                  {orgList.map((org) => (
                    <Button
                      key={org.id}
                      fullWidth
                      onClick={() => handleSelectOrg(org.id)}
                      disabled={isLoading}
                      sx={{
                        p: 2.5,
                        justifyContent: "space-between",
                        borderRadius: 3,
                        border: "1px solid #e2e8f0",
                        bgcolor: "white",
                        color: "text.primary",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "#4f46e5",
                          bgcolor: "rgba(79,70,229,0.04)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                      }}
                      endIcon={<ArrowRight size={20} color="#4f46e5" />}
                    >
                      <Box sx={{ textAlign: "left" }}>
                        <Typography fontWeight={700} sx={{ fontSize: 16 }}>
                          {org.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {org.subdomain}.prontostack.com
                        </Typography>
                      </Box>
                    </Button>
                  ))}

                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setLoginStep("credentials")}
                    sx={{ mt: 2, color: "text.secondary", textTransform: "none" }}
                  >
                    ← Back to login
                  </Button>
                </Stack>
              </>
            )}

            {loginStep === "credentials" && (
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
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
