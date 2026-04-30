import { useState, useEffect } from "react";
import {
  Box,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  Divider,
  Autocomplete,
  Stack,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addChallan,
  updateChallan,
  getCustomers,
  getVehicles,
  downloadChallanPdf,
  getStock,
} from "../../api/endpoints";
import { getBrickTypes, saveBrickType } from "../../utils/brickTypes";
import dayjs from "dayjs";
import DateInput from "../../components/DateInput";

const emptyItem = { brickName: "", quantity: "", rate: "" };

// Returns the price effective on a given date from priceHistory
const getPriceForDate = (addrObj, date) => {
  const history = addrObj?.priceHistory || [];
  if (!history.length) return addrObj?.price ?? "";
  const d = new Date(date);
  const applicable = [...history]
    .filter((h) => new Date(h.effectiveDate) <= d)
    .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
  return applicable[0]?.price ?? addrObj?.price ?? "";
};

export default function ChallanForm({ editData, onClose, onSuccess }) {
  const isEdit = Boolean(editData);

  const [form, setForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    customerName: "",
    address: "",
    poNumber: "",
    vehicleNumber: "",
  });
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBrickType, setSelectedBrickType] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const { data: customersRes } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await getCustomers()).data,
  });
  const { data: vehiclesRes } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => (await getVehicles()).data,
  });
  const { data: stockRes } = useQuery({
    queryKey: ["stock"],
    queryFn: async () => (await getStock()).data,
  });

  const customers = customersRes?.data || [];
  const vehicles = vehiclesRes?.data || [];
  // Map: { brickType -> availableQty }
  const stockMap = Object.fromEntries(
    (stockRes?.data || []).map((s) => [s.brickType, s.available]),
  );

  useEffect(() => {
    if (editData) {
      const cust =
        customers.find((c) => c.name === editData.customerName) || null;
      setSelectedCustomer(cust);
      const addr =
        cust?.address?.find((a) => a.address === editData.address) || null;
      setSelectedAddress(addr);
      setSelectedBrickType(addr?.brickType || null);
      setForm({
        date: dayjs(editData.date).format("YYYY-MM-DD"),
        customerName: editData.customerName || "",
        address: editData.address || "",
        poNumber: editData.poNumber || "",
        vehicleNumber: editData.vehicleNumber || "",
      });
      setItems(
        (editData.saleDetail || []).map((i) => ({
          brickName: i.brickName,
          quantity: String(i.quantity),
          rate: String(i.rate),
        })),
      );
    }
  }, [editData]);

  // Re-compute rate when challan date changes (price may differ by effective date)
  useEffect(() => {
    if (selectedAddress && form.date) {
      const price = getPriceForDate(selectedAddress, form.date);
      if (price !== "") {
        setItems((prev) =>
          prev.map((item) => ({ ...item, rate: String(price) })),
        );
      }
    }
  }, [form.date]);

  const buildPayload = (status) => ({
    ...form,
    status,
    saleDetail: items.map((item) => ({
      brickName: item.brickName,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.quantity) * Number(item.rate),
    })),
  });

  const saveMutation = useMutation({
    mutationFn: (status) =>
      isEdit
        ? updateChallan(editData._id, buildPayload(status))
        : addChallan(buildPayload(status)),
    onSuccess: (res, status) => {
      const challan = res.data?.data;
      if (status === "confirmed" && challan?._id) {
        downloadChallanPdf(challan._id).then((pdfRes) => {
          const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `challan-${challan._id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        });
      }
      onSuccess?.(challan);
    },
    onError: (e) =>
      setError(
        e?.response?.data?.Message ||
          e?.response?.data?.message ||
          "Failed to save",
      ),
  });

  const handleSubmit = (e, status) => {
    e.preventDefault();
    setError("");

    // Stock validation for confirmed challans
    if (status === "confirmed") {
      for (const item of items) {
        if (!item.brickName || !item.quantity) continue;
        const available = stockMap[item.brickName];
        if (available === undefined) continue; // no production record, allow
        const qty = Number(item.quantity);
        // For edits: add back the original qty for this brick type
        const origQty = isEdit
          ? (editData.saleDetail || [])
              .filter((s) => s.brickName === item.brickName)
              .reduce((sum, s) => sum + s.quantity, 0)
          : 0;
        if (qty > available + origQty) {
          setError(
            `Insufficient stock for "${item.brickName}". Available: ${
              available + origQty
            } pcs, Requested: ${qty} pcs.`,
          );
          return;
        }
      }
    }

    items.forEach((item) => saveBrickType(item.brickName));
    saveMutation.mutate(status);
  };

  const updateItem = (idx, key, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const total = items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.rate || 0),
    0,
  );

  return (
    <form>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ── Header Fields ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mb: 2,
          }}
        >
          <DateInput
            label="Date"
            value={form.date}
            onChange={(val) => setForm({ ...form, date: val })}
          />
          <Autocomplete
            freeSolo
            options={customers.map((c) => c.name)}
            value={form.customerName}
            onChange={(_, val) => {
              const customer = customers.find((c) => c.name === val) || null;
              setSelectedCustomer(customer);
              setSelectedBrickType(null);
              setSelectedAddress(null);
              setForm({
                ...form,
                customerName: val || "",
                address: "",
                poNumber: customer?.poNumber || "",
              });
              setItems([{ ...emptyItem }]);
            }}
            onInputChange={(_, val) => {
              if (!val) {
                setSelectedCustomer(null);
                setSelectedBrickType(null);
                setSelectedAddress(null);
              }
              setForm({ ...form, customerName: val });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Customer Name" required fullWidth />
            )}
          />
          {/* Step 2: Brick Type — unique types from this customer's addresses */}
          <Autocomplete
            disabled={!selectedCustomer}
            options={[
              ...new Set(
                (selectedCustomer?.address || [])
                  .map((a) => a.brickType)
                  .filter(Boolean),
              ),
            ]}
            value={selectedBrickType}
            onChange={(_, val) => {
              setSelectedBrickType(val);
              setSelectedAddress(null);
              setForm({ ...form, address: "" });
              // Auto-fill sale item brick name
              if (val) {
                setItems((prev) =>
                  prev.map((item, i) =>
                    i === 0 ? { ...item, brickName: val, rate: "" } : item,
                  ),
                );
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Brick Type"
                required
                fullWidth
                placeholder={
                  selectedCustomer
                    ? "Select brick type"
                    : "Select a customer first"
                }
              />
            )}
          />
          {/* Step 3: Delivery Address — filtered by selected brick type */}
          <Autocomplete
            disabled={!selectedBrickType}
            options={(selectedCustomer?.address || []).filter(
              (a) => a.brickType === selectedBrickType,
            )}
            getOptionLabel={(opt) =>
              typeof opt === "string" ? opt : opt.address || ""
            }
            value={selectedAddress}
            onChange={(_, val) => {
              setSelectedAddress(val);
              const addrStr =
                typeof val === "string" ? val : val?.address || "";
              const price = val ? getPriceForDate(val, form.date) : "";
              setForm({ ...form, address: addrStr });
              // Auto-fill rate in all sale items based on effective date
              if (price !== "") {
                setItems((prev) =>
                  prev.map((item) => ({
                    ...item,
                    rate: String(price),
                  })),
                );
              }
            }}
            renderOption={(props, opt) => {
              const effectivePrice = getPriceForDate(opt, form.date);
              return (
                <li {...props} key={opt.address}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {opt.address}
                    </Typography>
                    {effectivePrice !== "" ? (
                      <Typography variant="caption" color="text.secondary">
                        Rate: ₹{effectivePrice} (on{" "}
                        {new Date(form.date).toLocaleDateString("en-IN")})
                      </Typography>
                    ) : null}
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => {
              const effectivePrice = selectedAddress
                ? getPriceForDate(selectedAddress, form.date)
                : "";
              const applicableEntry = selectedAddress?.priceHistory
                ? [...selectedAddress.priceHistory]
                    .filter(
                      (h) => new Date(h.effectiveDate) <= new Date(form.date),
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.effectiveDate) - new Date(a.effectiveDate),
                    )[0]
                : null;
              return (
                <TextField
                  {...params}
                  label="Delivery Address"
                  required
                  fullWidth
                  placeholder={
                    selectedBrickType
                      ? "Select address"
                      : "Select brick type first"
                  }
                  helperText={
                    effectivePrice !== ""
                      ? `Rate: ₹${effectivePrice}${applicableEntry ? ` (effective ${new Date(applicableEntry.effectiveDate).toLocaleDateString("en-IN")})` : ""}`
                      : undefined
                  }
                />
              );
            }}
          />
          <TextField
            label="PO Number"
            fullWidth
            value={form.poNumber}
            onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
          />
          <Autocomplete
            freeSolo
            options={vehicles.map((v) => v.vehicleNumber)}
            value={form.vehicleNumber}
            onChange={(_, val) =>
              setForm({ ...form, vehicleNumber: val || "" })
            }
            onInputChange={(_, val) => setForm({ ...form, vehicleNumber: val })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Vehicle Number"
                required
                fullWidth
              />
            )}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* ── Sale Items ── */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="#1a237e">
            Sale Items
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setItems([...items, { ...emptyItem }])}
            sx={{ fontWeight: 600 }}
          >
            Add Item
          </Button>
        </Stack>

        {/* Table-style header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
            gap: 1,
            mb: 0.5,
            px: 0.5,
          }}
        >
          {["Brick Name", "Qty", "Rate (₹)", "Amount (₹)", ""].map((h) => (
            <Typography
              key={h}
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ textTransform: "uppercase" }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {items.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
              gap: 1,
              mb: 1,
              alignItems: "center",
            }}
          >
            <Autocomplete
              freeSolo
              options={getBrickTypes()}
              value={item.brickName}
              onChange={(_, val) => updateItem(idx, "brickName", val || "")}
              onInputChange={(_, val) => updateItem(idx, "brickName", val)}
              renderInput={(params) => {
                const avail = stockMap[item.brickName];
                const qty = Number(item.quantity || 0);
                const overStock = avail !== undefined && qty > avail;
                return (
                  <TextField
                    {...params}
                    size="small"
                    required
                    placeholder="Brick Name"
                    error={overStock}
                    helperText={
                      item.brickName && avail !== undefined
                        ? overStock
                          ? `Only ${avail} pcs available`
                          : `Stock: ${avail} pcs`
                        : undefined
                    }
                  />
                );
              }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Qty"
              required
              value={item.quantity}
              onChange={(e) => updateItem(idx, "quantity", e.target.value)}
              inputProps={{ min: 1 }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Rate"
              required
              value={item.rate}
              onChange={(e) => updateItem(idx, "rate", e.target.value)}
              inputProps={{ min: 0 }}
            />
            <TextField
              size="small"
              value={
                item.quantity && item.rate
                  ? (Number(item.quantity) * Number(item.rate)).toLocaleString()
                  : "—"
              }
              slotProps={{ input: { readOnly: true } }}
              sx={{ "& input": { color: "#22c55e", fontWeight: 600 } }}
            />
            <IconButton
              size="small"
              color="error"
              disabled={items.length === 1}
              onClick={() => setItems(items.filter((_, i) => i !== idx))}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: 2,
            textAlign: "right",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="#8b5cf6">
            Total Amount: ₹{total.toLocaleString()}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="outlined"
          color="primary"
          disabled={saveMutation.isPending}
          onClick={(e) => handleSubmit(e, "draft")}
          sx={{ fontWeight: 600 }}
        >
          {saveMutation.isPending && saveMutation.variables === "draft" ? (
            <CircularProgress size={18} />
          ) : (
            "Save as Draft"
          )}
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={saveMutation.isPending}
          onClick={(e) => handleSubmit(e, "confirmed")}
          sx={{ bgcolor: "#ff6b35", fontWeight: 600 }}
        >
          {saveMutation.isPending && saveMutation.variables === "confirmed" ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            "Confirm & Download PDF"
          )}
        </Button>
      </DialogActions>
    </form>
  );
}
