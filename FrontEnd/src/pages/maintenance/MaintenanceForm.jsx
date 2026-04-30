import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Grid,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { addMaintenance, updateMaintenance } from "../../api/endpoints";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";

const MAINTENANCE_TYPES = [
  "Mechanical",
  "Electrical",
  "Civil",
  "Vehicle",
  "Other",
];

export default function MaintenanceForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    date: "",
    type: "",
    Resion: "",
    amount: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        date: dayjs(editData.date).format("YYYY-MM-DD"),
        type: editData.type || "",
        Resion: editData.Resion || "",
        amount: String(editData.amount || ""),
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateMaintenance(editData._id, data) : addMaintenance(data),
    onSuccess,
    onError: (e) =>
      setError(
        e?.response?.data?.Message ||
          e?.response?.data?.message ||
          "Failed to save",
      ),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    mutation.mutate({ ...form, amount: Number(form.amount) });
  };
  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DateInput
              label="Date"
              value={form.date}
              onChange={(val) => setForm({ ...form, date: val })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Type" required fullWidth {...f("type")}>
              {MAINTENANCE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              label="Reason"
              required
              multiline
              rows={2}
              fullWidth
              {...f("Resion")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Amount (₹)"
              type="number"
              required
              fullWidth
              {...f("amount")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isPending}
          sx={{ bgcolor: "#ff6b35" }}
        >
          {mutation.isPending ? (
            <CircularProgress size={20} />
          ) : isEdit ? (
            "Update"
          ) : (
            "Save"
          )}
        </Button>
      </DialogActions>
    </form>
  );
}
