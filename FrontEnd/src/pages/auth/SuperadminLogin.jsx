import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  Paper,
  Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LoginIcon from "@mui/icons-material/Login";
import { useMutation } from "@tanstack/react-query";
import { superadminSignin } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

const DEMO_CREDENTIALS = {
  email: "superadmin@brickfactory.com",
  password: "SuperAdmin@123",
};

export default function SuperadminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const mutation = useMutation({
    mutationFn: superadminSignin,
    onSuccess: (res) => {
      login(res.data.token, res.data.user);
      navigate("/");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const fillDemo = () => {
    setForm(DEMO_CREDENTIALS);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-30%",
          left: "-20%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        },
      }}
    >
      <Card
        sx={{
          width: { xs: "90%", sm: 460 },
          position: "relative",
          zIndex: 1,
          background: "rgba(30, 41, 59, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                margin: "0 auto 20px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(139,92,246,0.4)",
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "#fff" }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5,
              }}
            >
              Super Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Brick Factory — Elevated Access
            </Typography>
          </Box>

          {/* Error */}
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {mutation.error?.response?.data?.message || "Login failed"}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              sx={{ mb: 2.5 }}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Password"
              type={showPass ? "text" : "password"}
              fullWidth
              required
              sx={{ mb: 3 }}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPass((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={mutation.isPending}
              startIcon={!mutation.isPending && <LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
                },
              }}
            >
              {mutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>

          {/* Demo Credentials */}
          <Divider sx={{ my: 3 }}>
            <Chip
              label="Demo Credentials"
              size="small"
              variant="outlined"
              sx={{ color: "text.secondary" }}
            />
          </Divider>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px dashed rgba(139,92,246,0.3)",
              background: "rgba(139,92,246,0.05)",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Email:{" "}
                <strong style={{ color: "#8b5cf6" }}>
                  {DEMO_CREDENTIALS.email}
                </strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Password:{" "}
                <strong style={{ color: "#8b5cf6" }}>
                  {DEMO_CREDENTIALS.password}
                </strong>
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={fillDemo}
                sx={{
                  mt: 1,
                  borderColor: "rgba(139,92,246,0.4)",
                  color: "#8b5cf6",
                  "&:hover": {
                    borderColor: "#8b5cf6",
                    background: "rgba(139,92,246,0.1)",
                  },
                }}
              >
                Fill Demo Credentials
              </Button>
            </Stack>
          </Paper>

          {/* Links */}
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 3 }}
          >
            Admin?{" "}
            <Link
              to="/login"
              style={{
                color: "#ff6b35",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Login here
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
