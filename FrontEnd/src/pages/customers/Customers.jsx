import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
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
  Alert,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PeopleIcon from "@mui/icons-material/People";
import PlaceIcon from "@mui/icons-material/Place";
import HistoryIcon from "@mui/icons-material/History";
import PaymentIcon from "@mui/icons-material/Payment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  deleteCustomer,
  manageCustomerAddress,
} from "../../api/endpoints";
import CustomerForm from "./CustomerForm";
import PaymentManager from "../../components/PaymentManager";
import DateInput from "../../components/DateInput";
import { getBrickTypes, saveBrickType } from "../../utils/brickTypes";
import { usePagination } from "../../hooks/usePagination";
import TableControls, {
  TablePaginationBar,
} from "../../components/TableControls";
import Loader from "../../components/Loader";

function AddressRow({ customer, onEdit, onDelete, onPayment, queryClient }) {
  const [open, setOpen] = useState(false);
  const [addrDialog, setAddrDialog] = useState(false);
  const [addrForm, setAddrForm] = useState({
    brickType: "",
    address: "",
    price: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [editAddr, setEditAddr] = useState(null);
  const [addrError, setAddrError] = useState("");

  // Price history dialog
  const [priceDialog, setPriceDialog] = useState(false);
  const [priceTargetAddr, setPriceTargetAddr] = useState(null);
  const [priceForm, setPriceForm] = useState({
    price: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [priceError, setPriceError] = useState("");

  const addrMutation = useMutation({
    mutationFn: ({ action, data }) =>
      manageCustomerAddress(customer._id, action, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setAddrDialog(false);
      setPriceDialog(false);
      setAddrForm({
        brickType: "",
        address: "",
        price: "",
        effectiveDate: new Date().toISOString().split("T")[0],
        note: "",
      });
      setEditAddr(null);
      setAddrError("");
      setPriceForm({
        price: "",
        effectiveDate: new Date().toISOString().split("T")[0],
        note: "",
      });
      setPriceError("");
    },
    onError: (e) => {
      const msg = e?.response?.data?.Message || "Failed";
      setAddrError(msg);
      setPriceError(msg);
    },
  });

  const openAddAddress = (e) => {
    e.stopPropagation();
    setEditAddr(null);
    setAddrForm({
      brickType: "",
      address: "",
      price: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      note: "",
    });
    setAddrDialog(true);
  };
  const openEditAddress = (a) => {
    setEditAddr(a);
    setAddrForm({
      brickType: a.brickType || "",
      address: a.address,
      price: String(a.price || ""),
      effectiveDate: new Date().toISOString().split("T")[0],
      note: "",
    });
    setAddrDialog(true);
  };
  const openPriceHistory = (a, e) => {
    e.stopPropagation();
    setPriceTargetAddr(a);
    setPriceForm({
      price: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      note: "",
    });
    setPriceError("");
    setPriceDialog(true);
  };

  const addresses = customer.address || [];
  // Unique brick types for this customer (from addresses)
  const uniqueBrickTypes = [
    ...new Set(addresses.map((a) => a.brickType).filter(Boolean)),
  ];

  return (
    <>
      <TableRow
        sx={{
          bgcolor: open ? "rgba(139,92,246,0.08)" : undefined,
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(139,92,246,0.08)" },
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell
          sx={{ color: "text.disabled", fontSize: 14, userSelect: "none" }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontSize: 14 }}>{customer.name}</TableCell>
        <TableCell>
          {uniqueBrickTypes.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {uniqueBrickTypes.map((bt) => (
                <Chip
                  key={bt}
                  label={bt}
                  size="small"
                  sx={{
                    bgcolor: "rgba(139,92,246,0.15)",
                    color: "#a78bfa",
                    border: "1px solid rgba(139,92,246,0.3)",
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
              ))}
            </Stack>
          ) : (
            "—"
          )}
        </TableCell>
        <TableCell sx={{ fontSize: 14 }}>{customer.poNumber || "—"}</TableCell>
        <TableCell sx={{ fontSize: 14 }}>
          {customer.contactNumber || "—"}
        </TableCell>
        <TableCell>
          <Chip
            label={`${addresses.length} addr`}
            size="small"
            icon={<PlaceIcon sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor:
                addresses.length > 0
                  ? "rgba(139,92,246,0.15)"
                  : "rgba(100,116,139,0.15)",
              color: addresses.length > 0 ? "#a78bfa" : "#94a3b8",
              border:
                addresses.length > 0
                  ? "1px solid rgba(139,92,246,0.3)"
                  : "1px solid rgba(100,116,139,0.3)",
              fontSize: 11,
            }}
          />
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Payments">
              <IconButton
                size="small"
                onClick={() => onPayment(customer)}
                sx={{
                  bgcolor: "rgba(16,185,129,0.15)",
                  color: "#10b981",
                  "&:hover": { bgcolor: "rgba(16,185,129,0.25)" },
                  width: 28,
                  height: 28,
                }}
              >
                <PaymentIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Customer">
              <IconButton
                size="small"
                onClick={() => onEdit(customer)}
                sx={{
                  bgcolor: "rgba(139,92,246,0.15)",
                  color: "#a78bfa",
                  "&:hover": { bgcolor: "rgba(139,92,246,0.25)" },
                  width: 28,
                  height: 28,
                }}
              >
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Customer">
              <IconButton
                size="small"
                onClick={() => onDelete(customer._id)}
                sx={{
                  bgcolor: "rgba(239,68,68,0.15)",
                  color: "#f87171",
                  "&:hover": { bgcolor: "rgba(239,68,68,0.25)" },
                  width: 28,
                  height: 28,
                }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, border: open ? undefined : 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                bgcolor: "rgba(30,41,59,0.6)",
                px: 5,
                py: 2,
                borderTop: "1px dashed rgba(139,92,246,0.3)",
                borderBottom: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="#fff"
                mb={1.5}
              >
                Delivery Addresses
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={openAddAddress}
                sx={{
                  bgcolor: "#ff6b35",
                  color: "#fff",
                  "&:hover": { bgcolor: "#f7931e" },
                  px: 2,
                  mb: 2,
                }}
              >
                Add Address
              </Button>
              {addresses.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  No addresses yet — click "Add Address" to add one.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {addresses.map((a, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        bgcolor: "rgba(30,41,59,0.8)",
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        border: "1px solid rgba(139,92,246,0.2)",
                      }}
                    >
                      <PlaceIcon
                        sx={{ color: "#a78bfa", fontSize: 18, flexShrink: 0 }}
                      />
                      {a.brickType && (
                        <Chip
                          label={a.brickType}
                          size="small"
                          sx={{
                            bgcolor: "rgba(139,92,246,0.15)",
                            color: "#a78bfa",
                            border: "1px solid rgba(139,92,246,0.3)",
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      )}
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {a.address}
                      </Typography>
                      {a.price != null && (
                        <Chip
                          label={`₹${Number(a.price).toLocaleString()}/brick`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,107,53,0.15)",
                            color: "#fb923c",
                            border: "1px solid rgba(255,107,53,0.3)",
                            fontWeight: 600,
                          }}
                        />
                      )}
                      <Tooltip title="Price History">
                        <IconButton
                          size="small"
                          onClick={(e) => openPriceHistory(a, e)}
                          sx={{
                            bgcolor: "rgba(139,92,246,0.15)",
                            color: "#c4b5fd",
                            "&:hover": { bgcolor: "rgba(139,92,246,0.25)" },
                            width: 26,
                            height: 26,
                          }}
                        >
                          <HistoryIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditAddress(a)}
                          sx={{
                            bgcolor: "rgba(139,92,246,0.15)",
                            color: "#a78bfa",
                            "&:hover": { bgcolor: "rgba(139,92,246,0.25)" },
                            width: 26,
                            height: 26,
                          }}
                        >
                          <EditIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() =>
                            addrMutation.mutate({
                              action: "delete",
                              data: {
                                brickType: a.brickType,
                                address: a.address,
                                price: a.price,
                              },
                            })
                          }
                          sx={{
                            bgcolor: "rgba(239,68,68,0.15)",
                            color: "#f87171",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.25)" },
                            width: 26,
                            height: 26,
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Address add/edit dialog */}
      <Dialog
        open={addrDialog}
        onClose={() => setAddrDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden", bgcolor: "#1e293b" },
        }}
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
            borderBottom: "2px solid rgba(255,107,53,0.5)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {editAddr ? "Edit Address" : "Add Address"}
        </DialogTitle>
        <Divider />
        <DialogContent>
          {addrError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addrError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              freeSolo
              options={getBrickTypes()}
              value={addrForm.brickType}
              onChange={(_, val) => {
                if (val) saveBrickType(val);
                setAddrForm({ ...addrForm, brickType: val || "" });
              }}
              onInputChange={(_, val) =>
                setAddrForm({ ...addrForm, brickType: val })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Brick Type"
                  required
                  fullWidth
                  helperText="Select existing or type new"
                />
              )}
            />
            <TextField
              label="Address"
              required
              fullWidth
              value={addrForm.address}
              onChange={(e) =>
                setAddrForm({ ...addrForm, address: e.target.value })
              }
            />
            <TextField
              label="Price per Brick (₹)"
              type="number"
              fullWidth
              value={addrForm.price}
              onChange={(e) =>
                setAddrForm({ ...addrForm, price: e.target.value })
              }
            />
            {!editAddr && (
              <>
                <DateInput
                  label="Effective From"
                  value={addrForm.effectiveDate}
                  onChange={(val) =>
                    setAddrForm({ ...addrForm, effectiveDate: val })
                  }
                />
                <TextField
                  label="Note (optional)"
                  fullWidth
                  value={addrForm.note}
                  placeholder="e.g. Initial rate"
                  onChange={(e) =>
                    setAddrForm({ ...addrForm, note: e.target.value })
                  }
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setAddrDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              addrMutation.isPending || !addrForm.address || !addrForm.brickType
            }
            sx={{ bgcolor: "#ff6b35" }}
            onClick={() => {
              setAddrError("");
              const payload = {
                brickType: addrForm.brickType,
                address: addrForm.address,
                price: Number(addrForm.price),
                effectiveDate: addrForm.effectiveDate,
                note: addrForm.note,
              };
              if (editAddr) {
                // Pass original identifiers so backend can find the right entry
                payload.origBrickType = editAddr.brickType;
                payload.origAddress = editAddr.address;
              }
              addrMutation.mutate({
                action: editAddr ? "update" : "create",
                data: payload,
              });
            }}
          >
            {addrMutation.isPending ? (
              <CircularProgress size={20} />
            ) : editAddr ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Price History Dialog ── */}
      <Dialog
        open={priceDialog}
        onClose={() => setPriceDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden", bgcolor: "#1e293b" },
        }}
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
            borderBottom: "2px solid rgba(255,107,53,0.5)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          Price History — {priceTargetAddr?.brickType} @{" "}
          {priceTargetAddr?.address}
        </DialogTitle>
        <Divider />
        <DialogContent>
          {priceError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {priceError}
            </Alert>
          )}
          {/* History table */}
          {(priceTargetAddr?.priceHistory || []).length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: "italic" }}
            >
              No price history recorded yet.
            </Typography>
          ) : (
            (() => {
              const sorted = [...(priceTargetAddr?.priceHistory || [])].sort(
                (a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate),
              );
              const now = new Date();
              const currentIdx = sorted.findIndex(
                (h) => new Date(h.effectiveDate) <= now,
              );
              return (
                <Table size="small" sx={{ mb: 3 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                        borderBottom: "2px solid rgba(255,107,53,0.5)",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: "#fff" }}>
                        Effective Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#fff" }}>
                        Price (₹)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#fff" }}>
                        Note
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#fff" }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sorted.map((h, i) => {
                      const isFuture = new Date(h.effectiveDate) > now;
                      const isCurrent = i === currentIdx;
                      return (
                        <TableRow
                          key={i}
                          sx={{
                            bgcolor: isCurrent
                              ? "rgba(139,92,246,0.15)"
                              : isFuture
                                ? "rgba(255,107,53,0.1)"
                                : "rgba(30,41,59,0.4)",
                          }}
                        >
                          <TableCell>
                            {new Date(h.effectiveDate).toLocaleDateString(
                              "en-IN",
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            ₹{h.price}
                          </TableCell>
                          <TableCell>{h.note || "—"}</TableCell>
                          <TableCell>
                            {isFuture ? (
                              <Chip
                                label="Future"
                                size="small"
                                sx={{
                                  bgcolor: "rgba(255,107,53,0.15)",
                                  color: "#fb923c",
                                  border: "1px solid rgba(255,107,53,0.3)",
                                }}
                              />
                            ) : isCurrent ? (
                              <Chip
                                label="Current"
                                size="small"
                                sx={{
                                  bgcolor: "rgba(139,92,246,0.15)",
                                  color: "#a78bfa",
                                  border: "1px solid rgba(139,92,246,0.3)",
                                }}
                              />
                            ) : (
                              <Chip
                                label="Past"
                                size="small"
                                sx={{
                                  bgcolor: "rgba(100,116,139,0.15)",
                                  color: "#94a3b8",
                                  border: "1px solid rgba(100,116,139,0.3)",
                                }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              );
            })()
          )}
          {/* Set new price form */}
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="#fff"
            sx={{ mb: 1.5 }}
          >
            Set New Price
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="New Price (₹)"
              type="number"
              required
              fullWidth
              value={priceForm.price}
              onChange={(e) =>
                setPriceForm({ ...priceForm, price: e.target.value })
              }
            />
            <DateInput
              label="Effective From"
              value={priceForm.effectiveDate}
              onChange={(val) =>
                setPriceForm({ ...priceForm, effectiveDate: val })
              }
            />
            <TextField
              label="Note (optional)"
              fullWidth
              value={priceForm.note}
              placeholder="e.g. Annual rate revision"
              onChange={(e) =>
                setPriceForm({ ...priceForm, note: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setPriceDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              addrMutation.isPending ||
              !priceForm.price ||
              !priceForm.effectiveDate
            }
            sx={{ bgcolor: "#ff6b35" }}
            onClick={() => {
              setPriceError("");
              addrMutation.mutate({
                action: "addPrice",
                data: {
                  brickType: priceTargetAddr.brickType,
                  address: priceTargetAddr.address,
                  newPrice: Number(priceForm.price),
                  effectiveDate: priceForm.effectiveDate,
                  note: priceForm.note,
                },
              });
            }}
          >
            {addrMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              "Save Price"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function Customers() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    usePagination(10);

  const {
    data: res,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customers", page, limit, debouncedSearch],
    queryFn: async () =>
      (await getCustomers(page, limit, debouncedSearch)).data,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteTarget(null);
    },
  });

  const { data, totalCount, totalPages } = res || {};
  const rows = data || [];

  // Calculate statistics
  const customersWithAddresses = rows.filter(
    (r) => r.addresses && r.addresses.length > 0,
  ).length;
  const totalAddresses = rows.reduce(
    (sum, r) => sum + (r.addresses?.length || 0),
    0,
  );

  const openAdd = () => {
    setEditRow(null);
    setDialogOpen(true);
  };
  const openEdit = (row) => {
    setEditRow(row);
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setEditRow(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          pb: 1.5,
          borderBottom: "2px solid rgba(139,92,246,0.2)",
          flexWrap: { xs: "wrap", md: "nowrap" },
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              bgcolor: "#1a237e",
              color: "#fff",
              borderRadius: 2,
              p: 1,
              display: "flex",
            }}
          >
            <PeopleIcon />
          </Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              background: "linear-gradient(135deg, #ff6b35 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2,
            }}
          >
            Customers
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            background: "linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #f59e0b 0%, #ff6b35 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(255,107,53,0.4)",
            },
            transition: "all 0.3s ease",
            px: 3,
            py: 1,
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(255,107,53,0.39)",
          }}
        >
          Add New
        </Button>
      </Box>

      {/* Summary Tiles + Search */}
      {!isLoading && (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mb: 2, mt: 1, flexWrap: "wrap", gap: 1.5 }}
        >
          <Box
            sx={{
              bgcolor: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 3,
              px: 2,
              py: 1,
              minWidth: 120,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(148,163,184,0.9)", fontSize: 11 }}
            >
              Total Customers
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
            >
              {totalCount || 0}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 3,
              px: 2,
              py: 1,
              minWidth: 120,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(148,163,184,0.9)", fontSize: 11 }}
            >
              With Addresses
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
            >
              {customersWithAddresses}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 3,
              px: 2,
              py: 1,
              minWidth: 120,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(148,163,184,0.9)", fontSize: 11 }}
            >
              Total Addresses
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
            >
              {totalAddresses}
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Search */}
          <TableControls search={search} onSearchChange={setSearch} />
        </Stack>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.response?.data?.Message || "Failed to load"}
        </Alert>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: "#1e293b",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            borderRadius: 3,
            border: "1px solid rgba(255,107,53,0.2)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                  borderBottom: "2px solid rgba(255,107,53,0.5)",
                }}
              >
                <TableCell sx={{ color: "#fff", width: 40 }} />
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, fontSize: 14, py: 2 }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, fontSize: 14, py: 2 }}
                >
                  Brick Type
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, fontSize: 14, py: 2 }}
                >
                  PO Number
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, fontSize: 14, py: 2 }}
                >
                  Contact
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700, fontSize: 14, py: 2 }}
                >
                  Addresses
                </TableCell>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    py: 2,
                    width: 90,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    No customers found. Click "Add New" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <AddressRow
                    key={row._id}
                    customer={row}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteTarget(id)}
                    onPayment={(c) => setPaymentTarget(c)}
                    queryClient={queryClient}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Rows per page + Pagination (after table) */}
      {!isLoading && (
        <TablePaginationBar
          page={page}
          totalPages={totalPages || 1}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
          totalCount={totalCount || 0}
        />
      )}

      {/* Edit / Add Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden", bgcolor: "#1e293b" },
        }}
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
            borderBottom: "2px solid rgba(255,107,53,0.5)",
            color: "#fff",
            fontWeight: 700,
            py: 2,
          }}
        >
          {editRow ? "Edit Customer" : "Add Customer"}
        </DialogTitle>
        <Divider />
        <CustomerForm
          editData={editRow}
          onClose={closeDialog}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            closeDialog();
          }}
        />
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 3, bgcolor: "#1e293b" } }}
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
            borderBottom: "2px solid rgba(255,107,53,0.5)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this customer?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(deleteTarget)}
          >
            {deleteMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Manager */}
      <PaymentManager
        type="customer"
        referenceId={paymentTarget?._id}
        referenceName={paymentTarget?.name}
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
      />
    </Box>
  );
}
