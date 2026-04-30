import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BusinessIcon from "@mui/icons-material/Business";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupsIcon from "@mui/icons-material/Groups";
import BuildIcon from "@mui/icons-material/Build";
import { useQuery } from "@tanstack/react-query";
import { getPendingOverview } from "../../api/endpoints";
import dayjs from "dayjs";
import Loader from "../../components/Loader";

function getDaysChip(daysAgo) {
  if (daysAgo === null || daysAgo === undefined)
    return <Chip label="N/A" size="small" />;
  let color = "success";
  if (daysAgo > 60) color = "error";
  else if (daysAgo > 30) color = "warning";
  else if (daysAgo > 7) color = "info";
  return (
    <Chip
      label={`${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`}
      size="small"
      color={color}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}

function formatCurrency(amt) {
  return `₹${Number(amt || 0).toLocaleString("en-IN")}`;
}

function SummaryCard({ icon, title, amount, color }) {
  return (
    <Card
      sx={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(148,163,184,0.1)",
        borderRadius: 3,
        minWidth: 180,
        flex: 1,
      }}
    >
      <CardContent sx={{ py: 2, px: 2.5, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}22`,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h6" fontWeight={700} color={color}>
              {formatCurrency(amount)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PendingTable({ rows, columns }) {
  if (!rows || rows.length === 0) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
        No pending amounts — all clear!
      </Alert>
    );
  }
  return (
    <TableContainer
      component={Paper}
      sx={{
        mt: 2,
        bgcolor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(148,163,184,0.1)",
        borderRadius: 2,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                sx={{ fontWeight: 700, color: "#94a3b8" }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx} hover>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function PendingAmounts() {
  const [tab, setTab] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["pendingOverview"],
    queryFn: () => getPendingOverview().then((r) => r.data),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load pending amounts
      </Alert>
    );
  }

  const totalCustomerPending = (data.customers || []).reduce(
    (s, c) => s + c.pending,
    0,
  );
  const totalSupplierPending = (data.suppliers || []).reduce(
    (s, c) => s + c.pending,
    0,
  );
  const totalVehiclePending = (data.vehicles || []).reduce(
    (s, c) => s + c.pending,
    0,
  );
  const workerPending = data.worker?.pending || 0;
  const maintPending = data.maintenance?.pending || 0;

  const totalReceivable = totalCustomerPending;
  const totalPayable =
    totalSupplierPending + totalVehiclePending + workerPending + maintPending;

  const customerColumns = [
    { key: "name", label: "Customer Name" },
    {
      key: "totalBilled",
      label: "Total Billed",
      render: (r) => formatCurrency(r.totalBilled),
    },
    {
      key: "totalPaid",
      label: "Paid",
      render: (r) => (
        <Typography color="success.main" fontWeight={600} variant="body2">
          {formatCurrency(r.totalPaid)}
        </Typography>
      ),
    },
    {
      key: "pending",
      label: "Pending",
      render: (r) => (
        <Typography color="error.main" fontWeight={700} variant="body2">
          {formatCurrency(r.pending)}
        </Typography>
      ),
    },
    {
      key: "lastDate",
      label: "Last Bill",
      render: (r) =>
        r.lastDate ? dayjs(r.lastDate).format("DD/MM/YYYY") : "—",
    },
    {
      key: "daysAgo",
      label: "Pending Since",
      render: (r) => getDaysChip(r.daysAgo),
    },
  ];

  const supplierColumns = [
    { key: "name", label: "Supplier Name" },
    {
      key: "totalPurchases",
      label: "Total Purchases",
      render: (r) => formatCurrency(r.totalPurchases),
    },
    {
      key: "totalPaid",
      label: "Paid",
      render: (r) => (
        <Typography color="success.main" fontWeight={600} variant="body2">
          {formatCurrency(r.totalPaid)}
        </Typography>
      ),
    },
    {
      key: "pending",
      label: "Pending",
      render: (r) => (
        <Typography color="error.main" fontWeight={700} variant="body2">
          {formatCurrency(r.pending)}
        </Typography>
      ),
    },
    {
      key: "lastDate",
      label: "Last Delivery",
      render: (r) =>
        r.lastDate ? dayjs(r.lastDate).format("DD/MM/YYYY") : "—",
    },
    {
      key: "daysAgo",
      label: "Pending Since",
      render: (r) => getDaysChip(r.daysAgo),
    },
  ];

  const vehicleColumns = [
    { key: "name", label: "Vehicle Number" },
    {
      key: "totalTransport",
      label: "Total Transport",
      render: (r) => formatCurrency(r.totalTransport),
    },
    {
      key: "totalPaid",
      label: "Paid",
      render: (r) => (
        <Typography color="success.main" fontWeight={600} variant="body2">
          {formatCurrency(r.totalPaid)}
        </Typography>
      ),
    },
    {
      key: "pending",
      label: "Pending",
      render: (r) => (
        <Typography color="error.main" fontWeight={700} variant="body2">
          {formatCurrency(r.pending)}
        </Typography>
      ),
    },
    {
      key: "lastDate",
      label: "Last Trip",
      render: (r) =>
        r.lastDate ? dayjs(r.lastDate).format("DD/MM/YYYY") : "—",
    },
    {
      key: "daysAgo",
      label: "Pending Since",
      render: (r) => getDaysChip(r.daysAgo),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <AccountBalanceWalletIcon sx={{ color: "#8b5cf6", fontSize: 28 }} />
        <Typography variant="h5" fontWeight={800}>
          Pending Amounts
        </Typography>
      </Stack>

      {/* Summary Cards */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        flexWrap="wrap"
      >
        <SummaryCard
          icon={<PeopleIcon fontSize="small" />}
          title="Receivable (Customers)"
          amount={totalReceivable}
          color="#22c55e"
        />
        <SummaryCard
          icon={<WarningAmberIcon fontSize="small" />}
          title="Payable (Total)"
          amount={totalPayable}
          color="#ef4444"
        />
        <SummaryCard
          icon={<BusinessIcon fontSize="small" />}
          title="Suppliers"
          amount={totalSupplierPending}
          color="#f59e0b"
        />
        <SummaryCard
          icon={<DirectionsCarIcon fontSize="small" />}
          title="Vehicles"
          amount={totalVehiclePending}
          color="#3b82f6"
        />
        <SummaryCard
          icon={<GroupsIcon fontSize="small" />}
          title="Workers"
          amount={workerPending}
          color="#8b5cf6"
        />
        <SummaryCard
          icon={<BuildIcon fontSize="small" />}
          title="Maintenance"
          amount={maintPending}
          color="#ec4899"
        />
      </Stack>

      {/* Tabs */}
      <Paper
        sx={{
          bgcolor: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(148,163,184,0.1)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: "1px solid rgba(148,163,184,0.1)",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
          }}
        >
          <Tab
            icon={<PeopleIcon fontSize="small" />}
            iconPosition="start"
            label={`Customers (${(data.customers || []).length})`}
          />
          <Tab
            icon={<BusinessIcon fontSize="small" />}
            iconPosition="start"
            label={`Suppliers (${(data.suppliers || []).length})`}
          />
          <Tab
            icon={<DirectionsCarIcon fontSize="small" />}
            iconPosition="start"
            label={`Vehicles (${(data.vehicles || []).length})`}
          />
          <Tab
            icon={<GroupsIcon fontSize="small" />}
            iconPosition="start"
            label="Workers"
          />
          <Tab
            icon={<BuildIcon fontSize="small" />}
            iconPosition="start"
            label="Maintenance"
          />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <PendingTable rows={data.customers} columns={customerColumns} />
          )}
          {tab === 1 && (
            <PendingTable rows={data.suppliers} columns={supplierColumns} />
          )}
          {tab === 2 && (
            <PendingTable rows={data.vehicles} columns={vehicleColumns} />
          )}
          {tab === 3 && (
            <Box>
              {workerPending > 0 ? (
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Salary:
                    </Typography>
                    <Typography fontWeight={600}>
                      {formatCurrency(data.worker.totalSalary)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Paid:
                    </Typography>
                    <Typography fontWeight={600} color="success.main">
                      {formatCurrency(data.worker.totalPaid)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Pending:
                    </Typography>
                    <Typography fontWeight={700} color="error.main">
                      {formatCurrency(data.worker.pending)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Last Entry:
                    </Typography>
                    <Typography>
                      {data.worker.lastDate
                        ? dayjs(data.worker.lastDate).format("DD/MM/YYYY")
                        : "—"}
                    </Typography>
                    {getDaysChip(data.worker.daysAgo)}
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  No pending worker salary — all clear!
                </Alert>
              )}
            </Box>
          )}
          {tab === 4 && (
            <Box>
              {maintPending > 0 ? (
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Maintenance:
                    </Typography>
                    <Typography fontWeight={600}>
                      {formatCurrency(data.maintenance.totalCost)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Paid:
                    </Typography>
                    <Typography fontWeight={600} color="success.main">
                      {formatCurrency(data.maintenance.totalPaid)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Pending:
                    </Typography>
                    <Typography fontWeight={700} color="error.main">
                      {formatCurrency(data.maintenance.pending)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Last Entry:
                    </Typography>
                    <Typography>
                      {data.maintenance.lastDate
                        ? dayjs(data.maintenance.lastDate).format("DD/MM/YYYY")
                        : "—"}
                    </Typography>
                    {getDaysChip(data.maintenance.daysAgo)}
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="success" sx={{ mt: 2 }}>
                  No pending maintenance — all clear!
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
