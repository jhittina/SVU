import CrudPage from "../../components/CrudPage";
import { getProductions, deleteProduction } from "../../api/endpoints";
import ProductionForm from "./ProductionForm";
import BrickTypeManager from "../../components/BrickTypeManager";
import FactoryIcon from "@mui/icons-material/Factory";
import dayjs from "dayjs";

const columns = [
  {
    key: "date",
    label: "Date",
    render: (r) => dayjs(r.date).format("DD/MM/YYYY"),
  },
  { key: "type", label: "Brick Type" },
  {
    key: "quantity",
    label: "Quantity",
    render: (r) => r.quantity?.toLocaleString() ?? "—",
  },
];

export default function Production() {
  return (
    <CrudPage
      title="Production"
      icon={<FactoryIcon />}
      queryKey="productions"
      fetchFn={getProductions}
      deleteFn={deleteProduction}
      columns={columns}
      FormComponent={ProductionForm}
      extraActions={<BrickTypeManager />}
      summaryFn={(res) => [
        {
          label: "Total Production",
          value: res?.totalProduction?.toLocaleString() ?? 0,
        },
      ]}
    />
  );
}
