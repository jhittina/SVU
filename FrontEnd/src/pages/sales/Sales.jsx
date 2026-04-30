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
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSales,
  deleteChallan,
  updateChallan,
  downloadChallanPdf,
} from "../../api/endpoints";
import ChallanForm from "./ChallanForm";
import dayjs from "dayjs";
import { usePagination } from "../../hooks/usePagination";
import TableControls, {
  TablePaginationBar,
} from "../../components/TableControls";
import Loader from "../../components/Loader";

export default function Sales() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    usePagination(10);

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sales", page, limit, debouncedSearch],
    queryFn: async () => (await getSales(page, limit, debouncedSearch)).data,
  });
  const { data, totalCount, totalPages } = res || {};
  const rows = data || [];

  const deleteMutation = useMutation({
    mutationFn: deleteChallan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setDeleteTarget(null);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, data }) => updateChallan(id, data),
    onSuccess: async (res) => {
      const challan = res.data?.data;
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      if (challan?._id) triggerPdfDownload(challan._id);
    },
  });

  const triggerPdfDownload = async (id) => {
    try {
      const pdfRes = await downloadChallanPdf(id);
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `challan-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF download failed", e);
    }
  };

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

  const draftCount = rows.filter((r) => r.status === "draft").length;
  const confirmedCount = rows.filter((r) => r.status === "confirmed").length;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
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
              alignItems: "center",
            }}
          >
            <ReceiptIcon />
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
            Sales / Challan
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
          New Challan
        </Button>
      </Box>

      {/* Controls Row: Tiles + Search */}
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
              Total Records
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
              Draft Challans
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
            >
              {draftCount}
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
              Confirmed Challans
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
            >
              {confirmedCount}
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
          Failed to load challans
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
            border: "1px solid rgba(139,92,246,0.2)",
            width: "100%",
          }}
        >
          <Table sx={{ width: "100%" }}>
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                  borderBottom: "2px solid rgba(255,107,53,0.5)",
                }}
              >
                {[
                  "#",
                  "Challan ID",
                  "Date",
                  "Customer",
                  "Vehicle No.",
                  "Items",
                  "Total (₹)",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ color: "#fff", fontWeight: 700, py: 2, fontSize: 14 }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    No challans yet. Click "New Challan" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow
                    key={row._id}
                    sx={{
                      bgcolor: idx % 2 === 0 ? "#1e293b" : "rgba(30,41,59,0.6)",
                      "&:hover": { bgcolor: "rgba(139,92,246,0.1) !important" },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 14,
                        py: 1.8,
                      }}
                    >
                      {(page - 1) * limit + idx + 1}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}
                    >
                      {row._id}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      {dayjs(row.date).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      {row.customerName}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      {row.vehicleNumber}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {row.saleDetail?.map((item, i) => (
                          <Chip
                            key={i}
                            label={`${item.brickName}: ${item.quantity}`}
                            size="small"
                            sx={{ fontSize: 11 }}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 14 }}>
                      ₹{(row.totalAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          row.status === "confirmed" ? "Confirmed" : "Draft"
                        }
                        size="small"
                        color={
                          row.status === "confirmed" ? "success" : "warning"
                        }
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(row)}
                            sx={{
                              bgcolor: "#e3f2fd",
                              color: "#1565c0",
                              "&:hover": { bgcolor: "#bbdefb" },
                              width: 28,
                              height: 28,
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        {row.status === "draft" && (
                          <Tooltip title="Confirm & Download PDF">
                            <IconButton
                              size="small"
                              onClick={() =>
                                confirmMutation.mutate({
                                  id: row._id,
                                  data: { ...row, status: "confirmed" },
                                })
                              }
                              disabled={confirmMutation.isPending}
                              sx={{
                                bgcolor: "#e8f5e9",
                                color: "#2e7d32",
                                "&:hover": { bgcolor: "#c8e6c9" },
                                width: 28,
                                height: 28,
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {row.status === "confirmed" && (
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => triggerPdfDownload(row._id)}
                              sx={{
                                bgcolor: "#fff3e0",
                                color: "#e65100",
                                "&:hover": { bgcolor: "#ffe0b2" },
                                width: 28,
                                height: 28,
                              }}
                            >
                              <PictureAsPdfIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(row._id)}
                            sx={{
                              bgcolor: "#ffebee",
                              color: "#c62828",
                              "&:hover": { bgcolor: "#ffcdd2" },
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

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
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
          {editRow ? "Edit Challan" : "New Sale Challan"}
        </DialogTitle>
        <Divider />
        <ChallanForm
          editData={editRow}
          onClose={closeDialog}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            closeDialog();
          }}
        />
      </Dialog>

      {/* Delete Confirm */}
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
          <Typography>Are you sure you want to delete this challan?</Typography>
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
    </Box>
  );
}
