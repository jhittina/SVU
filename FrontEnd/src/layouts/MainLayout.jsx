import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FactoryIcon from "@mui/icons-material/Factory";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import WorkIcon from "@mui/icons-material/Work";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import BusinessIcon from "@mui/icons-material/Business";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 265;
const DRAWER_WIDTH_COLLAPSED = 72;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: "/" },
  { divider: "Operations" },
  {
    label: "Production",
    icon: <FactoryIcon fontSize="small" />,
    path: "/production",
  },
  {
    label: "Sales / Challan",
    icon: <ReceiptIcon fontSize="small" />,
    path: "/sales",
  },
  {
    label: "Bills / Invoices",
    icon: <DescriptionIcon fontSize="small" />,
    path: "/bills",
  },
  { divider: "Master Data" },
  {
    label: "Customers",
    icon: <PeopleIcon fontSize="small" />,
    path: "/customers",
  },
  {
    label: "Vehicles",
    icon: <LocalShippingIcon fontSize="small" />,
    path: "/vehicles",
  },
  {
    label: "Suppliers",
    icon: <BusinessIcon fontSize="small" />,
    path: "/suppliers",
  },
  {
    label: "Daily Transport",
    icon: <DirectionsCarIcon fontSize="small" />,
    path: "/daily-transport",
  },
  { divider: "Raw Materials" },
  {
    label: "Raw Materials",
    icon: <StorageIcon fontSize="small" />,
    children: [
      { label: "Cement", path: "/raw-materials/cement" },
      { label: "Fly Ash", path: "/raw-materials/fly-ash" },
      { label: "Pond Ash", path: "/raw-materials/pond-ash" },
      { label: "Dust & Powder", path: "/raw-materials/dust-powder" },
      { label: "Chemical", path: "/raw-materials/chemical" },
    ],
  },
  { divider: "Costs" },
  {
    label: "Worker Salary",
    icon: <GroupsIcon fontSize="small" />,
    path: "/worker-salary",
  },
  {
    label: "Maintenance",
    icon: <BuildIcon fontSize="small" />,
    path: "/maintenance",
  },
  { divider: "Finance" },
  {
    label: "Pending Amounts",
    icon: <AccountBalanceWalletIcon fontSize="small" />,
    path: "/pending",
  },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [rawOpen, setRawOpen] = useState(
    location.pathname.startsWith("/raw-materials"),
  );
  const [anchorEl, setAnchorEl] = useState(null);

  const handleNavClick = (item) => {
    if (item.children) {
      if (!open) {
        setOpen(true);
        setRawOpen(true);
      } else {
        setRawOpen((v) => !v);
      }
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ display: "flex" }}>
      {/* ── AppBar ── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderBottom: "1px solid rgba(255,107,53,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={() => setOpen((v) => !v)}
            edge="start"
            sx={{
              color: "#ff6b35",
              "&:hover": { bgcolor: "rgba(255,107,53,0.1)" },
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexGrow: 1,
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%)",
                p: 1,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(255,107,53,0.3)",
              }}
            >
              <FactoryIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              fontWeight={700}
              sx={{
                background: "linear-gradient(135deg, #ff6b35 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Samarth Veetu Udyog
            </Typography>
          </Box>
          {user && (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.75,
                mr: 1,
                display: { xs: "none", sm: "block" },
              }}
            >
              {user.firstName} {user.lastName}
            </Typography>
          )}
          <Tooltip title="Account options">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              size="small"
            >
              <Avatar
                sx={{
                  bgcolor: "#ff6b35",
                  color: "#fff",
                  width: 38,
                  height: 38,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(255,107,53,0.4)",
                }}
              >
                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 140 } }}
          >
            <MenuItem disabled sx={{ fontSize: 12, opacity: 0.6 }}>
              {user?.email}
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logout();
                navigate("/login");
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ── Sidebar ── */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          flexShrink: 0,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "& .MuiDrawer-paper": {
            width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
            color: "#fff",
            borderRight: "1px solid rgba(255,107,53,0.1)",
            backgroundImage: "none",
            overflowX: "hidden",
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", py: 1 }}>
          <List dense disablePadding>
            {navItems.map((item, idx) => {
              if (item.divider) {
                return open ? (
                  <Typography
                    key={idx}
                    variant="caption"
                    sx={{
                      display: "block",
                      px: 3,
                      pt: 2,
                      pb: 0.5,
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontSize: 10,
                    }}
                  >
                    {item.divider}
                  </Typography>
                ) : (
                  <Divider
                    key={idx}
                    sx={{
                      my: 1.5,
                      mx: 2,
                      borderColor: "rgba(255,107,53,0.2)",
                    }}
                  />
                );
              }
              if (item.children) {
                return (
                  <Box key={item.label}>
                    <Tooltip
                      title={!open ? item.label : ""}
                      placement="right"
                      arrow
                    >
                      <ListItemButton
                        onClick={() => handleNavClick(item)}
                        sx={{
                          ...navBtnSx(open),
                          justifyContent: open ? "initial" : "center",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            minWidth: open ? 34 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {open && (
                          <>
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{ fontSize: 14 }}
                            />
                            {rawOpen ? (
                              <ExpandLessIcon fontSize="small" />
                            ) : (
                              <ExpandMoreIcon fontSize="small" />
                            )}
                          </>
                        )}
                      </ListItemButton>
                    </Tooltip>
                    {open && (
                      <Collapse in={rawOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children.map((child) => (
                            <ListItemButton
                              key={child.path}
                              sx={{
                                ...navBtnSx(open),
                                pl: 6,
                                ...(isActive(child.path) ? activeSx : {}),
                              }}
                              onClick={() => navigate(child.path)}
                            >
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{ fontSize: 13 }}
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </Box>
                );
              }
              return (
                <Tooltip
                  key={item.path}
                  title={!open ? item.label : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    onClick={() => handleNavClick(item)}
                    sx={{
                      ...navBtnSx(open),
                      ...(isActive(item.path) ? activeSx : {}),
                      justifyContent: open ? "initial" : "center",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.path)
                          ? "#ffd54f"
                          : "rgba(255,255,255,0.7)",
                        minWidth: open ? 34 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: isActive(item.path) ? 700 : 400,
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* ── Main Content ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 1, sm: 1.5 },
          py: { xs: 0.5, sm: 0.75 },
          mt: 8,
          transition: "margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          minHeight: "100vh",
          bgcolor: "#0f172a",
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

const navBtnSx = (open) => ({
  color: "#f1f5f9",
  borderRadius: open ? 2.5 : "50%",
  mx: open ? 1.5 : 1,
  mb: 0.8,
  py: open ? 1.2 : 1.5,
  px: open ? undefined : 0,
  minWidth: open ? undefined : 48,
  minHeight: 48,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    bgcolor: "rgba(255,107,53,0.15)",
    transform: open ? "translateX(4px)" : "scale(1.1)",
    borderLeft: open ? "3px solid #ff6b35" : "none",
  },
});

const activeSx = {
  background:
    "linear-gradient(90deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.05) 100%)",
  borderLeft: "4px solid #ff6b35",
  borderRadius: "0 12px 12px 0",
  ml: "0px",
  pl: "14px",
  boxShadow: "0 4px 12px rgba(255,107,53,0.2)",
  "&:hover": {
    background:
      "linear-gradient(90deg, rgba(255,107,53,0.25) 0%, rgba(255,107,53,0.08) 100%)",
    transform: "none",
  },
};
