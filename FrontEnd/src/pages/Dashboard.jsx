import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import FactoryIcon from "@mui/icons-material/Factory";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import EngineeringIcon from "@mui/icons-material/Engineering";
import BuildIcon from "@mui/icons-material/Build";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getDashboardData } from "../api/endpoints";
import dayjs from "dayjs";
import Loader from "../components/Loader";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const BRICK_COLORS = { "4 inch Bricks": "#ff6b35", "6 inch Bricks": "#8b5cf6" };
const PIE_COLORS = [
  "#ff6b35",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
];

const cardSx = {
  borderRadius: 3,
  bgcolor: "#1e293b",
  border: "1px solid rgba(139,92,246,0.2)",
  transition: "all 0.3s",
  "&:hover": {
    border: "1px solid rgba(139,92,246,0.4)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
};

function HeroCard({ label, value, sub, icon, color }) {
  return (
    <Card
      sx={{
        ...cardSx,
        borderLeft: `4px solid ${color}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ color, mb: 0.5, fontSize: { xs: "2rem", sm: "2.5rem" } }}
          >
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
          {sub && (
            <Chip
              icon={
                sub.startsWith("+") ? (
                  <TrendingUpIcon sx={{ fontSize: 14 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 14 }} />
                )
              }
              label={sub}
              size="small"
              sx={{
                mt: 1,
                bgcolor: sub.startsWith("+")
                  ? "rgba(16,185,129,0.2)"
                  : "rgba(239,68,68,0.2)",
                color: sub.startsWith("+") ? "#10b981" : "#ef4444",
                fontWeight: 600,
                fontSize: 12,
              }}
            />
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 24px ${color}50`,
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}

function MiniCard({ label, value, icon, color }) {
  return (
    <Card sx={{ ...cardSx, borderLeft: `4px solid ${color}`, height: "100%" }}>
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color, fontSize: { xs: "1.5rem", sm: "1.8rem" } }}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ fontSize: 12 }}
          >
            {label}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: `${color}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}

function InsightCard({ label, value, icon, color }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        bgcolor: "rgba(15,23,42,0.9)",
        border: `1px solid ${color}40`,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: `0 8px 30px ${color}30`,
          border: `1px solid ${color}70`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${color}, ${color}00)`,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          borderRadius: "50%",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
            border: `1px solid ${color}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 0.5,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "1.2rem", sm: "1.4rem" },
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(148,163,184,0.9)",
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography
      variant="h6"
      fontWeight={700}
      sx={{
        mb: 2,
        background: "linear-gradient(135deg, #ff6b35 0%, #8b5cf6 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </Typography>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const { data: res, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await getDashboardData()).data,
    refetchInterval: 60000,
  });

  const d = res?.data;

  if (isLoading) {
    return <Loader />;
  }

  const thisRevenue = d?.thisMonth?.totalRevenue || 0;
  const lastRevenue = d?.lastMonth?.totalRevenue || 0;
  const revenueChange = lastRevenue
    ? (((thisRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1)
    : null;

  const thisBricks = d?.thisMonth?.totalBricks || 0;
  const lastBricks = d?.lastMonth?.totalBricks || 0;
  const brickChange = lastBricks
    ? (((thisBricks - lastBricks) / lastBricks) * 100).toFixed(1)
    : null;

  const expenses = d?.expenses || {};
  const totals = d?.totals || {};

  const revenueChartData = (d?.monthlyRevenue || []).map((r) => ({
    month: MONTH_NAMES[r._id.month - 1],
    revenue: r.revenue,
  }));

  const pieData = (d?.salesByType || []).map((s) => ({
    name: s._id,
    value: s.totalQty,
  }));

  const stockData = (d?.stock || []).map((s) => ({
    name: s.brickType,
    available: s.available,
  }));

  const prodData = (d?.prodThisMonth || []).map((p) => ({
    name: p._id,
    qty: p.total,
  }));

  const expensePieData = [
    { name: "Raw Material", value: expenses.rawMaterial?.totalCost || 0 },
    { name: "Worker Salary", value: expenses.workerSalary?.total || 0 },
    { name: "Maintenance", value: expenses.maintenance?.total || 0 },
    { name: "Transport", value: expenses.transport?.total || 0 },
  ].filter((e) => e.value > 0);

  const totalExpensesThisMonth =
    (expenses.rawMaterial?.totalCost || 0) +
    (expenses.workerSalary?.total || 0) +
    (expenses.maintenance?.total || 0) +
    (expenses.transport?.total || 0);
  const profitThisMonth = thisRevenue - totalExpensesThisMonth;

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #ff6b35 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Business Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs().format("dddd, D MMMM YYYY")}
          </Typography>
        </Box>
        {revenueChange !== null && (
          <Chip
            icon={
              revenueChange > 0 ? (
                <TrendingUpIcon sx={{ fontSize: 16 }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 16 }} />
              )
            }
            label={`${revenueChange > 0 ? "+" : ""}${revenueChange}% MoM`}
            sx={{
              bgcolor:
                revenueChange > 0
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(239,68,68,0.15)",
              color: revenueChange > 0 ? "#10b981" : "#ef4444",
              fontWeight: 700,
              fontSize: 13,
              px: 1,
            }}
          />
        )}
      </Stack>

      {/* Hero Revenue Card */}
      <Box sx={{ mb: 2 }}>
        <HeroCard
          label="Total Revenue"
          value={`₹${totals.allTimeRevenue ? (totals.allTimeRevenue / 1000).toFixed(0) + "K" : "0"}`}
          sub={
            revenueChange !== null
              ? `${revenueChange > 0 ? "+" : ""}${revenueChange}%`
              : null
          }
          icon={<CurrencyRupeeIcon sx={{ fontSize: 28, color: "#fff" }} />}
          color="#10b981"
        />
      </Box>

      {/* Summary Mini Cards */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MiniCard
            label="Total Production"
            value={prodData
              .reduce((s, p) => s + p.qty, 0)
              .toLocaleString("en-IN")}
            icon={<FactoryIcon sx={{ color: "#ff6b35", fontSize: 22 }} />}
            color="#ff6b35"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MiniCard
            label="Bricks Sold"
            value={thisBricks.toLocaleString("en-IN")}
            icon={<InventoryIcon sx={{ color: "#8b5cf6", fontSize: 22 }} />}
            color="#8b5cf6"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MiniCard
            label="Total Challans"
            value={totals.confirmedChallans || 0}
            icon={<ReceiptLongIcon sx={{ color: "#ec4899", fontSize: 22 }} />}
            color="#ec4899"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MiniCard
            label="Total Customers"
            value={totals.customers || 0}
            icon={<PeopleIcon sx={{ color: "#10b981", fontSize: 22 }} />}
            color="#10b981"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          "& .MuiTab-root": {
            color: "#94a3b8",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "none",
          },
          "& .Mui-selected": { color: "#ff6b35" },
          "& .MuiTabs-indicator": { bgcolor: "#ff6b35" },
          borderBottom: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <Tab label="Overview" />
        <Tab label="Revenue" />
        <Tab label="Expenses" />
        <Tab label="Profit" />
      </Tabs>

      {/* Tab: Overview */}
      {tab === 0 && (
        <>
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <SectionTitle>Sales by Brick Type</SectionTitle>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) =>
                            `${name.split(" ")[0]}: ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {pieData.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={
                                BRICK_COLORS[entry.name] ||
                                PIE_COLORS[i % PIE_COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                        <RTooltip
                          formatter={(v, name) => [
                            v.toLocaleString("en-IN") + " pcs",
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <SectionTitle>Production This Month</SectionTitle>
                  {prodData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={prodData} barSize={40}>
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickFormatter={(v) => v.toLocaleString("en-IN")}
                        />
                        <RTooltip
                          formatter={(v) => [
                            v.toLocaleString("en-IN") + " pcs",
                            "Produced",
                          ]}
                          contentStyle={{
                            background: "#1e293b",
                            border: "1px solid rgba(139,92,246,0.3)",
                          }}
                        />
                        <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                          {prodData.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={
                                BRICK_COLORS[entry.name] ||
                                PIE_COLORS[i % PIE_COLORS.length]
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No production data
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Business Insights Row */}
          <Grid container spacing={2} mt={2} mb={3}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <InsightCard
                label="Vehicles"
                value={totals.vehicles || 0}
                icon={
                  <LocalShippingIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
                }
                color="#f59e0b"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <InsightCard
                label="Worker Salary"
                value={`₹${((expenses.workerSalary?.total || 0) / 1000).toFixed(0)}K`}
                icon={
                  <EngineeringIcon sx={{ color: "#3b82f6", fontSize: 24 }} />
                }
                color="#3b82f6"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <InsightCard
                label="Maintenance"
                value={`₹${((expenses.maintenance?.total || 0) / 1000).toFixed(0)}K`}
                icon={<BuildIcon sx={{ color: "#ef4444", fontSize: 24 }} />}
                color="#ef4444"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <InsightCard
                label="Raw Material"
                value={`₹${((expenses.rawMaterial?.totalCost || 0) / 1000).toFixed(0)}K`}
                icon={<InventoryIcon sx={{ color: "#8b5cf6", fontSize: 24 }} />}
                color="#8b5cf6"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <InsightCard
                label="Transport"
                value={`₹${((expenses.transport?.total || 0) / 1000).toFixed(0)}K`}
                icon={
                  <LocalShippingIcon sx={{ color: "#10b981", fontSize: 24 }} />
                }
                color="#10b981"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <InsightCard
                label="Trips"
                value={expenses.transport?.trips || 0}
                icon={
                  <LocalShippingIcon sx={{ color: "#ec4899", fontSize: 24 }} />
                }
                color="#ec4899"
              />
            </Grid>
          </Grid>

          {/* Stock Levels */}
          <Card sx={{ ...cardSx, mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionTitle>Current Stock Levels</SectionTitle>
              {stockData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stockData} layout="vertical" barSize={22}>
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickFormatter={(v) => v.toLocaleString("en-IN")}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={110}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <RTooltip
                      formatter={(v) => [
                        v.toLocaleString("en-IN") + " pcs",
                        "Available",
                      ]}
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(139,92,246,0.3)",
                      }}
                    />
                    <Bar dataKey="available" radius={[0, 4, 4, 0]}>
                      {stockData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={
                            BRICK_COLORS[entry.name] ||
                            PIE_COLORS[i % PIE_COLORS.length]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No stock data
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Recent Challans */}
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionTitle>Recent Confirmed Challans</SectionTitle>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                        borderBottom: "2px solid rgba(255,107,53,0.5)",
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: 700, color: "#f1f5f9", py: 1.5 }}
                      >
                        Challan ID
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: "#f1f5f9", py: 1.5 }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: "#f1f5f9", py: 1.5 }}
                      >
                        Customer
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: "#f1f5f9", py: 1.5 }}
                      >
                        Bricks
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#f1f5f9",
                          py: 1.5,
                          textAlign: "right",
                        }}
                      >
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(d?.recentChallans || []).map((c) => (
                      <TableRow
                        key={c._id}
                        sx={{ "&:hover": { bgcolor: "rgba(255,107,53,0.08)" } }}
                      >
                        <TableCell
                          sx={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: "#94a3b8",
                          }}
                        >
                          {c._id}
                        </TableCell>
                        <TableCell sx={{ color: "#f1f5f9", fontSize: 13 }}>
                          {dayjs(c.date).format("DD MMM YYYY")}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 500,
                            color: "#f1f5f9",
                            fontSize: 13,
                          }}
                        >
                          {c.customerName}
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {(c.saleDetail || []).map((s) => (
                              <Chip
                                key={s.brickName}
                                label={`${s.brickName.split(" ")[0]}: ${s.quantity.toLocaleString("en-IN")}`}
                                size="small"
                                sx={{
                                  bgcolor:
                                    (BRICK_COLORS[s.brickName] || "#ff6b35") +
                                    "25",
                                  color: BRICK_COLORS[s.brickName] || "#ff6b35",
                                  fontSize: 10,
                                  fontWeight: 600,
                                }}
                              />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "right",
                            fontWeight: 700,
                            color: "#10b981",
                            fontSize: 14,
                          }}
                        >
                          ₹{(c.totalAmount || 0).toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!d?.recentChallans || d.recentChallans.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No confirmed challans yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* Tab: Revenue */}
      {tab === 1 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <SectionTitle>Monthly Revenue (Last 6 Months)</SectionTitle>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueChartData} barSize={40}>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <RTooltip
                      formatter={(v) => [
                        `₹${v.toLocaleString("en-IN")}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(139,92,246,0.3)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <SectionTitle>Revenue This Month</SectionTitle>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{ color: "#10b981" }}
                >
                  ₹{thisRevenue.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {revenueChange !== null
                    ? `${revenueChange > 0 ? "+" : ""}${revenueChange}% compared to last month (₹${lastRevenue.toLocaleString("en-IN")})`
                    : "First month of tracking"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <SectionTitle>Bricks Sold This Month</SectionTitle>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{ color: "#8b5cf6" }}
                >
                  {thisBricks.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {brickChange !== null
                    ? `${brickChange > 0 ? "+" : ""}${brickChange}% compared to last month (${lastBricks.toLocaleString("en-IN")})`
                    : "First month of tracking"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab: Expenses */}
      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <SectionTitle>Expense Breakdown (This Month)</SectionTitle>
                {expensePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {expensePieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                      <RTooltip
                        formatter={(v) => [
                          `₹${v.toLocaleString("en-IN")}`,
                          "Cost",
                        ]}
                        contentStyle={{
                          background: "#1e293b",
                          border: "1px solid rgba(139,92,246,0.3)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No expenses this month
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <SectionTitle>Raw Material Costs</SectionTitle>
                  <Grid container spacing={1.5}>
                    {[
                      {
                        label: "Cement",
                        value: expenses.rawMaterial?.cement || 0,
                        color: "#ff6b35",
                      },
                      {
                        label: "Fly Ash",
                        value: expenses.rawMaterial?.flyAsh || 0,
                        color: "#8b5cf6",
                      },
                      {
                        label: "Pond Ash",
                        value: expenses.rawMaterial?.pondAsh || 0,
                        color: "#10b981",
                      },
                      {
                        label: "Dust & Powder",
                        value: expenses.rawMaterial?.dustPowder || 0,
                        color: "#f59e0b",
                      },
                      {
                        label: "Chemical",
                        value: expenses.rawMaterial?.chemical || 0,
                        color: "#3b82f6",
                      },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 6 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "rgba(15,23,42,0.6)",
                            border: `1px solid ${item.color}30`,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontSize={11}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ color: item.color }}
                          >
                            ₹{item.value.toLocaleString("en-IN")}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <SectionTitle>All-Time Expense Totals</SectionTitle>
                  <Stack spacing={1.5}>
                    {[
                      {
                        label: "Raw Material",
                        value: totals.allTimeRawMaterial || 0,
                        color: "#8b5cf6",
                      },
                      {
                        label: "Worker Salary",
                        value: totals.allTimeWorkerSalary || 0,
                        color: "#3b82f6",
                      },
                      {
                        label: "Maintenance",
                        value: totals.allTimeMaintenance || 0,
                        color: "#ef4444",
                      },
                      {
                        label: "Transport",
                        value: totals.allTimeTransport || 0,
                        color: "#10b981",
                      },
                    ].map((item) => (
                      <Stack
                        key={item.label}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          py: 1,
                          borderBottom: "1px solid rgba(139,92,246,0.1)",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          sx={{ color: item.color }}
                        >
                          ₹{(item.value / 1000).toFixed(1)}K
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Tab: Profit */}
      {tab === 3 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                ...cardSx,
                borderLeft: `4px solid ${profitThisMonth >= 0 ? "#10b981" : "#ef4444"}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Net Profit This Month
                </Typography>
                <Typography
                  variant="h2"
                  fontWeight={800}
                  sx={{ color: profitThisMonth >= 0 ? "#10b981" : "#ef4444" }}
                >
                  ₹{Math.abs(profitThisMonth).toLocaleString("en-IN")}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Revenue: ₹{thisRevenue.toLocaleString("en-IN")} − Expenses: ₹
                  {totalExpensesThisMonth.toLocaleString("en-IN")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <SectionTitle>Revenue vs Expenses</SectionTitle>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        name: "This Month",
                        revenue: thisRevenue,
                        expenses: totalExpensesThisMonth,
                      },
                    ]}
                    barSize={60}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <RTooltip
                      formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, ""]}
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(139,92,246,0.3)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="Revenue"
                    />
                    <Bar
                      dataKey="expenses"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      name="Expenses"
                    />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <SectionTitle>Profit Margin</SectionTitle>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="h2"
                    fontWeight={800}
                    sx={{ color: profitThisMonth >= 0 ? "#10b981" : "#ef4444" }}
                  >
                    {thisRevenue > 0
                      ? ((profitThisMonth / thisRevenue) * 100).toFixed(1)
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    {profitThisMonth >= 0
                      ? "Healthy profit margin"
                      : "Operating at a loss"}
                  </Typography>
                </Box>
                <Stack spacing={1} mt={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      All-Time Revenue
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: "#10b981" }}
                    >
                      ₹{((totals.allTimeRevenue || 0) / 100000).toFixed(2)}L
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      All-Time Expenses
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: "#ef4444" }}
                    >
                      ₹
                      {(
                        ((totals.allTimeRawMaterial || 0) +
                          (totals.allTimeWorkerSalary || 0) +
                          (totals.allTimeMaintenance || 0) +
                          (totals.allTimeTransport || 0)) /
                        100000
                      ).toFixed(2)}
                      L
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
