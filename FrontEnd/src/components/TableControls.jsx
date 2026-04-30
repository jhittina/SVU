import {
  Box,
  TextField,
  InputAdornment,
  Stack,
  Pagination as MuiPagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function TableControls({
  search = "",
  onSearchChange,
  page = 1,
  totalPages = 1,
  onPageChange,
  limit = 10,
  onLimitChange,
  totalCount = 0,
}) {
  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <TextField
      placeholder="Search..."
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
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
  );
}

export function TablePaginationBar({
  page = 1,
  totalPages = 1,
  onPageChange,
  limit = 10,
  onLimitChange,
  totalCount = 0,
}) {
  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
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
            onChange={(e) => onLimitChange(e.target.value)}
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
          Showing {startItem}-{endItem} of {totalCount}
        </Typography>
      </Stack>
      {totalPages > 1 && (
        <MuiPagination
          count={totalPages}
          page={page}
          onChange={(e, value) => onPageChange(value)}
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
  );
}
