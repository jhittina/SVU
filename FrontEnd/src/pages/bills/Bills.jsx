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
import DescriptionIcon from "@mui/icons-material/Description";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBills,
  deleteBill,
  updateBill,
  downloadBillPdf,
} from "../../api/endpoints";
import BillForm from "./BillForm";
import dayjs from "dayjs";
import { usePagination } from "../../hooks/usePagination";
import TableControls, {
  TablePaginationBar,
} from "../../components/TableControls";
import Loader from "../../components/Loader";

export default function Bills() {
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
    queryKey: ["bills", page, limit, debouncedSearch],
    queryFn: async () => (await getBills(page, limit, debouncedSearch)).data,
  });
  const { data, totalCount, totalPages } = res || {};
  const rows = data || [];

  const deleteMutation = useMutation({
    mutationFn: deleteBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      setDeleteTarget(null);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, data }) => updateBill(id, data),
    onSuccess: async (res) => {
      const bill = res.data?.data;
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      if (bill?._id && bill.status === "generated") {
        triggerPdfDownload(bill._id);
      }
    },
  });

  const triggerPdfDownload = async (id) => {
    try {
      const pdfRes = await downloadBillPdf(id);
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bill-${id}.pdf`);
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

  const handleConfirm = (row) => {
    confirmMutation.mutate({
      id: row._id,
      data: { ...row, status: "confirmed" },
    });
  };

  const handleGenerate = (row) => {
    confirmMutation.mutate({
      id: row._id,
      data: { ...row, status: "generated" },
    });
  };

  const draftCount = rows.filter((r) => r.status === "draft").length;
  const confirmedCount = rows.filter((r) => r.status === "confirmed").length;
  const generatedCount = rows.filter((r) => r.status === "generated").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return { bgcolor: "#ffa726", color: "#fff" };
      case "confirmed":
        return { bgcolor: "#42a5f5", color: "#fff" };
      case "generated":
        return { bgcolor: "#66bb6a", color: "#fff" };
      default:
        return { bgcolor: "#e0e0e0", color: "#000" };
    }
  };

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
            <DescriptionIcon />
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
            Bills / Invoices
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
          Generate New Bill
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
              Draft
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
              Confirmed
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
            >
              {confirmedCount}
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
              Generated
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
            >
              {generatedCount}
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
          Failed to load bills
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
                  "Bill Number",
                  "Period",
                  "Customer",
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
                    colSpan={8}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    No bills yet. Click "Generate New Bill" to get started.
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
                      {row.billNumber}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      {dayjs(row.dateFrom).format("DD/MM/YYYY")} -{" "}
                      {dayjs(row.dateTo).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      {row.customerName}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontSize: 14 }}>
                        {row.billItems?.length || 0} items
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, color: "#a78bfa", fontSize: 14 }}
                    >
                      ₹{row.totalAmount?.toLocaleString("en-IN") || 0}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status.toUpperCase()}
                        size="small"
                        sx={{
                          ...getStatusColor(row.status),
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {row.status === "draft" && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEdit(row)}
                                sx={{ color: "#1976d2" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Confirm">
                              <IconButton
                                size="small"
                                onClick={() => handleConfirm(row)}
                                sx={{ color: "#42a5f5" }}
                                disabled={confirmMutation.isPending}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {row.status === "confirmed" && (
                          <Tooltip title="Generate & Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleGenerate(row)}
                              sx={{ color: "#66bb6a" }}
                              disabled={confirmMutation.isPending}
                            >
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {row.status === "generated" && (
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => triggerPdfDownload(row._id)}
                              sx={{ color: "#d32f2f" }}
                            >
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(row)}
                            sx={{ color: "#d32f2f" }}
                          >
                            <DeleteIcon fontSize="small" />
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

      {/* Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#1a237e",
            color: "#fff",
            fontWeight: 700,
            py: 2,
          }}
        >
          {editRow ? "Edit Bill" : "Generate New Bill"}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <BillForm editRow={editRow} onSuccess={closeDialog} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete bill{" "}
            <strong>{deleteTarget?.billNumber}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => deleteMutation.mutate(deleteTarget._id)}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            sx={{ fontWeight: 600 }}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
