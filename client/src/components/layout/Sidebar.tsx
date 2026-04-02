// src/components/Sidebar.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Stack,
  Chip,
  Collapse,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Medication as MedicationIcon,
  LocalPharmacy as PharmacyIcon,
  Payment as PaymentIcon,
  AdminPanelSettings as AdminPanelIcon,
  AssignmentInd as RolesIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  AttachMoney as CommissionsIcon,
  CreditCard as CreditCardIcon,
  Warehouse as StocksIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { checkPermission } from "../../service/permissionService";
import api from "../../api/api";

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  subItems?: SubMenuItem[];
  permission?: string;
}

interface SubMenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
}

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const initializeMenu = async () => {
      try {
        // Check all needed permissions in a single batch
        const [
          hasManageEmployees, 
          hasManageCustomer, 
          hasRoleManagement,
          hasViewReports  // Added permission check for reports
        ] = await Promise.all([
          checkPermission('manage_employees'),
          checkPermission('manage_customer'),
          checkPermission('manage_roles'),
          checkPermission('view_reports')  // New permission check
        ]);

        const baseMenuItems: MenuItem[] = [
          {
            text: "Dashboard",
            icon: <DashboardIcon />,
            path: "/dashboard",
          },
          {
            text: "Sales & Orders",
            icon: <ReceiptIcon />,
            path: "/sales",
          },
          {
            text: "Inventory",
            icon: <InventoryIcon />,
            path: "/inventory",
            badge: "New",
          },
          {
            text: "Stocks",
            icon: <StocksIcon />,
            path: "/stocks",
          },
          {
            text: "Employees",
            icon: <PeopleIcon />,
            path: "/employees",
            permission: 'manage_employees'
          },
          {
            text: "Customers",
            icon: <PersonIcon />,
            path: "/customers",
            permission: 'manage_customer'
          },
          {
            text: "Prescriptions",
            icon: <MedicationIcon />,
            path: "/prescriptions",
          },
          {
            text: "Commissions",
            icon: <CommissionsIcon />,
            path: "/commissions",
          },
          {
            text: "Credit Payments",
            icon: <CreditCardIcon />,
            path: "/credit-payments",
          },
          // Reports menu item now has permission check
          {
            text: "Reports",
            icon: <AnalyticsIcon />,
            path: "/reports",
            permission: 'view_reports'
          },
          {
            text: "Admin Panel",
            icon: <AdminPanelIcon />,
            path: "/admin",
            subItems: [
              {
                text: "Role Management",
                icon: <RolesIcon />,
                path: "/admin/roles",
                permission: 'manage_roles'
              },
            ].filter(subItem => !subItem.permission || 
              (subItem.permission === 'manage_roles' && hasRoleManagement))
          },
        ];

        // Filter menu items based on permissions
        const filteredMenuItems = baseMenuItems.filter(item => {
          // Skip items that require permissions the user doesn't have
          if (item.permission) {
            if (item.permission === 'manage_employees' && !hasManageEmployees) 
              return false;
            if (item.permission === 'manage_customer' && !hasManageCustomer) 
              return false;
            if (item.permission === 'view_reports' && !hasViewReports) 
              return false;
          }
          
          // Remove admin panel if it has no subitems
          if (item.path === '/admin' && item.subItems?.length === 0) {
            return false;
          }
          
          return true;
        });

        setMenuItems(filteredMenuItems);
      } catch (error) {
        console.error("Failed to load menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeMenu();
  }, []);

  const handleItemClick = (path: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      setExpandedMenu(expandedMenu === path ? null : path);
    } else {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={2}
        >
          <PharmacyIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h6" color="primary" fontWeight="bold">
            PharmaCare
          </Typography>
        </Stack>
        <Chip
          label="Ethiopian Pharmacy"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </Box>

      <Divider />

      <List disablePadding>
        {menuItems.map((item) => (
          <div key={item.path}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item.path, !!item.subItems)}
                selected={location.pathname.startsWith(item.path)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    "&:hover": { bgcolor: "primary.light" },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
                {item.subItems &&
                  (expandedMenu === item.path ? (
                    <KeyboardArrowUp />
                  ) : (
                    <KeyboardArrowDown />
                  ))}
              </ListItemButton>
            </ListItem>

            {item.subItems && (
              <Collapse
                in={expandedMenu === item.path}
                timeout="auto"
                unmountOnExit
              >
                <List disablePadding sx={{ pl: 4 }}>
                  {item.subItems.map((subItem) => (
                    <ListItem key={subItem.path} disablePadding>
                      <ListItemButton
                        onClick={() => navigate(subItem.path)}
                        selected={location.pathname === subItem.path}
                        sx={{
                          "&.Mui-selected": {
                            bgcolor: "action.selected",
                            "&:hover": { bgcolor: "action.selected" },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "inherit" }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} disabled={isLoggingOut}>
            <ListItemIcon>
              {isLoggingOut ? <CircularProgress size={24} /> : <LogoutIcon />}
            </ListItemIcon>
            <ListItemText primary={isLoggingOut ? "Logging out..." : "Logout"} />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
