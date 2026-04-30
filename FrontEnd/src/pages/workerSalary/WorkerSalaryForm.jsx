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
import { addWorkerSalary, updateWorkerSalary } from "../../api/endpoints";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";
import { getBrickTypes, saveBrickType } from "../../utils/brickTypes";

export default function WorkerSalaryForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);
  const [form, setForm] = useState({
    date: "",
    typeOfBrick: "",
    noOfPlates: "",
    pricePerPlate: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        date: dayjs(editData.date).format("YYYY-MM-DD"),
        typeOfBrick: editData.typeOfBrick || "",
        noOfPlates: String(editData.noOfPlates || ""),
        pricePerPlate: String(editData.pricePerPlate || ""),
      });
    }
  }, [editData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateWorkerSalary(editData._id, data) : addWorkerSalary(data),
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
    // amount auto-calculated by backend: noOfPlates * pricePerPlate
    mutation.mutate({
      ...form,
      noOfPlates: Number(form.noOfPlates),
      pricePerPlate: Number(form.pricePerPlate),
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
            <Autocomplete
              freeSolo
              options={getBrickTypes()}
              value={form.typeOfBrick}
              onChange={(_, val) => {
                if (val) {
                  saveBrickType(val);
                  setForm({ ...form, typeOfBrick: val });
                }
              }}
              onInputChange={(_, val) => setForm({ ...form, typeOfBrick: val })}
              renderInput={(params) => (
                <TextField {...params} label="Brick Type" required fullWidth />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="No. of Plates"
              type="number"
              required
              fullWidth
              inputProps={{ min: 1 }}
              {...f("noOfPlates")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price Per Plate (₹)"
              type="number"
              required
              fullWidth
              {...f("pricePerPlate")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Amount (₹)"
              type="number"
              fullWidth
              value={
                form.noOfPlates && form.pricePerPlate
                  ? Number(form.noOfPlates) * Number(form.pricePerPlate)
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
