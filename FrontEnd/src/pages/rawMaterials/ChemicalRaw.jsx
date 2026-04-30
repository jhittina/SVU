import CrudPage from "../../components/CrudPage";
import { getChemicalRaws, deleteChemicalRaw } from "../../api/endpoints";
import ChemicalRawForm from "./ChemicalRawForm";
import ScienceIcon from "@mui/icons-material/Science";
import dayjs from "dayjs";

const columns = [
  {
    key: "date",
    label: "Date",
    render: (r) => dayjs(r.date).format("DD/MM/YYYY"),
  },
  { key: "name", label: "Chemical Name" },
  { key: "noLiter", label: "Liters" },
  {
    key: "pricePerLiter",
    label: "Price/Liter (₹)",
    render: (r) => r.pricePerLiter?.toLocaleString(),
  },
  {
    key: "transportCharge",
    label: "Transport (₹)",
    render: (r) => r.transportCharge?.toLocaleString(),
  },
  {
    key: "gstAmount",
    label: "GST (₹)",
    render: (r) => r.gstAmount?.toLocaleString(),
  },
  {
    key: "amount",
    label: "Amount (₹)",
    render: (r) => r.amount?.toLocaleString(),
  },
];

export default function ChemicalRaw() {
  return (
    <CrudPage
      title="Chemical Raw Material"
      icon={<ScienceIcon />}
      queryKey="chemicalRaw"
      fetchFn={getChemicalRaws}
      deleteFn={deleteChemicalRaw}
      columns={columns}
      FormComponent={ChemicalRawForm}
      summaryFn={(res) => [
        {
          label: "Total Amount (₹)",
          value: res?.amount?.toLocaleString() ?? 0,
        },
      ]}
    />
  );
}
