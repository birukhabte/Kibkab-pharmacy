import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Stack,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
  MenuItem,
  Fade,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CreditCard as CreditCardIcon,
  Payment as PaymentIcon,
  ThumbUp as ApproveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import DataTable from "../../components/shared/DataTable";
import OrderForm from "./OrderForm";
import api from "../../api/api";
import {
  createOrder,
  createPayment,
  fetchSuppliers,
  fetchBranches,
  updateOrderStatus,
  Order,
  Supplier,
  Branch,
} from "../../service/orderService";
import { checkPermission } from "../../service/permissionService";

const CreditPayments = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid" | "overdue">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    order: Order | null;
    action: "pay" | "approve" | "cancel";
  }>({ open: false, order: null, action: "pay" });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [loading, setLoading] = useState({
    orders: true,
    suppliers: true,
    branches: true,
    form: false,
  });
  const [permissions, setPermissions] = useState({
    create_order: false,
    approve_order: false,
    pay_order: false,
  });
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Safe data fetching with null/undefined handling
        const [unpaidOrdersResponse, paidOrdersResponse, suppliersData, branchesData] =
          await Promise.all([
            api.get<Order[]>("/orders", { params: { paid: false } })
              .then(res => Array.isArray(res?.data) ? res.data : [])
              .catch(() => []),
            api.get<Order[]>("/orders", { params: { paid: true } })
              .then(res => Array.isArray(res?.data) ? res.data : [])
              .catch(() => []),
            fetchSuppliers().then(data => Array.isArray(data) ? data : [])
              .catch(() => []),
            fetchBranches().then(data => Array.isArray(data) ? data : [])
              .catch(() => []),
          ]);

        // Safely combine orders
        setOrders([...unpaidOrdersResponse, ...paidOrdersResponse]);

        // Ensure suppliers and branches are arrays
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
        setBranches(Array.isArray(branchesData) ? branchesData : []);

        // Check permissions with safe fallbacks
        const [createPerm, approvePerm, payPerm] = await Promise.all([
          checkPermission("create_order").catch(() => false),
          checkPermission("approve_order").catch(() => false),
          checkPermission("pay_order").catch(() => false),
        ]);

        setPermissions({
          create_order: Boolean(createPerm),
          approve_order: Boolean(approvePerm),
          pay_order: Boolean(payPerm),
        });
      } catch (error) {
        showError("Failed to load data");
        setOrders([]);
        setSuppliers([]);
        setBranches([]);
      } finally {
        setLoading((prev) => ({
          ...prev,
          orders: false,
          suppliers: false,
          branches: false,
        }));
        setPermissionsLoaded(true);
      }
    };

    fetchData();
  }, []);

  // Safe calculations for derived data
  const approvedOrders = useMemo(() => 
    orders?.filter?.(o => o?.status === "APPROVED") || [], 
    [orders]
  );
  
  const unpaidOrders = useMemo(() => 
    approvedOrders?.filter?.(o => !o?.is_paid) || [], 
    [approvedOrders]
  );
  
  const overdueOrders = useMemo(() => 
    unpaidOrders?.filter?.(o => {
      try {
        return o?.due_date && new Date(o.due_date) < new Date();
      } catch {
        return false;
      }
    }) || [], 
    [unpaidOrders]
  );
  
  const totalOutstanding = useMemo(() => 
    unpaidOrders?.reduce?.(
      (sum, o) => sum + (o?.total || 0),
      0
    ) || 0, 
    [unpaidOrders]
  );
  
  const paidOrders = useMemo(() => 
    orders?.filter?.(o => o?.is_paid) || [], 
    [orders]
  );
  
  const pendingOrders = useMemo(() => 
    orders?.filter?.(o => o?.status === "PENDING") || [], 
    [orders]
  );

  // Sort orders: PENDING first, then APPROVED, then CANCELED
  const sortedAndFilteredOrders = useMemo(() => {
    const statusPriority: Record<string, number> = {
      PENDING: 1,
      APPROVED: 2,
      CANCELED: 3,
    };

    return (orders || [])
      .filter((order) => {
        const matchesSearch =
          (order?.supplier_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order?.branch_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const today = new Date();
        const dueDate = order?.due_date ? new Date(order.due_date) : null;
        const isOverdue = !order?.is_paid && dueDate && dueDate < today;

        const matchesStatusFilter = statusFilter
          ? order?.status === statusFilter
          : true;

        const matchesFilter =
          filter === "all" ||
          (filter === "paid" && order?.is_paid) ||
          (filter === "unpaid" && !order?.is_paid) ||
          (filter === "overdue" && isOverdue);

        return matchesSearch && matchesFilter && matchesStatusFilter;
      })
      .sort((a, b) => {
        // First sort by status priority
        const aStatus = a?.status || "";
        const bStatus = b?.status || "";
        if (statusPriority[aStatus] !== statusPriority[bStatus]) {
          return statusPriority[aStatus] - statusPriority[bStatus];
        }

        // Then sort by due date (earliest first)
        const aDue = a?.due_date
          ? new Date(a.due_date).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bDue = b?.due_date
          ? new Date(b.due_date).getTime()
          : Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      });
  }, [orders, searchTerm, filter, statusFilter]);

  const handleAddOrder = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.order) return;

    try {
      setLoading((prev) => ({ ...prev, form: true }));

      switch (confirmDialog.action) {
        case "pay":
          await createPayment(
            confirmDialog.order.id,
            confirmDialog.order.total || 0
          );
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order?.id === confirmDialog.order?.id
                ? { ...order, is_paid: true }
                : order
            )
          );
          showSuccess("Payment recorded successfully");
          break;

        case "approve":
          await updateOrderStatus(confirmDialog.order.id, "APPROVED");
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order?.id === confirmDialog.order?.id
                ? { ...order, status: "APPROVED" }
                : order
            )
          );
          showSuccess("Order approved successfully");
          break;

        case "cancel":
          await updateOrderStatus(confirmDialog.order.id, "CANCELED");
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order?.id === confirmDialog.order?.id
                ? { ...order, status: "CANCELED" }
                : order
            )
          );
          showSuccess("Order canceled successfully");
          break;
      }
    } catch (error: any) {
      const actionMap = {
        pay: "record payment",
        approve: "approve order",
        cancel: "cancel order",
      };
      showError(
        error?.response?.data?.message ||
          `Failed to ${actionMap[confirmDialog.action]}`
      );
    } finally {
      setConfirmDialog({ open: false, order: null, action: "pay" });
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const handleSaveOrder = async (orderData: {
    supplier_id: string;
    branch_id: string;
    due_date: string;
    total: number;
  }) => {
    try {
      setLoading((prev) => ({ ...prev, form: true }));
      const newOrder = await createOrder(orderData);
      setOrders((prev) => [...prev, newOrder]);
      showSuccess("Order created successfully");
      setIsDialogOpen(false);
    } catch (error: any) {
      showError(error?.response?.data?.message || "Failed to create order");
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const getSupplierName = (supplierId: string | null | undefined) => {
    if (!supplierId) return "Unknown Supplier";
    const supplier = suppliers.find((s) => s?.id === supplierId);
    return supplier?.name || "Unknown Supplier";
  };

  const getBranchName = (branchId: string | null | undefined) => {
    if (!branchId) return "Unknown Branch";
    const branch = branches.find((b) => b?.id === branchId);
    return branch?.name || "Unknown Branch";
  };

  const getPaymentStatusColor = (order: Order) => {
    if (order?.is_paid) return "success";
    const dueDate = order?.due_date ? new Date(order.due_date) : null;
    if (dueDate && dueDate < new Date()) return "error";
    return "warning";
  };

  const getPaymentStatusText = (order: Order) => {
    if (order?.is_paid) return "Paid";
    const dueDate = order?.due_date ? new Date(order.due_date) : null;
    if (dueDate && dueDate < new Date()) return "Overdue";
    return "Pending";
  };

  const getOrderStatusColor = (status: string | undefined) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELED":
        return "error";
      default:
        return "default";
    }
  };

  const getDaysUntilDue = (dueDate: string | undefined | null) => {
    if (!dueDate) return 0;
    try {
      const today = new Date();
      const due = new Date(dueDate);
      if (isNaN(due.getTime())) return 0;
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name || typeof name !== "string") return "NA";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0] || '')
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const showSuccess = (message: string) => {
    setNotification({
      open: true,
      message,
      severity: "success",
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  const showError = (message: string) => {
    setNotification({
      open: true,
      message,
      severity: "error",
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  const columns = [
    {
      field: "supplier_id",
      headerName: "Supplier",
      width: 180,
      renderCell: (params: any) => {
        const order = params.row as Order;
        const supplierName = getSupplierName(order?.supplier_id);
        return (
          <Tooltip title={supplierName} placement="top">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 35,
                  height: 35,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {getInitials(supplierName)}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                {supplierName}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "total",
      headerName: "Amount",
      width: 120,
      renderCell: (params: any) => {
        const order = params.row as Order;
        return (
          <Typography variant="subtitle2" fontWeight={600} color="error.main">
            ETB {(order?.total || 0).toLocaleString()}
          </Typography>
        );
      },
    },
    {
      field: "due_date",
      headerName: "Due Date",
      width: 150,
      renderCell: (params: any) => {
        const order = params.row as Order;
        const daysUntilDue = getDaysUntilDue(order?.due_date);
        const dueDate = order?.due_date ? new Date(order.due_date) : null;

        return (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {dueDate && !isNaN(dueDate.getTime())
                ? dueDate.toLocaleDateString()
                : "No date"}
            </Typography>
            {!order?.is_paid && (
              <Typography
                variant="caption"
                color={
                  daysUntilDue < 0
                    ? "error.main"
                    : daysUntilDue <= 3
                    ? "warning.main"
                    : "text.secondary"
                }
              >
                {daysUntilDue < 0
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : `${daysUntilDue} days left`}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Order Status",
      width: 130,
      renderCell: (params: any) => {
        const order = params.row as Order;
        return (
          <Chip
            label={order?.status || "UNKNOWN"}
            size="small"
            color={getOrderStatusColor(order?.status) as any}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: "payment_status",
      headerName: "Payment Status",
      width: 150,
      renderCell: (params: any) => {
        const order = params.row as Order;
        return (
          <Chip
            label={getPaymentStatusText(order)}
            size="small"
            color={getPaymentStatusColor(order) as any}
            icon={
              order?.is_paid ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <CreditCardIcon fontSize="small" />
              )
            }
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params: any) => {
        const order = params.row as Order;
        if (!order) return null;

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {order?.status === "PENDING" && permissions.approve_order ? (
              <>
                <Tooltip title="Approve Order">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDialog({
                        open: true,
                        order,
                        action: "approve",
                      });
                    }}
                    color="success"
                    sx={{
                      backgroundColor: theme.palette.success.light,
                      "&:hover": {
                        backgroundColor: theme.palette.success.main,
                      },
                    }}
                  >
                    <ApproveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel Order">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDialog({ open: true, order, action: "cancel" });
                    }}
                    color="error"
                    sx={{
                      backgroundColor: theme.palette.error.light,
                      "&:hover": { backgroundColor: theme.palette.error.main },
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              order?.status === "PENDING" &&
              !permissions.approve_order && (
                <Tooltip title="You don't have permission to approve or cancel orders">
                  <Chip
                    icon={<LockIcon fontSize="small" />}
                    label="Action Locked"
                    color="default"
                    size="small"
                    sx={{
                      fontSize: "0.75rem",
                      borderRadius: 1,
                      backgroundColor: "#f5f5f5",
                    }}
                  />
                </Tooltip>
              )
            )}

            {order?.status === "APPROVED" &&
            !order?.is_paid &&
            permissions.pay_order ? (
              <Tooltip title="Mark as Paid">
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={<PaymentIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({ open: true, order, action: "pay" });
                  }}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": { boxShadow: theme.shadows[2] },
                  }}
                >
                  Pay Now
                </Button>
              </Tooltip>
            ) : (
              order?.status === "APPROVED" &&
              !order?.is_paid &&
              !permissions.pay_order && (
                <Tooltip title="You don't have permission to mark orders as paid">
                  <Chip
                    icon={<LockIcon fontSize="small" />}
                    label="Payment Locked"
                    color="default"
                    size="small"
                    sx={{
                      fontSize: "0.75rem",
                      borderRadius: 1,
                      backgroundColor: "#f5f5f5",
                    }}
                  />
                </Tooltip>
              )
            )}

            {order?.is_paid && (
              <Chip
                label="Paid"
                color="success"
                size="small"
                icon={<CheckCircleIcon fontSize="small" />}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        );
      },
    },
  ];

  if (!permissionsLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Credit Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage supplier orders and payments
        </Typography>
      </Box>

      {/* Pending Payments Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Pending Payments: {pendingOrders.length}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
       <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              boxShadow: theme.shadows[2],
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  <PaymentIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Outstanding
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    ETB {totalOutstanding.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
       <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderLeft: `4px solid ${theme.palette.error.main}`,
              boxShadow: theme.shadows[2],
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.error.light,
                    color: theme.palette.error.contrastText,
                  }}
                >
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Overdue Payments
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {overdueOrders.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
       <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              boxShadow: theme.shadows[2],
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.warning.light,
                    color: theme.palette.warning.contrastText,
                  }}
                >
                  <CreditCardIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Approval
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {pendingOrders.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
       <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderLeft: `4px solid ${theme.palette.success.main}`,
              boxShadow: theme.shadows[2],
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                  }}
                >
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed Payments
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {paidOrders.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          background: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              placeholder="Search orders..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
              sx={{ width: 300 }}
            />

            <TextField
              select
              label="Order Status"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              SelectProps={{ sx: { borderRadius: 2 } }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="CANCELED">Canceled</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => setFilter("all")}
              sx={{ borderRadius: 2 }}
            >
              All Orders
            </Button>
            <Button
              variant={filter === "unpaid" ? "contained" : "outlined"}
              color="warning"
              onClick={() => setFilter("unpaid")}
              sx={{ borderRadius: 2 }}
            >
              Unpaid
            </Button>
            <Button
              variant={filter === "overdue" ? "contained" : "outlined"}
              color="error"
              onClick={() => setFilter("overdue")}
              sx={{ borderRadius: 2 }}
            >
              Overdue
            </Button>
            <Button
              variant={filter === "paid" ? "contained" : "outlined"}
              color="success"
              onClick={() => setFilter("paid")}
              sx={{ borderRadius: 2 }}
            >
              Paid
            </Button>

            {permissions.create_order ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddOrder}
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  "&:hover": { boxShadow: theme.shadows[4] },
                }}
              >
                New Order
              </Button>
            ) : (
              <Tooltip title="You don't have permission to create orders">
                <Button
                  variant="contained"
                  startIcon={<LockIcon />}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#e0e0e0",
                    color: "#9e9e9e",
                    cursor: "not-allowed",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                  disabled
                >
                  New Order
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>

        {loading.orders ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={sortedAndFilteredOrders}
            loading={loading.orders}
            sx={{
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              },
            }}
          />
        )}
      </Paper>

      {/* Order Form Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: 600,
          }}
        >
          Create New Order
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <OrderForm
            suppliers={suppliers}
            branches={branches}
            onSave={handleSaveOrder}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={loading.form}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, order: null, action: "pay" })
        }
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {confirmDialog.action === "pay"
            ? "Confirm Payment"
            : confirmDialog.action === "approve"
            ? "Approve Order"
            : "Cancel Order"}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {confirmDialog.order ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {confirmDialog.action === "pay"
                  ? `Confirm payment for order from ${getSupplierName(
                      confirmDialog.order.supplier_id
                    )}?`
                  : confirmDialog.action === "approve"
                  ? `Approve order from ${getSupplierName(
                      confirmDialog.order.supplier_id
                    )}?`
                  : `Cancel order from ${getSupplierName(
                      confirmDialog.order.supplier_id
                    )}?`}
              </Typography>

              <Box
                sx={{
                  bgcolor: theme.palette.grey[100],
                  p: 2,
                  borderRadius: 2,
                  borderLeft: `3px solid ${
                    confirmDialog.action === "pay"
                      ? theme.palette.primary.main
                      : confirmDialog.action === "approve"
                      ? theme.palette.success.main
                      : theme.palette.error.main
                  }`,
                }}
              >
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2">Amount:</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography fontWeight={600}>
                      ETB {(confirmDialog.order.total || 0).toLocaleString()}
                    </Typography>
                  </Grid>

                  {confirmDialog.order.due_date && (
                    <>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2">Due Date:</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography>
                          {new Date(
                            confirmDialog.order.due_date
                          ).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Box>
          ) : (
            <Alert severity="error">No order selected</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, order: null, action: "pay" })
            }
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={
              confirmDialog.action === "pay"
                ? "primary"
                : confirmDialog.action === "approve"
                ? "success"
                : "error"
            }
            disabled={!confirmDialog.order || loading.form}
            sx={{
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": { boxShadow: theme.shadows[2] },
            }}
          >
            {confirmDialog.action === "pay"
              ? "Confirm Payment"
              : confirmDialog.action === "approve"
              ? "Approve Order"
              : "Cancel Order"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      {notification.open && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1400,
          }}
        >
          <Fade in={notification.open} timeout={300}>
            <Box
              sx={{
                background:
                  notification.severity === "success"
                    ? "linear-gradient(135deg, #2E7D32, #4CAF50)"
                    : "linear-gradient(135deg, #d32f2f, #b71c1c)",
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                textAlign: "center",
                minWidth: 300,
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: 60,
                  mb: 2,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}
              />
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                {notification.severity === "success" ? "Success!" : "Error"}
              </Typography>
              <Typography variant="body1">{notification.message}</Typography>
            </Box>
          </Fade>
        </Box>
      )}
    </Box>
  );
};

export default CreditPayments;
