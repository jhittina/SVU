import CrudPage from "../../components/CrudPage";
import { getDustPowderRaws, deleteDustPowderRaw } from "../../api/endpoints";
import DustPowderRawForm from "./DustPowderRawForm";
import SandIcon from "@mui/icons-material/Layers";
import dayjs from "dayjs";

const columns = [
  {
    key: "Date",
    label: "Date",
    render: (r) => dayjs(r.Date).format("DD/MM/YYYY"),
  },
  { key: "name", label: "Supplier" },
  { key: "vehicalNumber", label: "Vehicle No." },
  { key: "quantity", label: "Qty" },
  { key: "quantityUnit", label: "Unit" },
  { key: "rawMatirialType", label: "Type" },
  {
    key: "pricePerQuantity",
    label: "Price/Unit (₹)",
    render: (r) => r.pricePerQuantity?.toLocaleString(),
  },
  {
    key: "amount",
    label: "Amount (₹)",
    render: (r) => r.amount?.toLocaleString(),
  },
];

export default function DustPowderRaw() {
  return (
    <CrudPage
      title="Dust & Powder Raw Material"
      icon={<SandIcon />}
      queryKey="dustPowderRaw"
      fetchFn={getDustPowderRaws}
      deleteFn={deleteDustPowderRaw}
      columns={columns}
      FormComponent={DustPowderRawForm}
      summaryFn={(res) => [
        {
          label: "Total Amount (₹)",
          value: res?.amount?.toLocaleString() ?? 0,
        },
      ]}
    />
  );
}
