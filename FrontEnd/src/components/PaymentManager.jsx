import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayments,
  createPayment,
  deletePayment,
  getCustomerPaymentSummary,
  getSupplierPaymentSummary,
  getVehiclePaymentSummary,
  getWorkerPaymentSummary,
  getMaintenancePaymentSummary,
} from "../api/endpoints";
import dayjs from "dayjs";
import DateInput from "./DateInput";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
];

export default function PaymentManager({
  type,
  referenceId,
  referenceName,
  open,
  onClose,
}) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    note: "",
  });

  // Date range for worker/maintenance (default: current month)
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  const [dateFrom, setDateFrom] = useState(monthStart);
  const [dateTo, setDateTo] = useState(monthEnd);

  const needsDateFilter = type === "worker" || type === "maintenance";

  const summaryQuery = useQuery({
    queryKey: [
      "paymentSummary",
      type,
      referenceId,
      referenceName,
      needsDateFilter ? dateFrom : null,
      needsDateFilter ? dateTo : null,
    ],
    queryFn: async () => {
      if (type === "customer") {
        return (await getCustomerPaymentSummary(referenceId, referenceName))
          .data;
      } else if (type === "supplier") {
        return (await getSupplierPaymentSummary(referenceName)).data;
      } else if (type === "vehicle") {
        return (await getVehiclePaymentSummary(referenceName)).data;
      } else if (type === "worker") {
        return (await getWorkerPaymentSummary(null, dateFrom, dateTo)).data;
      } else if (type === "maintenance") {
        return (await getMaintenancePaymentSummary(null, dateFrom, dateTo))
          .data;
      }
    },
    enabled: open,
  });

  const paymentsQuery = useQuery({
    queryKey: ["payments", type, referenceId],
    queryFn: async () => (await getPayments(type, referenceId)).data,
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (data) => createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments", type, referenceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["paymentSummary", type, referenceId, referenceName],
      });
      setAddOpen(false);
      setForm({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        note: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments", type, referenceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["paymentSummary", type, referenceId, referenceName],
      });
    },
  });

  const handleSubmit = () => {
    if (!form.amount || !form.date) return;
    addMutation.mutate({
      type,
      referenceId,
      referenceName,
      amount: Number(form.amount),
      date: form.date,
      paymentMethod: form.paymentMethod,
      note: form.note,
    });
  };

  const summary = summaryQuery.data;
  const payments = paymentsQuery.data?.data || [];

  const getTotalLabel = () => {
    switch (type) {
      case "customer":
        return "Total Billed";
      case "supplier":
        return "Total Purchases";
      case "vehicle":
        return "Total Transport";
      case "worker":
        return "Total Salary";
      case "maintenance":
        return "Total Maintenance";
      default:
        return "Total";
    }
  };
  const getTotalValue = () => {
    if (!summary) return 0;
    switch (type) {
      case "customer":
        return summary.totalBilled;
      case "supplier":
        return summary.totalPurchases;
      case "vehicle":
        return summary.totalTransport;
      case "worker":
        return summary.totalSalary;
      case "maintenance":
        return summary.totalMaintenance;
      default:
        return 0;
    }
  };
  const totalLabel = getTotalLabel();
  const totalValue = getTotalValue();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: "#1e293b", color: "#f1f5f9" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <PaymentIcon sx={{ color: "#8b5cf6" }} />
        <Typography variant="h6" fontWeight={700}>
          Payments — {referenceName}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {/* Date Range Filter for worker/maintenance */}
        {needsDateFilter && (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mb: 2, mt: 1 }}
          >
            <DateInput
              label="From"
              value={dateFrom}
              onChange={(val) => setDateFrom(val)}
              fullWidth={false}
              sx={{ minWidth: 160 }}
            />
            <DateInput
              label="To"
              value={dateTo}
              onChange={(val) => setDateTo(val)}
              fullWidth={false}
              sx={{ minWidth: 160 }}
            />
            <Chip
              label={`${dayjs(dateFrom).format("DD MMM")} — ${dayjs(dateTo).format("DD MMM YYYY")}`}
              size="small"
              sx={{ bgcolor: "rgba(139,92,246,0.15)", color: "#a78bfa" }}
            />
          </Stack>
        )}

        {/* Summary Cards */}
        {summaryQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : summary ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 3, mt: 2, flexWrap: "wrap", gap: 2 }}
          >
            <Box
              sx={{
                bgcolor: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: 3,
                px: 3,
                py: 2,
                minWidth: 150,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(148,163,184,0.9)", fontSize: 12, mb: 0.5 }}
              >
                {totalLabel}
              </Typography>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>
                ₹{(totalValue || 0).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(16,185,129,0.4)",
                borderRadius: 3,
                px: 3,
                py: 2,
                minWidth: 150,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(148,163,184,0.9)", fontSize: 12, mb: 0.5 }}
              >
                Total Paid
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#10b981", fontWeight: 800 }}
              >
                ₹{(summary.totalPaid || 0).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "rgba(15,23,42,0.9)",
                border: `1px solid ${summary.pending > 0 ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
                borderRadius: 3,
                px: 3,
                py: 2,
                minWidth: 150,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(148,163,184,0.9)", fontSize: 12, mb: 0.5 }}
              >
                Pending
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: summary.pending > 0 ? "#ef4444" : "#10b981",
                  fontWeight: 800,
                }}
              >
                ₹{(summary.pending || 0).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        ) : null}

        {/* Add Payment Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Payment History
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%)",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #f59e0b 0%, #ff6b35 100%)",
              },
            }}
          >
            Add Payment
          </Button>
        </Box>

        {/* Payments Table */}
        {paymentsQuery.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : payments.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No payments recorded yet.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              bgcolor: "#0f172a",
              borderRadius: 2,
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(139,92,246,0.15) 100%)",
                  }}
                >
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                    #
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                    Amount (₹)
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                    Method
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                    Note
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p, idx) => (
                  <TableRow
                    key={p._id}
                    sx={{ "&:hover": { bgcolor: "rgba(139,92,246,0.08)" } }}
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{dayjs(p.date).format("DD/MM/YYYY")}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#10b981" }}>
                      ₹{p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          PAYMENT_METHODS.find(
                            (m) => m.value === p.paymentMethod,
                          )?.label || p.paymentMethod
                        }
                        size="small"
                        sx={{
                          bgcolor: "rgba(139,92,246,0.15)",
                          color: "#a78bfa",
                          fontSize: 12,
                        }}
                      />
                    </TableCell>
                    <TableCell>{p.note || "—"}</TableCell>
                    <TableCell>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => deleteMutation.mutate(p._id)}
                          sx={{
                            color: "#ef4444",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.15)" },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add Payment Dialog */}
        <Dialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          PaperProps={{ sx: { bgcolor: "#1e293b", color: "#f1f5f9" } }}
        >
          <DialogTitle>Add Payment</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
              <TextField
                label="Amount (₹)"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                fullWidth
                required
              />
              <DateInput
                label="Date"
                value={form.date}
                onChange={(val) => setForm({ ...form, date: val })}
                size="medium"
              />
              <TextField
                label="Payment Method"
                select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({ ...form, paymentMethod: e.target.value })
                }
                fullWidth
              >
                {PAYMENT_METHODS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Note (optional)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddOpen(false)} sx={{ color: "#94a3b8" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!form.amount || !form.date || addMutation.isPending}
              sx={{
                background: "linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%)",
                fontWeight: 600,
              }}
            >
              {addMutation.isPending ? "Saving..." : "Save Payment"}
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
      <DialogActions
        sx={{ borderTop: "1px solid rgba(139,92,246,0.2)", px: 3, py: 2 }}
      >
        <Button onClick={onClose} sx={{ color: "#94a3b8" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
