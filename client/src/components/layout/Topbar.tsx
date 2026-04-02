import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Stack,
  IconButton,
  Badge,
  Avatar,
  Chip,
  InputBase,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import NotificationMenu from "../shared/NotificationMenu";
import { Notification } from "../../types/types";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: (theme.shape.borderRadius as number) * 2,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

// Mock notifications for the topbar
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "prescription_complete",
    title: "Prescription Completed",
    message: "Abebe Kebede's Amoxicillin prescription has been completed",
    isRead: false,
    createdAt: "2024-01-15T10:30:00Z",
    relatedId: "1",
  },
  {
    id: "2",
    type: "prescription_refill_due",
    title: "Prescription Refill Due",
    message: "Fatima Ahmed is due for Paracetamol refill on Jan 20",
    isRead: false,
    createdAt: "2024-01-15T09:15:00Z",
    relatedId: "2",
    customerId: "2",
    customerName: "Fatima Ahmed",
    refillDate: "2024-01-20",
  },
  {
    id: "3",
    type: "company_credit_due",
    title: "Company Credit Payment Due",
    message:
      "Payment of ETB 25,000 due to Ethiopian Pharmaceutical Supply on Feb 15",
    isRead: false,
    createdAt: "2024-01-15T08:45:00Z",
    relatedId: "1",
  },
  {
    id: "4",
    type: "commission_earned",
    title: "Commission Earned",
    message: "Dr. Sarah Wilson has earned ETB 500 commission",
    isRead: true,
    createdAt: "2024-01-14T16:45:00Z",
    relatedId: "1",
  },
];

const Topbar = () => {
  // Get user data from localStorage safely
  let first_name = "";
  let last_name = "";
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const userData = JSON.parse(raw);
      first_name = userData?.first_name || "";
      last_name = userData?.last_name || "";
    }
  } catch {}

  const handleNotificationClick = (notification: Notification) => {
    // Handle notification click - could navigate to relevant page
    console.log("Notification clicked:", notification);
  };

  // Generate initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ minHeight: "70px !important", px: 3 }}>
        {/* Brand Section */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: "white",
              fontSize: "1.25rem",
              letterSpacing: "0.5px",
            }}
          >
            PharmaCare
          </Typography>
          <Chip
            label="Ethiopian Pharmacy"
            size="small"
            sx={{
              ml: 2,
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: "24px",
            }}
          />
        </Box>

        {/* Search Bar */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon sx={{ color: "rgba(255,255,255,0.8)" }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search drugs, employees, customers..."
            inputProps={{ "aria-label": "search" }}
            sx={{
              color: "white",
              "&::placeholder": { color: "rgba(255,255,255,0.7)" },
            }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Section */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Live Status */}
          <Chip
            icon={<CircleIcon sx={{ fontSize: 8, color: "#4CAF50" }} />}
            label="System Online"
            size="small"
            sx={{
              backgroundColor: "rgba(76, 175, 80, 0.2)",
              color: "white",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              fontWeight: 500,
              fontSize: "0.75rem",
            }}
          />

          {/* Notifications */}
          {/* <NotificationMenu
            notifications={mockNotifications}
            onNotificationClick={handleNotificationClick}
          /> */}

          {/* Dark Mode Toggle */}
         

          {/* User Profile */}
          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                border: "2px solid rgba(255,255,255,0.3)",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {getInitials(first_name, last_name)}
            </Avatar>
            <Box sx={{ ml: 2, display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="body2"
                sx={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}
              >
                {first_name} {last_name}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
