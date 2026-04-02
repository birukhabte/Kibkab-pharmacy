import React from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Card,
  CardContent,
  Avatar,
  Button,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Skeleton,
  Tooltip,
  Badge,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Medication as MedicationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocalPharmacy as PharmacyIcon,
  People as PeopleIcon,
  Event as CalendarIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, loading, error } = useDashboardData();

  // Get user data from localStorage with safe parsing
  const getUserData = () => {
    try {
      const userString = localStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  const userData = getUserData();

  // Function to get display name with fallbacks
  const getDisplayName = () => {
    if (!userData) return "User";
    const fullName = `${userData?.first_name || ""} ${
      userData?.last_name || ""
    }`.trim();
    if (fullName) return fullName;
    if (userData?.username) return userData.username;
    if (userData?.email) return userData.email.split("@")[0];
    return "User";
  };

  // Safe defaults for all data properties
  const notifications = data?.notifications || [];
  const sales = data?.sales || [];
  const employees = data?.employees || [];
  const prescriptions = data?.prescriptions || 0;
  const creditPayments = data?.creditPayments || [];
  const refillReminders = data?.refillReminders || [];

  // Safe defaults for stats object
  const stats = data?.stats || {
    totalSales: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    totalDrugs: { count: 0, totalQuantity: 0 },
    pendingPrescriptions: 0,
    duePayments: 0,
    lowStockItems: 0,
    monthlyRevenue: 0,
    refillReminders: 0,
  };

  // Destructure stats with safe fallbacks
  const {
    totalSales = 0,
    totalCustomers = 0,
    totalEmployees = 0,
    totalDrugs = { count: 0, totalQuantity: 0 },
    pendingPrescriptions = 0,
    duePayments = 0,
    lowStockItems = 0,
    monthlyRevenue = 0,
    refillReminders: refillCount = 0,
  } = stats || {};

  // Safe destructure for totalDrugs
  const { count: drugCount = 0, totalQuantity: drugQuantity = 0 } =
    totalDrugs || {};

  const getInitials = (name?: string | null): string => {
    if (!name || typeof name !== "string") return "NA";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationIcon = (type?: string | null) => {
    switch (type) {
      case "prescription_complete":
        return <CheckCircleIcon color="success" />;
      case "prescription_refill_due":
      case "low_stock":
        return <WarningIcon color="warning" />;
      case "company_credit_due":
        return <PaymentIcon color="primary" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getRefillPriority = (
    daysLeft?: number | null
  ): "low" | "medium" | "high" => {
    const days = daysLeft ?? 99;
    if (days <= 1) return "high";
    if (days <= 3) return "medium";
    return "low";
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        }}
      >
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1800, mx: "auto" }}>
      {/* Welcome Section */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg,rgb(9, 150, 33) 0%, #0d2b36 100%)",
          borderRadius: 4,
          p: { xs: 2, md: 4 },
          mb: 4,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 15px 30px rgba(0,0,0,0.25)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "250px",
            height: "250px",
            background:
              "radial-gradient(circle, rgba(11, 192, 29, 0.64) 0%, transparent 70%)",
            transform: "translate(40%, -40%)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "180px",
            height: "180px",
            background:
              "radial-gradient(circle, rgba(13, 174, 24, 0.71) 0%, transparent 70%)",
            transform: "translate(-30%, 40%)",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={3}
        >
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Typography
              variant="h3"
              fontWeight={800}
              mb={1}
              sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
            >
              Welcome back, {getDisplayName()}! 👋
            </Typography>
            <Typography
              variant="h6"
              sx={{ opacity: 0.85, mb: 3, fontWeight: 400 }}
            >
              Here's what's happening with your pharmacy today
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<CheckCircleIcon />}
                label="System Secure"
                sx={{
                  backgroundColor: "rgba(76, 175, 80, 0.25)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  fontWeight: 600,
                  py: 1,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Chip
                icon={<NotificationsIcon />}
                label={`${
                  notifications.filter((n) => !n.isRead).length
                } new notifications`}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  fontWeight: 600,
                  py: 1,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
            </Stack>
          </Box>
          <Box
            sx={{
              p: 3,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              zIndex: 2,
              transform: "rotate(15deg)",
            }}
          >
            <MedicationIcon
              sx={{ fontSize: 60, opacity: 0.9, transform: "rotate(-15deg)" }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Alerts */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        {refillCount > 0 && (
          <Alert
            severity="error"
            variant="filled"
            icon={<PharmacyIcon />}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 15px rgba(244,67,54,0.3)",
            }}
            action={
              <Button color="inherit" size="small" variant="outlined">
                View All
              </Button>
            }
          >
            <Typography fontWeight={600}>
              {refillCount} customer prescription refill(s) due soon
            </Typography>
          </Alert>
        )}

        {duePayments > 0 && (
          <Alert
            severity="warning"
            variant="filled"
            icon={<PaymentIcon />}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 15px rgba(255,152,0,0.3)",
            }}
            action={
              <Button color="inherit" size="small" variant="outlined">
                View All
              </Button>
            }
          >
            <Typography fontWeight={600}>
              {duePayments} company credit payment(s) to suppliers are due
              within 10 days
            </Typography>
          </Alert>
        )}

        {prescriptions > 0 && (
          <Alert
            severity="info"
            variant="filled"
            icon={<MedicationIcon />}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 15px rgba(33,150,243,0.3)",
            }}
            action={
              <Button color="inherit" size="small" variant="outlined">
                View All
              </Button>
            }
          >
            <Typography fontWeight={600}>
              {prescriptions} prescription(s) are active
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #1a535c 0%, #0d2b36 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 15px 30px rgba(0,0,0,0.25)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%)",
              },
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  {loading ? (
                    <Skeleton
                      variant="rectangular"
                      width={120}
                      height={40}
                      sx={{
                        bgcolor: "rgba(11, 135, 48, 0.73)",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    />
                  ) : (
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="white"
                      sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
                    >
                      ETB{" "}
                      {monthlyRevenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.85, fontWeight: 500 }}
                  >
                    Monthly Revenue
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    width: 48,
                    height: 48,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <TrendingUpIcon fontSize="medium" />
                </Avatar>
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  opacity: loading ? 0 : 1,
                  background: "rgba(14, 179, 36, 0.4)",
                  p: "6px 12px",
                  borderRadius: 2,
                  width: "fit-content",
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="caption" fontWeight={500}>
                  {monthlyRevenue > 0
                    ? `${Math.round(
                        (monthlyRevenue / 100000) * 100
                      )}% from target`
                    : "Set revenue targets in settings"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 15px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  {loading ? (
                    <Skeleton variant="rectangular" width={80} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight={800} color="#1a535c">
                      {totalCustomers}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Total Customers
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#e9f5f7",
                    color: "#1a535c",
                    width: 48,
                    height: 48,
                    boxShadow: "0 4px 8px rgba(26,83,92,0.2)",
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 15px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  {loading ? (
                    <Skeleton variant="rectangular" width={80} height={40} />
                  ) : (
                    <Typography variant="h4" fontWeight={800} color="#4e89ae">
                      {totalEmployees}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Total Employees
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#edf7ff",
                    color: "#4e89ae",
                    width: 48,
                    height: 48,
                    boxShadow: "0 4px 8px rgba(78,137,174,0.2)",
                  }}
                >
                  <PeopleIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 15px 30px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  {loading ? (
                    <Skeleton variant="rectangular" width={120} height={40} />
                  ) : (
                    <>
                      <Typography variant="h4" fontWeight={800} color="#4361ee">
                        {drugCount}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Total Drugs ({drugQuantity} units)
                      </Typography>
                    </>
                  )}
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "#edf2ff",
                    color: "#4361ee",
                    width: 48,
                    height: 48,
                    boxShadow: "0 4px 8px rgba(67,97,238,0.2)",
                  }}
                >
                  <MedicationIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 25px rgba(0,0,0,0.1)",
              },
            }}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                width="60%"
                height={30}
                sx={{ mx: "auto" }}
              />
            ) : (
              <>
                <Typography variant="h4" fontWeight={800} color="#ff9e00">
                  {prescriptions}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Active Prescriptions
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 25px rgba(0,0,0,0.1)",
              },
            }}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                width="60%"
                height={30}
                sx={{ mx: "auto" }}
              />
            ) : (
              <>
                <Typography variant="h4" fontWeight={800} color="#f72585">
                  {refillCount}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Refill Reminders
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 25px rgba(0,0,0,0.1)",
              },
            }}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                width="60%"
                height={30}
                sx={{ mx: "auto" }}
              />
            ) : (
              <>
                <Typography variant="h4" fontWeight={800} color="#ef233c">
                  {lowStockItems}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Low Stock Items
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 25px rgba(0,0,0,0.1)",
              },
            }}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                width="60%"
                height={30}
                sx={{ mx: "auto" }}
              />
            ) : (
              <>
                <Typography variant="h4" fontWeight={800} color="#06d6a0">
                  {sales.length}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Today's Sales
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Credit Payments Due */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            }}
          >
            <Stack direction="row" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700} color="#1a535c">
                Credit Payments Due
              </Typography>
              <Chip
                label="Due/Overdue"
                size="small"
                color="error"
                sx={{
                  ml: 1,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  height: 24,
                }}
              />
            </Stack>

            {creditPayments.filter(
              (p) =>
                !p.isPaid &&
                new Date(p.dueDate || new Date()) <=
                  new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)
            ).length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  background:
                    "linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)",
                  borderRadius: 2,
                  border: "1px dashed rgba(0,0,0,0.1)",
                }}
              >
                <CheckCircleIcon
                  sx={{ fontSize: 48, color: "#06d6a0", mb: 2 }}
                />
                <Typography variant="body1" color="text.secondary">
                  No due or overdue payments
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {creditPayments
                  .filter((payment) => {
                    if (payment.isPaid) return false;
                    const dueDate = new Date(payment.dueDate || new Date());
                    return (
                      dueDate <=
                      new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)
                    );
                  })
                  .sort(
                    (a, b) =>
                      new Date(a.dueDate || new Date()).getTime() -
                      new Date(b.dueDate || new Date()).getTime()
                  )
                  .slice(0, 5)
                  .map((payment, index) => {
                    const dueDate = new Date(payment.dueDate || new Date());
                    const now = new Date();
                    const daysDiff = Math.floor(
                      (dueDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const isOverdue = daysDiff < 0;
                    const daysLeft = Math.abs(daysDiff);

                    return (
                      <React.Fragment key={payment.id || index}>
                        <ListItem
                          sx={{
                            px: 2,
                            py: 1.5,
                            background: isOverdue
                              ? "linear-gradient(90deg, rgba(239,35,60,0.08) 0%, transparent 100%)"
                              : "linear-gradient(90deg, rgba(255,158,0,0.08) 0%, transparent 100%)",
                            border: isOverdue
                              ? "1px solid rgba(239,35,60,0.2)"
                              : "1px solid rgba(255,158,0,0.2)",
                            borderRadius: 2,
                            mb:
                              index <
                              creditPayments.filter((p) => !p.isPaid).length - 1
                                ? 1
                                : 0,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateX(5px)",
                              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: isOverdue
                                  ? "#ffebee"
                                  : daysDiff <= 3
                                  ? "#fff8e1"
                                  : "#e8f5e9",
                                color: isOverdue
                                  ? "#f44336"
                                  : daysDiff <= 3
                                  ? "#ff9800"
                                  : "#4caf50",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                              }}
                            >
                              <BusinessIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color="#1a535c"
                              >
                                {payment.supplierName || "Unknown Supplier"}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  {payment.branchName || "N/A"} •{" "}
                                  {payment.status || "Unknown"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mt: 0.5 }}
                                >
                                  Due: {formatDate(payment.dueDate)}
                                </Typography>
                              </Box>
                            }
                          />
                          <Box sx={{ textAlign: "right", minWidth: 100 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              color={isOverdue ? "#ef233c" : "#ff9e00"}
                            >
                              ETB{" "}
                              {(payment.amount || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={
                                isOverdue
                                  ? "#ef233c"
                                  : daysDiff <= 3
                                  ? "#ff9e00"
                                  : "#06d6a0"
                              }
                              fontWeight={700}
                              sx={{ display: "block" }}
                            >
                              {isOverdue
                                ? `${daysLeft} day${
                                    daysLeft !== 1 ? "s" : ""
                                  } overdue`
                                : `${daysDiff} day${
                                    daysDiff !== 1 ? "s" : ""
                                  } left`}
                            </Typography>
                          </Box>
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
              </List>
            )}
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/credit-payments")}
              sx={{
                mt: 2,
                fontWeight: 700,
                background: "linear-gradient(135deg, #ef233c 0%, #d90429 100%)",
                color: "white",
                py: 1.5,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #d90429 0%, #ef233c 100%)",
                  boxShadow: "0 5px 15px rgba(239,35,60,0.4)",
                },
              }}
            >
              Manage Payments
            </Button>
          </Paper>
        </Grid>
        {/* Refill Reminders */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6" fontWeight={700} color="#1a535c">
                Upcoming Refill Reminders
              </Typography>
              <Badge
                badgeContent={refillCount}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    fontWeight: 700,
                    boxShadow: "0 0 0 2px #fff",
                  },
                }}
              />
            </Stack>

            {refillReminders.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  background:
                    "linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)",
                  borderRadius: 2,
                  border: "1px dashed rgba(0,0,0,0.1)",
                }}
              >
                <CheckCircleIcon
                  sx={{ fontSize: 48, color: "#06d6a0", mb: 2 }}
                />
                <Typography variant="body1" color="text.secondary">
                  No upcoming refills
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {refillReminders.slice(0, 5).map((reminder, index) => {
                  const priority = getRefillPriority(reminder.days_left);
                  const priorityColors = {
                    high: {
                      bg: "linear-gradient(90deg, rgba(239,35,60,0.08) 0%, transparent 100%)",
                      border: "1px solid rgba(239,35,60,0.2)",
                      icon: "error",
                    },
                    medium: {
                      bg: "linear-gradient(90deg, rgba(255,158,0,0.08) 0%, transparent 100%)",
                      border: "1px solid rgba(255,158,0,0.2)",
                      icon: "warning",
                    },
                    low: {
                      bg: "linear-gradient(90deg, rgba(6,214,160,0.08) 0%, transparent 100%)",
                      border: "1px solid rgba(6,214,160,0.2)",
                      icon: "success",
                    },
                  };

                  return (
                    <React.Fragment
                      key={`${reminder.customer_id}-${reminder.medicine_id}-${index}`}
                    >
                      <ListItem
                        sx={{
                          px: 2,
                          py: 1.5,
                          background: priorityColors[priority].bg,
                          border: priorityColors[priority].border,
                          borderRadius: 2,
                          mb: index < refillReminders.length - 1 ? 1 : 0,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateX(5px)",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: `${priorityColors[priority].icon}.light`,
                              color: `${priorityColors[priority].icon}.dark`,
                              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                            }}
                          >
                            <PharmacyIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              color="#1a535c"
                            >
                              {reminder.medicine_name || "Unknown Medicine"}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {reminder.customer_name || "Unknown Customer"}
                              </Typography>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                mt={0.5}
                              >
                                <CalendarIcon
                                  fontSize="small"
                                  sx={{ opacity: 0.6 }}
                                />
                                <Typography variant="caption" fontWeight={500}>
                                  Due: {formatDate(reminder.next_due_date)}
                                </Typography>
                              </Stack>
                            </Box>
                          }
                        />
                        <Tooltip title={`${reminder.days_left || 0} days left`}>
                          <Chip
                            label={`${reminder.days_left || 0}d`}
                            color={priorityColors[priority].icon as any}
                            sx={{
                              fontWeight: 700,
                              minWidth: 60,
                              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                              ...(priority === "high" && {
                                animation: "pulse 1.5s infinite",
                                "@keyframes pulse": {
                                  "0%": { opacity: 1 },
                                  "50%": { opacity: 0.7 },
                                  "100%": { opacity: 1 },
                                },
                              }),
                            }}
                          />
                        </Tooltip>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            )}
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/prescriptions")}
              sx={{
                mt: 2,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1a535c 0%, #0d2b36 100%)",
                color: "white",
                py: 1.5,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0d2b36 0%, #1a535c 100%)",
                  boxShadow: "0 5px 15px rgba(26,83,92,0.4)",
                },
              }}
            >
              Manage Refills
            </Button>
          </Paper>
        </Grid>

        {/* Recent Sales */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              color="#1a535c"
              gutterBottom
            >
              Recent Sales
            </Typography>
            {sales.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  background:
                    "linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)",
                  borderRadius: 2,
                  border: "1px dashed rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No sales data available
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {sales.slice(0, 5).map((sale, index) => (
                  <React.Fragment key={sale.id || index}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 1.5,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, rgba(26,83,92,0.05) 0%, transparent 100%)",
                          transform: "translateX(3px)",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: "#1a535c",
                            color: "white",
                            fontWeight: 600,
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                          }}
                        >
                          {getInitials(sale.customer_name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            color="#1a535c"
                          >
                            {sale.customer_name || "Unknown Customer"}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              Sold by {sale.employee_name || "Unknown"} •{" "}
                              {sale.branch_name || "Unknown Branch"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {sale.sale_date
                                ? new Date(sale.sale_date).toLocaleDateString()
                                : "No date"}
                            </Typography>
                          </Box>
                        }
                      />
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        color="#06d6a0"
                      >
                        ETB{" "}
                        {(sale.total_price || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </ListItem>
                    {index < sales.length - 1 && (
                      <Divider sx={{ my: 1, opacity: 0.3 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: "fit-content",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6" fontWeight={700} color="#1a535c">
                Recent Notifications
              </Typography>
              <Badge
                badgeContent={notifications.filter((n) => !n.isRead).length}
                color="error"
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    fontWeight: 700,
                    boxShadow: "0 0 0 2px #fff",
                  },
                }}
              />
            </Stack>
            {notifications.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  background:
                    "linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)",
                  borderRadius: 2,
                  border: "1px dashed rgba(0,0,0,0.1)",
                }}
              >
                <CheckCircleIcon
                  sx={{ fontSize: 48, color: "#06d6a0", mb: 2 }}
                />
                <Typography variant="body1" color="text.secondary">
                  No notifications available
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ p: 0 }}>
                  {notifications.slice(0, 5).map((notification, index) => (
                    <React.Fragment key={notification.id || index}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 1.5,
                          background: notification.isRead
                            ? "transparent"
                            : "linear-gradient(90deg, rgba(26,83,92,0.05) 0%, transparent 100%)",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background:
                              "linear-gradient(90deg, rgba(26,83,92,0.08) 0%, transparent 100%)",
                            transform: "translateX(3px)",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                notification.type === "prescription_complete"
                                  ? "#e8f5e9"
                                  : notification.type ===
                                      "prescription_refill_due" ||
                                    notification.type === "low_stock"
                                  ? "#fff8e1"
                                  : "#e3f2fd",
                              color:
                                notification.type === "prescription_complete"
                                  ? "#4caf50"
                                  : notification.type ===
                                      "prescription_refill_due" ||
                                    notification.type === "low_stock"
                                  ? "#ff9800"
                                  : "#2196f3",
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              color={
                                notification.isRead ? "text.primary" : "#1a535c"
                              }
                            >
                              {notification.title || "No Title"}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {notification.message || "No message content"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                {notification.createdAt
                                  ? new Date(
                                      notification.createdAt
                                    ).toLocaleString()
                                  : "No date"}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < notifications.length - 1 && (
                        <Divider sx={{ my: 1, opacity: 0.3 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    mt: 2,
                    fontWeight: 600,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  View All Notifications
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
