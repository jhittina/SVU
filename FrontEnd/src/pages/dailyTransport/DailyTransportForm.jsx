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
import { addDailyTransport, updateDailyTransport } from "../../api/endpoints";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";

const TRANSPORT_TYPES = ["Outward", "Inward", "Internal"];

export default function DailyTransportForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    date: "",
    type: "",
    trip: "",
    vehicalNumber: "",
    perTrip: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        date: dayjs(editData.date).format("YYYY-MM-DD"),
        type: editData.type || "",
        trip: String(editData.trip || ""),
        vehicalNumber: editData.vehicalNumber || "",
        perTrip: String(editData.perTrip || ""),
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateDailyTransport(editData._id, data)
        : addDailyTransport(data),
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
    // amount is auto-calculated by backend: perTrip * trip
    mutation.mutate({
      ...form,
      trip: Number(form.trip),
      perTrip: Number(form.perTrip),
    });
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
              {TRANSPORT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Vehicle Number"
              required
              fullWidth
              {...f("vehicalNumber")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="No. of Trips"
              type="number"
              required
              fullWidth
              inputProps={{ min: 1 }}
              {...f("trip")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Per Trip (₹)"
              type="number"
              required
              fullWidth
              {...f("perTrip")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Amount (₹)"
              type="number"
              fullWidth
              value={
                form.trip && form.perTrip
                  ? Number(form.trip) * Number(form.perTrip)
                  : ""
              }
              InputProps={{ readOnly: true }}
              helperText="Auto-calculated"
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
