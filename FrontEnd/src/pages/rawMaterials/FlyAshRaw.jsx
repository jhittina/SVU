import CrudPage from "../../components/CrudPage";
import { getFlyAshRaws, deleteFlyAshRaw } from "../../api/endpoints";
import FlyAshRawForm from "./FlyAshRawForm";
import GrainIcon from "@mui/icons-material/Grain";
import dayjs from "dayjs";

const columns = [
  {
    key: "date",
    label: "Date",
    render: (r) => dayjs(r.date).format("DD/MM/YYYY"),
  },
  { key: "name", label: "Supplier" },
  { key: "vehicalNumber", label: "Vehicle No." },
  { key: "numberOfTon", label: "Tons" },
  {
    key: "pricePerTon",
    label: "Price/Ton (₹)",
    render: (r) => r.pricePerTon?.toLocaleString(),
  },
  {
    key: "amount",
    label: "Amount (₹)",
    render: (r) => r.amount?.toLocaleString(),
  },
];

export default function FlyAshRaw() {
  return (
    <CrudPage
      title="Fly Ash Raw Material"
      icon={<GrainIcon />}
      queryKey="flyAshRaw"
      fetchFn={getFlyAshRaws}
      deleteFn={deleteFlyAshRaw}
      columns={columns}
      FormComponent={FlyAshRawForm}
      summaryFn={(res) => [
        {
          label: "Total Amount (₹)",
          value: res?.amount?.toLocaleString() ?? 0,
        },
      ]}
    />
  );
}
