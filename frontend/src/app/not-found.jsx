import Image from "next/image";
import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        py: { xs: 6, md: 10 },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 6, md: 8 }}
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Box sx={{ flex: 1, maxWidth: 560 }}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              fontWeight: 800,
              letterSpacing: "0.18em",
            }}
          >
            Error 404
          </Typography>

          <Typography
            variant="h2"
            sx={{
              mt: 1,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              fontSize: { xs: "2.5rem", md: "4rem" },
            }}
          >
            Looks like this page took the day off.
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 2,
              maxWidth: 520,
              fontSize: { xs: 16, md: 18 },
              lineHeight: 1.8,
            }}
          >
            The page you are looking for doesn&apos;t exist, may have been
            moved, or the link may be incorrect. Try heading back to the
            dashboard or searching for something else.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 4 }}
          >
            <Button
              component={Link}
              href="/"
              variant="contained"
              startIcon={<Home size={18} />}
              sx={{
                px: 3,
                py: 1.4,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 12px 24px -12px rgba(79,70,229,0.55)",
              }}
            >
              Back to Home
            </Button>

            <Button
              component={Link}
              href="/login"
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              sx={{
                px: 3,
                py: 1.4,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Go to Login
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mt: 4,
              p: 2,
              borderRadius: 3,
              border: "1px solid var(--border)",
              bgcolor: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(10px)",
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "secondary.main",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <Search size={18} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Need help finding something?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Double-check the URL or use the navigation menu to continue.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 560,
              aspectRatio: "4 / 3",
              filter: "drop-shadow(0 30px 50px rgba(15,23,42,0.12))",
            }}
          >
            <Image
              src="/illustrations/not-found-visual.svg"
              alt="404 illustration"
              fill
              priority
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
