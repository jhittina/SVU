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
import { addVehicle, updateVehicle } from "../../api/endpoints";

const VEHICLE_TYPES = ["Truck", "Tractor", "Mini Truck", "JCB", "Other"];

export default function VehicleForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    name: "",
    address: "",
    vehicleType: "",
    vehicleNumber: "",
    price: "",
    contactNumber: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        address: editData.address || "",
        vehicleType: editData.vehicleType || "",
        vehicleNumber: editData.vehicleNumber || "",
        price: String(editData.price || ""),
        contactNumber: editData.contactNumber || "",
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateVehicle(editData._id, data) : addVehicle(data),
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
    mutation.mutate({ ...form, price: Number(form.price) });
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
            <TextField label="Owner Name" required fullWidth {...f("name")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Contact Number"
              required
              fullWidth
              {...f("contactNumber")}
            />
          </Grid>
          <Grid size={12}>
            <TextField label="Address" fullWidth {...f("address")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Vehicle Type"
              required
              fullWidth
              {...f("vehicleType")}
            >
              {VEHICLE_TYPES.map((t) => (
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
              {...f("vehicleNumber")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Rate Per Trip (₹)"
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
