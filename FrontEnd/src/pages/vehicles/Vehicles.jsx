import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CrudPage from "../../components/CrudPage";
import { getVehicles, deleteVehicle } from "../../api/endpoints";
import VehicleForm from "./VehicleForm";
import PaymentManager from "../../components/PaymentManager";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const columns = [
  { key: "name", label: "Owner Name" },
  { key: "vehicleType", label: "Type" },
  { key: "vehicleNumber", label: "Vehicle No." },
  {
    key: "price",
    label: "Rate/Trip (₹)",
    render: (r) => r.price?.toLocaleString(),
  },
  { key: "contactNumber", label: "Contact" },
];

export default function Vehicles() {
  const [paymentTarget, setPaymentTarget] = useState(null);

  return (
    <>
      <CrudPage
        title="Vehicles"
        icon={<LocalShippingIcon />}
        queryKey="vehicles"
        fetchFn={getVehicles}
        deleteFn={deleteVehicle}
        columns={columns}
        FormComponent={VehicleForm}
        rowActions={(row) => (
          <Tooltip title="Payments">
            <IconButton
              size="small"
              onClick={() => setPaymentTarget(row)}
              sx={{
                bgcolor: "rgba(16,185,129,0.2)",
                color: "#10b981",
                "&:hover": {
                  bgcolor: "rgba(16,185,129,0.3)",
                  transform: "scale(1.1)",
                },
                width: 28,
                height: 28,
              }}
            >
              <PaymentIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      />
      <PaymentManager
        type="vehicle"
        referenceId={paymentTarget?.vehicleNumber || ""}
        referenceName={paymentTarget?.vehicleNumber || ""}
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
      />
    </>
  );
}
