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
  Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FactoryIcon from "@mui/icons-material/Factory";
import { useMutation } from "@tanstack/react-query";
import { adminSignup } from "../../api/endpoints";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    password: "",
    profession: "",
    PhoneNo: "",
    interestedin: "",
  });
  const [showPass, setShowPass] = useState(false);

  const mutation = useMutation({
    mutationFn: adminSignup,
    onSuccess: () => {
      navigate("/login");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
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
        py: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-20%",
          left: "-15%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        },
      }}
    >
      <Card
        sx={{
          width: { xs: "90%", sm: 480 },
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
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
              }}
            >
              <FactoryIcon sx={{ fontSize: 40, color: "#fff" }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5,
              }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register a new admin account
            </Typography>
          </Box>

          {/* Success */}
          {mutation.isSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Admin created successfully! Redirecting to login...
            </Alert>
          )}

          {/* Error */}
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {mutation.error?.response?.data?.message ||
                mutation.error?.response?.data?.error ||
                "Signup failed"}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Full Name"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={form.firstName}
              onChange={handleChange("firstName")}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={form.email}
              onChange={handleChange("email")}
            />
            <TextField
              label="Password"
              type={showPass ? "text" : "password"}
              fullWidth
              required
              sx={{ mb: 2 }}
              value={form.password}
              onChange={handleChange("password")}
              helperText="Min 10 chars: uppercase, lowercase, number & special char"
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
            <TextField
              label="Profession"
              fullWidth
              sx={{ mb: 2 }}
              value={form.profession}
              onChange={handleChange("profession")}
            />
            <TextField
              label="Phone Number"
              fullWidth
              sx={{ mb: 2 }}
              value={form.PhoneNo}
              onChange={handleChange("PhoneNo")}
            />
            <TextField
              label="Interested In"
              fullWidth
              sx={{ mb: 3 }}
              value={form.interestedin}
              onChange={handleChange("interestedin")}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={mutation.isPending}
              startIcon={!mutation.isPending && <PersonAddIcon />}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                },
              }}
            >
              {mutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </Box>

          {/* Link */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 3 }}
          >
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#ff6b35",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
