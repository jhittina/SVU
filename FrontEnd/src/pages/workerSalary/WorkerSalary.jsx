import { useState } from "react";
import { Button } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CrudPage from "../../components/CrudPage";
import { getWorkerSalaries, deleteWorkerSalary } from "../../api/endpoints";
import WorkerSalaryForm from "./WorkerSalaryForm";
import PaymentManager from "../../components/PaymentManager";
import GroupsIcon from "@mui/icons-material/Groups";
import dayjs from "dayjs";

const columns = [
  {
    key: "date",
    label: "Date",
    render: (r) => dayjs(r.date).format("DD/MM/YYYY"),
  },
  { key: "typeOfBrick", label: "Brick Type" },
  {
    key: "noOfPlates",
    label: "No. of Plates",
    render: (r) => r.noOfPlates?.toLocaleString(),
  },
  {
    key: "pricePerPlate",
    label: "Price/Plate (₹)",
    render: (r) => r.pricePerPlate?.toLocaleString(),
  },
  {
    key: "amount",
    label: "Amount (₹)",
    render: (r) => r.amount?.toLocaleString(),
  },
];

export default function WorkerSalary() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <>
      <CrudPage
        title="Worker Salary"
        icon={<GroupsIcon />}
        queryKey="workerSalaries"
        fetchFn={getWorkerSalaries}
        deleteFn={deleteWorkerSalary}
        columns={columns}
        FormComponent={WorkerSalaryForm}
        summaryFn={(res) => [
          {
            label: "Total Plates",
            value: res?.totalPlate?.toLocaleString() ?? 0,
          },
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
        type="worker"
        referenceId="all"
        referenceName="Worker Salary"
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
    </>
  );
}
