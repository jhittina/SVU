import CrudPage from "../../components/CrudPage";
import { getPondAshRaws, deletePondAshRaw } from "../../api/endpoints";
import PondAshRawForm from "./PondAshRawForm";
import WaterIcon from "@mui/icons-material/Water";
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
    key: "amount",
    label: "Amount (₹)",
    render: (r) => r.amount?.toLocaleString(),
  },
];

export default function PondAshRaw() {
  return (
    <CrudPage
      title="Pond Ash Raw Material"
      icon={<WaterIcon />}
      queryKey="pondAshRaw"
      fetchFn={getPondAshRaws}
      deleteFn={deletePondAshRaw}
      columns={columns}
      FormComponent={PondAshRawForm}
      summaryFn={(res) => [
        {
          label: "Total Amount (₹)",
          value: res?.amount?.toLocaleString() ?? 0,
        },
      ]}
    />
  );
}
