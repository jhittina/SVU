import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import SuperadminLogin from "./pages/auth/SuperadminLogin";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Production from "./pages/production/Production";
import Sales from "./pages/sales/Sales";
import Bills from "./pages/bills/Bills";
import Customers from "./pages/customers/Customers";
import Vehicles from "./pages/vehicles/Vehicles";
import Suppliers from "./pages/suppliers/Suppliers";
import DailyTransport from "./pages/dailyTransport/DailyTransport";
import CementRaw from "./pages/rawMaterials/CementRaw";
import FlyAshRaw from "./pages/rawMaterials/FlyAshRaw";
import PondAshRaw from "./pages/rawMaterials/PondAshRaw";
import DustPowderRaw from "./pages/rawMaterials/DustPowderRaw";
import ChemicalRaw from "./pages/rawMaterials/ChemicalRaw";
import WorkerSalary from "./pages/workerSalary/WorkerSalary";
import Maintenance from "./pages/maintenance/Maintenance";
import PendingAmounts from "./pages/pending/PendingAmounts";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff6b35", light: "#ff8c61", dark: "#e64a19" },
    secondary: { main: "#8b5cf6", light: "#a78bfa", dark: "#7c3aed" },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    success: { main: "#10b981" },
    error: { main: "#ef4444" },
    warning: { main: "#f59e0b" },
    info: { main: "#3b82f6" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 600,
          padding: "10px 24px",
        },
        contained: {
          boxShadow: "0 4px 14px 0 rgba(255, 107, 53, 0.39)",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(255, 107, 53, 0.5)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: 14,
          padding: "12px 16px",
        },
        head: {
          fontWeight: 700,
          fontSize: 14,
          padding: "14px 16px",
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/superadmin/login" element={<SuperadminLogin />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/production" element={<Production />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/daily-transport" element={<DailyTransport />} />
                  <Route path="/raw-materials/cement" element={<CementRaw />} />
                  <Route
                    path="/raw-materials/fly-ash"
                    element={<FlyAshRaw />}
                  />
                  <Route
                    path="/raw-materials/pond-ash"
                    element={<PondAshRaw />}
                  />
                  <Route
                    path="/raw-materials/dust-powder"
                    element={<DustPowderRaw />}
                  />
                  <Route
                    path="/raw-materials/chemical"
                    element={<ChemicalRaw />}
                  />
                  <Route path="/worker-salary" element={<WorkerSalary />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/pending" element={<PendingAmounts />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
