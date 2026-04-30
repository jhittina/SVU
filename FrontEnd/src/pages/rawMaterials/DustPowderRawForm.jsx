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
import { addDustPowderRaw, updateDustPowderRaw } from "../../api/endpoints";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";

const UNIT_TYPES = ["kg", "ton", "bag", "litre"];
const RAW_TYPES = ["Dust", "Powder", "Mixed"];

export default function DustPowderRawForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    Date: "",
    name: "",
    vehicalNumber: "",
    quantity: "",
    quantityUnit: "",
    rawMatirialType: "",
    pricePerQuantity: "",
    amount: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        Date: dayjs(editData.Date || editData.date).format("YYYY-MM-DD"),
        name: editData.name || "",
        vehicalNumber: editData.vehicalNumber || "",
        quantity: String(editData.quantity || ""),
        quantityUnit: editData.quantityUnit || "",
        rawMatirialType: editData.rawMatirialType || "",
        pricePerQuantity: String(editData.pricePerQuantity || ""),
        amount: String(editData.amount || ""),
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateDustPowderRaw(editData._id, data) : addDustPowderRaw(data),
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
      quantity: Number(form.quantity),
      pricePerQuantity: Number(form.pricePerQuantity),
      amount: Number(form.amount),
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
              value={form.Date}
              onChange={(val) => setForm({ ...form, Date: val })}
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
              label="Quantity"
              type="number"
              required
              fullWidth
              {...f("quantity")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Quantity Unit"
              required
              fullWidth
              {...f("quantityUnit")}
            >
              {UNIT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Raw Material Type"
              required
              fullWidth
              {...f("rawMatirialType")}
            >
              {RAW_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price Per Unit (₹)"
              type="number"
              required
              fullWidth
              {...f("pricePerQuantity")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Amount (₹)"
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
