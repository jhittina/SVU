import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CrudPage from "../../components/CrudPage";
import { getSuppliers, deleteSupplier } from "../../api/endpoints";
import SupplierForm from "./SupplierForm";
import PaymentManager from "../../components/PaymentManager";
import BusinessIcon from "@mui/icons-material/Business";

const columns = [
  { key: "name", label: "Name" },
  { key: "matirialType", label: "Material Type" },
  {
    key: "address",
    label: "Address",
    render: (r) =>
      Array.isArray(r.address) ? r.address[0] || "—" : r.address || "—",
  },
  {
    key: "price",
    label: "Price (₹)",
    render: (r) => r.price?.toLocaleString(),
  },
  { key: "conatctNumber", label: "Contact" },
];

export default function Suppliers() {
  const [paymentTarget, setPaymentTarget] = useState(null);

  return (
    <>
      <CrudPage
        title="Suppliers"
        icon={<BusinessIcon />}
        queryKey="suppliers"
        fetchFn={getSuppliers}
        deleteFn={deleteSupplier}
        columns={columns}
        FormComponent={SupplierForm}
        rowActions={(row) => (
          <Tooltip title="Payments">
            <IconButton
              size="small"
              onClick={() => setPaymentTarget(row)}
              sx={{
                bgcolor: "rgba(16,185,129,0.15)",
                color: "#10b981",
                "&:hover": {
                  bgcolor: "rgba(16,185,129,0.25)",
                  transform: "scale(1.1)",
                },
                width: 28,
                height: 28,
                transition: "all 0.2s ease",
              }}
            >
              <PaymentIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      />
      <PaymentManager
        type="supplier"
        referenceId={paymentTarget?._id}
        referenceName={paymentTarget?.name}
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
      />
    </>
  );
}
