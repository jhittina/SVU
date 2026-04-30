import CrudPage from "../../components/CrudPage";
import { getCementRaws, deleteCementRaw } from "../../api/endpoints";
import CementRawForm from "./CementRawForm";
import InventoryIcon from "@mui/icons-material/Inventory";
import dayjs from "dayjs";

const columns = [
  {
    key: "date",
    label: "Date",
    render: (r) => dayjs(r.date).format("DD/MM/YYYY"),
  },
  { key: "name", label: "Supplier" },
  { key: "vehicalNumber", label: "Vehicle No." },
  { key: "quantity", label: "Qty (Bags)" },
  {
    key: "pricePerBag",
    label: "Price/Bag (₹)",
    render: (r) => r.pricePerBag?.toLocaleString(),
  },
  { key: "numberOfTon", label: "Tons" },
  {
    key: "amount",
    label: "Amount (₹)",
    render: (r) => r.amount?.toLocaleString(),
  },
];

export default function CementRaw() {
  return (
    <CrudPage
      title="Cement Raw Material"
      icon={<InventoryIcon />}
      queryKey="cementRaw"
      fetchFn={getCementRaws}
      deleteFn={deleteCementRaw}
      columns={columns}
      FormComponent={CementRawForm}
      summaryFn={(res) => [
        { label: "Total Bags", value: res?.bagSum?.toLocaleString() ?? 0 },
        { label: "Total Tons", value: res?.tonSum?.toLocaleString() ?? 0 },
        {
          label: "Total Amount (₹)",
          value: res?.amount?.toLocaleString() ?? 0,
        },
      ]}
    />
  );
}
