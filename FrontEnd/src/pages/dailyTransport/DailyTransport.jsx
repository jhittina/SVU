import CrudPage from "../../components/CrudPage";
import { getDailyTransports, deleteDailyTransport } from "../../api/endpoints";
import DailyTransportForm from "./DailyTransportForm";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import dayjs from "dayjs";

const columns = [
  {
    key: "date",
    label: "Date",
    render: (r) => dayjs(r.date).format("DD/MM/YYYY"),
  },
  { key: "type", label: "Type" },
  { key: "vehicalNumber", label: "Vehicle No." },
  { key: "trip", label: "Trips" },
  {
    key: "perTrip",
    label: "Per Trip (₹)",
    render: (r) => r.perTrip?.toLocaleString(),
  },
  {
    key: "amount",
    label: "Amount (₹)",
    render: (r) => r.amount?.toLocaleString(),
  },
];

export default function DailyTransport() {
  return (
    <CrudPage
      title="Daily Transport"
      icon={<DirectionsCarIcon />}
      queryKey="dailyTransports"
      fetchFn={getDailyTransports}
      deleteFn={deleteDailyTransport}
      columns={columns}
      FormComponent={DailyTransportForm}
      summaryFn={(res) => [
        {
          label: "Total Amount (₹)",
          value: res?.totaldailyTransportDetail?.toLocaleString() ?? 0,
        },
      ]}
    />
  );
}
