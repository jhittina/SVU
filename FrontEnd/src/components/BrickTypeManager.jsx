import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Stack,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getBrickTypes,
  saveBrickType,
  deleteBrickType,
} from "../utils/brickTypes";

export default function BrickTypeManager() {
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const [error, setError] = useState("");

  const refresh = () => setTypes(getBrickTypes());

  const handleOpen = () => {
    refresh();
    setNewType("");
    setError("");
    setOpen(true);
  };

  const handleAdd = () => {
    const trimmed = newType.trim();
    if (!trimmed) return;
    if (types.includes(trimmed)) {
      setError("This brick type already exists.");
      return;
    }
    saveBrickType(trimmed);
    setNewType("");
    setError("");
    refresh();
  };

  const handleDelete = (type) => {
    deleteBrickType(type);
    refresh();
  };

  return (
    <>
      <Tooltip title="Manage Brick Types">
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={handleOpen}
          size="small"
          sx={{
            borderColor: "rgba(139,92,246,0.5)",
            color: "#8b5cf6",
            fontWeight: 600,
            background: "rgba(139,92,246,0.1)",
            "&:hover": {
              bgcolor: "rgba(139,92,246,0.2)",
              borderColor: "#8b5cf6",
            },
          }}
        >
          Brick Types
        </Button>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontWeight: 700,
            py: 2,
          }}
        >
          Manage Brick Types
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add or remove brick types used across Production, Customers, and
            Worker Salary forms.
          </Typography>

          {/* Add new */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="New Brick Type"
              value={newType}
              onChange={(e) => {
                setNewType(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              error={Boolean(error)}
              helperText={error}
              placeholder="e.g. Fly Ash 6 Inch"
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!newType.trim()}
              sx={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #667eea 100%)",
                minWidth: 44,
                px: 1,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #9d6fff 0%, #778beb 100%)",
                },
              }}
            >
              <AddIcon />
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Existing types */}
          {types.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 2 }}
            >
              No brick types defined yet.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {types.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  onDelete={() => handleDelete(t)}
                  deleteIcon={
                    <Tooltip title="Delete">
                      <DeleteIcon />
                    </Tooltip>
                  }
                  sx={{
                    bgcolor: "rgba(139,92,246,0.15)",
                    color: "#8b5cf6",
                    fontWeight: 600,
                    "& .MuiChip-deleteIcon": { color: "#c62828" },
                  }}
                />
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
