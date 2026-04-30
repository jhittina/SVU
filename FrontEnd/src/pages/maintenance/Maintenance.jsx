import { useState } from "react";
import { Button } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CrudPage from "../../components/CrudPage";
import { getMaintenances, deleteMaintenance } from "../../api/endpoints";
import MaintenanceForm from "./MaintenanceForm";
import PaymentManager from "../../components/PaymentManager";
import BuildIcon from "@mui/icons-material/Build";
import dayjs from "dayjs";

const columns = [
  {
    key: "date",
    label: "Date",
    render: (r) => dayjs(r.date).format("DD/MM/YYYY"),
  },
  { key: "type", label: "Type" },
  { key: "Resion", label: "Reason" },
  {
    key: "amount",
    label: "Amount (₹)",
    render: (r) => r.amount?.toLocaleString(),
  },
];

export default function Maintenance() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <>
      <CrudPage
        title="Maintenance Cost"
        icon={<BuildIcon />}
        queryKey="maintenances"
        fetchFn={getMaintenances}
        deleteFn={deleteMaintenance}
        columns={columns}
        FormComponent={MaintenanceForm}
        summaryFn={(res) => [
          {
            label: "Total Amount (₹)",
            value: res?.totalAmount?.toLocaleString() ?? 0,
          },
        ]}
        extraActions={
          <Button
            variant="outlined"
            startIcon={<PaymentIcon />}
            onClick={() => setPaymentOpen(true)}
            sx={{
              borderColor: "rgba(16,185,129,0.5)",
              color: "#10b981",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#10b981",
                bgcolor: "rgba(16,185,129,0.1)",
              },
            }}
          >
            Payments
          </Button>
        }
      />
      <PaymentManager
        type="maintenance"
        referenceId="all"
        referenceName="Maintenance"
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
    </>
  );
}
