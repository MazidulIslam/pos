"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import config from "../../../config";
import api from "../../../utils/api";


const features = [
  {
    icon: Store,
    title: "Multi-store ready",
    description:
      "Manage inventory, orders, and teams across all your branches.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "Role-based access and safe workflows for staff and managers.",
  },
  {
    icon: Sparkles,
    title: "Faster checkout",
    description:
      "Built for smooth daily operations with a clean modern interface.",
  },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formData.firstName ||
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      await api.post("/auth/register", payload);

      // Registration success, redirect to login
      router.push("/login?registered=true");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An unexpected error occurred during registration.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(79,70,229,0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(14,165,233,0.14), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1180,
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 30px 80px rgba(15, 23, 42, 0.10)",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.82)",
        }}
      >
        <Grid container>
          <Grid
            size={{ xs: 12, lg: 6 }}
            sx={{
              display: { xs: "none", lg: "flex" },
              position: "relative",
              background:
                "linear-gradient(180deg, rgba(79,70,229,0.96) 0%, rgba(67,56,202,0.95) 42%, rgba(30,41,59,0.98) 100%)",
              color: "white",
              p: 5,
              minHeight: 760,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.12,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <Stack
              sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
              }}
              justifyContent="space-between"
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2.5,
                      bgcolor: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
                    }}
                  >
                    <Store size={22} />
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    letterSpacing="-0.03em"
                  >
                    ProntoStack
                  </Typography>
                </Stack>

                <Box sx={{ maxWidth: 460 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1.08,
                      letterSpacing: "-0.04em",
                      mb: 2,
                    }}
                  >
                    Join the future of retail management.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255,255,255,0.82)",
                      fontSize: 16,
                      lineHeight: 1.8,
                      mb: 4,
                    }}
                  >
                    Register your account to access our secure POS platform. 
                    Once confirmed, your administrator can grant you access 
                    to specialized workspaces.
                  </Typography>

                  <Stack spacing={2.2}>
                    {features.map((feature) => (
                      <Stack
                        key={feature.title}
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            bgcolor: "rgba(255,255,255,0.14)",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <feature.icon size={20} />
                        </Box>
                        <Box>
                          <Typography fontWeight={700} mb={0.5}>
                            {feature.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255,255,255,0.75)",
                              lineHeight: 1.7,
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Box>

              <Box sx={{ mt: 5 }}>
                <Image
                  src="/illustrations/auth-visual.svg"
                  alt="Register illustration"
                  width={520}
                  height={360}
                  priority
                  style={{
                    width: "100%",
                    maxWidth: 520,
                    height: "auto",
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                />
              </Box>
            </Stack>
          </Grid>

          <Grid
            size={{ xs: 12, lg: 6 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 2.5, sm: 4, md: 5 },
              minHeight: { xs: "auto", lg: 760 },
            }}
          >
            <CardContent
              sx={{ width: "100%", maxWidth: 470, p: "0 !important" }}
            >
              <Stack spacing={3}>
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{ mb: 2, display: { xs: "flex", lg: "none" } }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2.5,
                        bgcolor: "primary.main",
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 12px 24px rgba(79,70,229,0.24)",
                      }}
                    >
                      <Store size={20} />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>
                      ProntoStack
                    </Typography>
                  </Stack>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      mb: 1,
                    }}
                  >
                    Create your account
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Enter your details to create a system identity.
                  </Typography>
                </Box>

                {errorMsg && (
                  <Box sx={{ p: 2, bgcolor: "#fee2e2", color: "#b91c1c", borderRadius: 2, border: "1px solid #f87171" }}>
                    <Typography variant="body2" fontWeight={600}>{errorMsg}</Typography>
                  </Box>
                )}

                <Stack
                  component="form"
                  spacing={2}
                  onSubmit={handleRegister}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="First name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Mazidul"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Last name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Islam"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="admin_user"
                      variant="outlined"
                      required
                    />

                  <TextField
                    fullWidth
                    label="Email address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword((prev) => !prev)}
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

                  <TextField
                    fullWidth
                    label="Confirm password"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    variant="outlined"
                  />

                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label={
                      <Typography component="span" variant="body2" color="text.secondary">
                        I agree to the{" "}
                        <Box
                          component="span"
                          sx={{ color: "primary.main", fontWeight: 700 }}
                        >
                          Terms of Service
                        </Box>{" "}
                        and{" "}
                        <Box
                          component="span"
                          sx={{ color: "primary.main", fontWeight: 700 }}
                        >
                          Privacy Policy
                        </Box>
                      </Typography>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    endIcon={<ArrowRight size={18} />}
                    sx={{
                      mt: 1,
                      py: 1.55,
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: 15,
                      boxShadow: "0 16px 30px rgba(79,70,229,0.28)",
                    }}
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    style={{
                      color: "var(--primary)",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
