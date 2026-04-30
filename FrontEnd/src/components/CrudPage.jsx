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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Pagination as MuiPagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePagination } from "../hooks/usePagination";
import Loader from "./Loader";

/**
 * Generic CRUD page
 * Props:
 *  title:         string
 *  icon:          ReactNode (optional)
 *  queryKey:      string
 *  fetchFn:       () => Promise
 *  deleteFn:      (id) => Promise
 *  columns:       [{ key, label, render? }]
 *  FormComponent: React component accepting { editData, onClose, onSuccess }
 *  summaryFn:     (responseData) => [{ label, value }]  (optional)
 */
export default function CrudPage({
  title,
  icon,
  queryKey,
  fetchFn,
  deleteFn,
  columns,
  FormComponent,
  summaryFn,
  extraActions,
  rowActions,
}) {
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
    error,
  } = useQuery({
    queryKey: [queryKey, page, limit, debouncedSearch],
    queryFn: async () => (await fetchFn(page, limit, debouncedSearch)).data,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setDeleteTarget(null);
    },
  });

  const { data, totalCount, totalPages } = res || {};
  const rows = data || [];
  const summary = summaryFn && rows.length > 0 ? summaryFn(res) : null;

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
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      {/* ── Page Header ── */}
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
          {icon && (
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
              {icon}
            </Box>
          )}
          <Box>
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
              {title}
            </Typography>
          </Box>
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
            px: { xs: 2, sm: 3 },
            py: 1,
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(255,107,53,0.39)",
            transition: "all 0.3s ease",
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Add New
        </Button>
        {extraActions}
      </Box>

      {/* ── Controls Row: Tiles + Search ── */}
      {!isLoading && (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mb: 2, mt: 1, flexWrap: "wrap", gap: 1.5 }}
        >
          {/* Summary Tiles */}
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
          {summary &&
            summary.map((s) => (
              <Box
                key={s.label}
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
                  {s.label}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}
                >
                  {s.value}
                </Typography>
              </Box>
            ))}

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Search */}
          <TextField
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              minWidth: 200,
              maxWidth: 280,
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(255,255,255,0.05)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                },
                "&.Mui-focused": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.response?.data?.Message ||
            error?.response?.data?.message ||
            "Failed to load data"}
        </Alert>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            borderRadius: 3,
            border: "1px solid rgba(139,92,246,0.2)",
            width: "100%",
            maxWidth: "100%",
            background: "#1e293b",
            overflow: "auto",
          }}
        >
          <Table sx={{ width: "100%", minWidth: { xs: 600, sm: 750 } }}>
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                  borderBottom: "2px solid rgba(255,107,53,0.5)",
                }}
              >
                <TableCell
                  sx={{
                    color: "#f1f5f9",
                    fontWeight: 700,
                    py: 2,
                    fontSize: 14,
                    width: { xs: 40, sm: 48 },
                  }}
                >
                  #
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      color: "#f1f5f9",
                      fontWeight: 700,
                      py: 2,
                      fontSize: 14,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    color: "#f1f5f9",
                    fontWeight: 700,
                    py: 2,
                    fontSize: 14,
                    width: { xs: 80, sm: 90 },
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
                    colSpan={columns.length + 2}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    No records found. Click "Add New" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow
                    key={row._id || idx}
                    sx={{
                      bgcolor:
                        idx % 2 === 0 ? "#1e293b" : "rgba(255,107,53,0.03)",
                      "&:hover": {
                        bgcolor: "rgba(255,107,53,0.1) !important",
                        transform: "scale(1.001)",
                      },
                      "&:last-child td": { borderBottom: 0 },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <TableCell sx={{ color: "#94a3b8", fontSize: 14, py: 1.8 }}>
                      {(page - 1) * limit + idx + 1}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          py: 1.8,
                          fontSize: 14,
                          color: "#f1f5f9",
                        }}
                      >
                        {col.render ? col.render(row) : (row[col.key] ?? "—")}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(row)}
                            sx={{
                              bgcolor: "rgba(139,92,246,0.2)",
                              color: "#8b5cf6",
                              "&:hover": {
                                bgcolor: "rgba(139,92,246,0.3)",
                                transform: "scale(1.1)",
                              },
                              width: 28,
                              height: 28,
                              transition: "all 0.2s ease",
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        {deleteFn && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget(row._id)}
                              sx={{
                                bgcolor: "rgba(239,68,68,0.2)",
                                color: "#ef4444",
                                "&:hover": {
                                  bgcolor: "rgba(239,68,68,0.3)",
                                  transform: "scale(1.1)",
                                },
                                width: 28,
                                height: 28,
                                transition: "all 0.2s ease",
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {rowActions && rowActions(row)}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Rows per page + Pagination (after table) ── */}
      {!isLoading && (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap", fontSize: 12 }}
            >
              Rows per page:
            </Typography>
            <FormControl size="small">
              <Select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                sx={{ minWidth: 60 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Showing {(page - 1) * limit + 1}-
              {Math.min(page * limit, totalCount || 0)} of {totalCount || 0}
            </Typography>
          </Stack>
          {totalPages > 1 && (
            <MuiPagination
              count={totalPages || 1}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              shape="rounded"
              size="small"
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#fff",
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  bgcolor: "#ff6b35",
                  "&:hover": {
                    bgcolor: "#f7931e",
                  },
                },
              }}
            />
          )}
        </Stack>
      )}

      {/* ── Add / Edit Dialog ── */}
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
          {editRow ? `Edit ${title}` : `Add ${title}`}
        </DialogTitle>
        <Divider />
        <FormComponent
          editData={editRow}
          onClose={closeDialog}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            closeDialog();
          }}
        />
      </Dialog>

      {/* ── Delete Confirmation ── */}
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
            Are you sure you want to delete this record? This action cannot be
            undone.
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
    </Box>
  );
}
