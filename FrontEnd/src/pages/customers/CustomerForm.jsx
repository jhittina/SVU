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
import { addCustomer, updateCustomer } from "../../api/endpoints";

export default function CustomerForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    name: "",
    poNumber: "",
    contactNumber: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        poNumber: editData.poNumber || "",
        contactNumber: editData.contactNumber || "",
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateCustomer(editData._id, data) : addCustomer(data),
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
    mutation.mutate(form);
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
          <Grid size={12}>
            <TextField
              label="Customer Name"
              required
              fullWidth
              {...f("name")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="PO Number" fullWidth {...f("poNumber")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Contact Number"
              required
              fullWidth
              {...f("contactNumber")}
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
