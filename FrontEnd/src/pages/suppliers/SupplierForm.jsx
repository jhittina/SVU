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
import { addSupplier, updateSupplier } from "../../api/endpoints";

const MATERIAL_TYPES = [
  "Cement",
  "Fly Ash",
  "Pond Ash",
  "Dust & Powder",
  "Chemical",
  "Other",
];

export default function SupplierForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    name: "",
    address: "",
    matirialType: "",
    poNumber: "",
    price: "",
    conatctNumber: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        address: Array.isArray(editData.address)
          ? editData.address[0] || ""
          : editData.address || "",
        matirialType: editData.matirialType || "",
        poNumber: editData.poNumber || "",
        price: String(editData.price || ""),
        conatctNumber: editData.conatctNumber || "",
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateSupplier(editData._id, data) : addSupplier(data),
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
      price: Number(form.price),
      address: [form.address],
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
            <TextField
              label="Supplier Name"
              required
              fullWidth
              {...f("name")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Contact Number"
              required
              fullWidth
              {...f("conatctNumber")}
            />
          </Grid>
          <Grid size={12}>
            <TextField label="Address" required fullWidth {...f("address")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Material Type"
              required
              fullWidth
              {...f("matirialType")}
            >
              {MATERIAL_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="PO Number" fullWidth {...f("poNumber")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price (₹)"
              type="number"
              required
              fullWidth
              {...f("price")}
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
