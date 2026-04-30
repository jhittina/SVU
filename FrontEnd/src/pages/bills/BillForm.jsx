import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  addBill,
  updateBill,
  getChallansForBill,
  downloadBillPdf,
} from "../../api/endpoints";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";

export default function BillForm({ editRow, onSuccess }) {
  const queryClient = useQueryClient();
  const [dateFrom, setDateFrom] = useState(
    editRow?.dateFrom
      ? dayjs(editRow.dateFrom).format("YYYY-MM-DD")
      : dayjs().subtract(30, "days").format("YYYY-MM-DD"),
  );
  const [dateTo, setDateTo] = useState(
    editRow?.dateTo
      ? dayjs(editRow.dateTo).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD"),
  );
  const [selectedCustomer, setSelectedCustomer] = useState(
    editRow?.customerName || "",
  );
  const [selectedChallans, setSelectedChallans] = useState(
    editRow?.billItems?.map((item) => item.challanId) || [],
  );
  const [notes, setNotes] = useState(editRow?.notes || "");
  const [error, setError] = useState("");
  const [previewEnabled, setPreviewEnabled] = useState(false);

  // Query to fetch challans for bill
  const {
    data: challansData,
    isLoading: isLoadingChallans,
    refetch: refetchChallans,
  } = useQuery({
    queryKey: ["challans-for-bill", dateFrom, dateTo],
    queryFn: async () => {
      if (!previewEnabled) return null;
      const res = await getChallansForBill(dateFrom, dateTo);
      return res.data?.data || {};
    },
    enabled: false, // Manual trigger
  });

  const customers = challansData ? Object.keys(challansData) : [];
  const availableChallans = selectedCustomer
    ? challansData?.[selectedCustomer] || []
    : [];

  const mutation = useMutation({
    mutationFn: (data) => {
      if (editRow) return updateBill(editRow._id, data);
      return addBill(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.response?.data?.Message || "Failed to save bill");
    },
  });

  const handlePreview = () => {
    setError("");
    if (!dateFrom || !dateTo) {
      setError("Please select both date range");
      return;
    }
    if (dayjs(dateFrom).isAfter(dayjs(dateTo))) {
      setError("From date must be before To date");
      return;
    }
    setPreviewEnabled(true);
    refetchChallans();
  };

  const toggleChallan = (challanId) => {
    setSelectedChallans((prev) =>
      prev.includes(challanId)
        ? prev.filter((id) => id !== challanId)
        : [...prev, challanId],
    );
  };

  const selectAllForCustomer = () => {
    const allIds = availableChallans.map((c) => c._id);
    setSelectedChallans((prev) => {
      const filtered = prev.filter((id) => !allIds.includes(id));
      return [...filtered, ...allIds];
    });
  };

  const deselectAllForCustomer = () => {
    const allIds = availableChallans.map((c) => c._id);
    setSelectedChallans((prev) => prev.filter((id) => !allIds.includes(id)));
  };

  const handleSubmit = (status) => {
    setError("");
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }
    if (selectedChallans.length === 0) {
      setError("Please select at least one challan");
      return;
    }

    const payload = {
      dateFrom,
      dateTo,
      customerName: selectedCustomer,
      challanIds: selectedChallans,
      status,
      notes,
    };

    mutation.mutate(payload);
  };

  const calculateTotal = () => {
    if (!selectedCustomer || selectedChallans.length === 0) return 0;
    return availableChallans
      .filter((c) => selectedChallans.includes(c._id))
      .reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Date Range Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          Step 1: Select Date Range
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <DateInput
              label="From Date"
              value={dateFrom}
              onChange={(val) => {
                setDateFrom(val);
                setPreviewEnabled(false);
                setSelectedCustomer("");
                setSelectedChallans([]);
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <DateInput
              label="To Date"
              value={dateTo}
              onChange={(val) => {
                setDateTo(val);
                setPreviewEnabled(false);
                setSelectedCustomer("");
                setSelectedChallans([]);
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              variant="contained"
              onClick={handlePreview}
              fullWidth
              disabled={isLoadingChallans}
              sx={{
                height: "56px",
                bgcolor: "#ff6b35",
                "&:hover": { bgcolor: "#f7931e" },
              }}
            >
              {isLoadingChallans ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : (
                "Preview"
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {previewEnabled && challansData && (
        <>
          <Divider sx={{ my: 3 }} />

          {/* Customer Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Step 2: Select Customer
            </Typography>
            {customers.length === 0 ? (
              <Alert severity="info">
                No confirmed challans found in the selected date range.
              </Alert>
            ) : (
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {customers.map((customer) => (
                  <Chip
                    key={customer}
                    label={`${customer} (${challansData[customer].length})`}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setSelectedChallans([]);
                    }}
                    color={
                      selectedCustomer === customer ? "primary" : "default"
                    }
                    sx={{
                      fontWeight: selectedCustomer === customer ? 700 : 400,
                      bgcolor:
                        selectedCustomer === customer ? "#1a237e" : "#e8eaf6",
                      color: selectedCustomer === customer ? "#fff" : "#1a237e",
                      "&:hover": {
                        bgcolor:
                          selectedCustomer === customer ? "#283593" : "#c5cae9",
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {selectedCustomer && availableChallans.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />

              {/* Challan Selection */}
              <Box sx={{ mb: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Step 3: Select Challans
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      onClick={selectAllForCustomer}
                      sx={{ fontSize: 12 }}
                    >
                      Select All
                    </Button>
                    <Button
                      size="small"
                      onClick={deselectAllForCustomer}
                      sx={{ fontSize: 12 }}
                    >
                      Deselect All
                    </Button>
                  </Stack>
                </Stack>
                <TableContainer
                  component={Paper}
                  sx={{ maxHeight: 400, border: "1px solid #e8eaf6" }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={
                              availableChallans.length > 0 &&
                              availableChallans.every((c) =>
                                selectedChallans.includes(c._id),
                              )
                            }
                            indeterminate={
                              availableChallans.some((c) =>
                                selectedChallans.includes(c._id),
                              ) &&
                              !availableChallans.every((c) =>
                                selectedChallans.includes(c._id),
                              )
                            }
                            onChange={(e) =>
                              e.target.checked
                                ? selectAllForCustomer()
                                : deselectAllForCustomer()
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Challan ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>
                          Amount (₹)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableChallans.map((challan) => (
                        <TableRow
                          key={challan._id}
                          hover
                          onClick={() => toggleChallan(challan._id)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedChallans.includes(challan._id)}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                            {challan._id}
                          </TableCell>
                          <TableCell>
                            {dayjs(challan.date).format("DD/MM/YYYY")}
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              flexWrap="wrap"
                            >
                              {challan.saleDetail?.map((item, i) => (
                                <Chip
                                  key={i}
                                  label={`${item.brickName}: ${item.quantity}`}
                                  size="small"
                                  sx={{ fontSize: 10 }}
                                />
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 700, textAlign: "right" }}
                          >
                            ₹{challan.totalAmount?.toLocaleString("en-IN") || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Total Summary */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "#e8eaf6",
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Selected: {selectedChallans.length} challan(s)
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#1a237e">
                    Total: ₹{calculateTotal().toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>

              {/* Notes */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Notes (Optional)"
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  placeholder="Add any additional notes or remarks for this bill"
                />
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => handleSubmit("draft")}
                  disabled={mutation.isPending}
                  sx={{ fontWeight: 600 }}
                >
                  {mutation.isPending ? "Saving..." : "Save as Draft"}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSubmit("confirmed")}
                  disabled={mutation.isPending}
                  sx={{
                    bgcolor: "#42a5f5",
                    "&:hover": { bgcolor: "#1e88e5" },
                    fontWeight: 600,
                  }}
                >
                  {mutation.isPending ? "Confirming..." : "Confirm Bill"}
                </Button>
              </Stack>
            </>
          )}
        </>
      )}
    </Box>
  );
}
