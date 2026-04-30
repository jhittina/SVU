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
import { addCementRaw, updateCementRaw } from "../../api/endpoints";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";

export default function CementRawForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    date: "",
    name: "",
    vehicalNumber: "",
    quantity: "",
    pricePerBag: "",
    transportCharge: "",
    numberOfTon: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        date: dayjs(editData.date).format("YYYY-MM-DD"),
        name: editData.name || "",
        vehicalNumber: editData.vehicalNumber || "",
        quantity: String(editData.quantity || ""),
        pricePerBag: String(editData.pricePerBag || ""),
        transportCharge: String(editData.transportCharge || ""),
        numberOfTon: String(editData.numberOfTon || ""),
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateCementRaw(editData._id, data) : addCementRaw(data),
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
    // amount auto-calculated by backend: pricePerBag * quantity + transportCharge
    mutation.mutate({
      ...form,
      quantity: Number(form.quantity),
      pricePerBag: Number(form.pricePerBag),
      transportCharge: Number(form.transportCharge),
      numberOfTon: Number(form.numberOfTon),
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
              label="Quantity (Bags)"
              type="number"
              required
              fullWidth
              {...f("quantity")}
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
              label="Price Per Bag (₹)"
              type="number"
              required
              fullWidth
              {...f("pricePerBag")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Transport Charge (₹)"
              type="number"
              required
              fullWidth
              {...f("transportCharge")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Amount (₹)"
              type="number"
              fullWidth
              value={
                form.quantity && form.pricePerBag
                  ? Number(form.quantity) * Number(form.pricePerBag) +
                    Number(form.transportCharge || 0)
                  : ""
              }
              InputProps={{ readOnly: true }}
              helperText="Auto-calculated by server"
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
