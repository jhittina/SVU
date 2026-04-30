import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { addFlyAshRaw, updateFlyAshRaw } from "../../api/endpoints";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";

export default function FlyAshRawForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    date: "",
    name: "",
    vehicalNumber: "",
    numberOfTon: "",
    pricePerTon: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        date: dayjs(editData.date).format("YYYY-MM-DD"),
        name: editData.name || "",
        vehicalNumber: editData.vehicalNumber || "",
        numberOfTon: String(editData.numberOfTon || ""),
        pricePerTon: String(editData.pricePerTon || ""),
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateFlyAshRaw(editData._id, data) : addFlyAshRaw(data),
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
    mutation.mutate({
      ...form,
      numberOfTon: Number(form.numberOfTon),
      pricePerTon: Number(form.pricePerTon),
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
            <TextField
              label="Supplier Name"
              required
              fullWidth
              {...f("name")}
            />
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
              label="No. of Tons"
              type="number"
              required
              fullWidth
              {...f("numberOfTon")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price Per Ton (₹)"
              type="number"
              required
              fullWidth
              {...f("pricePerTon")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Amount (₹)"
              type="number"
              fullWidth
              value={
                form.numberOfTon && form.pricePerTon
                  ? Number(form.numberOfTon) * Number(form.pricePerTon)
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
