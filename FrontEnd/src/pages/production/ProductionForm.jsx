import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Autocomplete,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { addProduction, updateProduction } from "../../api/endpoints";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";
import { getBrickTypes, saveBrickType } from "../../utils/brickTypes";

export default function ProductionForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({ date: "", type: "", quantity: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        date: dayjs(editData.date).format("YYYY-MM-DD"),
        type: editData.type || "",
        quantity: String(editData.quantity || ""),
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateProduction(editData._id, data) : addProduction(data),
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
    mutation.mutate({ ...form, quantity: Number(form.quantity) });
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
            <DateInput
              label="Date"
              value={form.date}
              onChange={(val) => setForm({ ...form, date: val })}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              freeSolo
              options={getBrickTypes()}
              value={form.type}
              onChange={(_, val) => {
                if (val) {
                  saveBrickType(val);
                  setForm({ ...form, type: val });
                }
              }}
              onInputChange={(_, val) => setForm({ ...form, type: val })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Brick Type"
                  required
                  fullWidth
                  helperText="Select existing or type new to create"
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Quantity (pieces)"
              type="number"
              required
              fullWidth
              inputProps={{ min: 1 }}
              {...f("quantity")}
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
