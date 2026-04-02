// Sales/index.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Fade,
} from "@mui/material";
// Grid removed: using Box CSS grid instead
import {
  Search as SearchIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CheckCircle,
  Lock as LockIcon,
} from "@mui/icons-material";
import { Sale, Employee, Customer, Medicine } from "../../types/types";
import DataTable from "../../components/shared/DataTable";
import {
  getSales,
  createSale,
  updateSale,
  updateSaleStatus,
  getEmployees,
  getMedicines,
} from "../../service/salesService";
import { fetchCustomers as getCustomers } from "../../service/customerService";
import SaleForm from "./SaleForm";
import ApproveSaleDialog from "./ApproveSaleDialog";
import { checkPermission } from "../../service/permissionService";

const generateId = () =>
  `sale_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "canceled"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [permissions, setPermissions] = useState({
    create: false,
    approve: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesData, employeesData, customersData, medicinesData] =
          await Promise.all([
            getSales(),
            getEmployees(),
            getCustomers(),
            getMedicines(),
          ]);

        const [createPerm, approvePerm] = await Promise.all([
          checkPermission("create_sale"),
          checkPermission("approve_sale"),
        ]);

        setPermissions({
          create: createPerm,
          approve: approvePerm,
        });

        const validSales = salesData.filter(
          (sale) => sale && typeof sale === "object" && "id" in sale
        );

        setSales(validSales);
        setEmployees(employeesData);
        setCustomers(customersData);
        setMedicines(medicinesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data from server");
        showNotification(
          err.message || "Failed to fetch data from server",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCustomerNameById = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    return customer
      ? `${customer.first_name} ${customer.last_name}`
      : "Unknown Customer";
  };

  const getEmployeeNameById = (id: string) => {
    const employee = employees.find((e) => e.id === id);
    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : "Unknown Employee";
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") return "NA";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "default";

    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "canceled":
        return "error";
      default:
        return "default";
    }
  };

  const showNotification = (message: string, severity: "success" | "error") => {
    setNotification({
      open: true,
      message,
      severity,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        const customerName = getCustomerNameById(
          sale.customer_id
        ).toLowerCase();
        const employeeName = getEmployeeNameById(
          sale.employee_id
        ).toLowerCase();

        const matchesSearch =
          customerName.includes(searchTerm.toLowerCase()) ||
          employeeName.includes(searchTerm.toLowerCase()) ||
          (sale.id && sale.id.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filter === "all" || sale.Status === filter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.Status === "pending" && b.Status !== "pending") return -1;
        if (a.Status !== "pending" && b.Status === "pending") return 1;
        const dateA = a.sale_date ? new Date(a.sale_date).getTime() : 0;
        const dateB = b.sale_date ? new Date(b.sale_date).getTime() : 0;
        return dateB - dateA;
      });
  }, [sales, searchTerm, filter, customers, employees]);

  const handleAddSale = () => {
    setSelectedSale(null);
    setIsDialogOpen(true);
  };

  const handleApproveSale = (sale: Sale) => {
    if (sale.Status === "pending") {
      setSelectedSale(sale);
      setIsApproveDialogOpen(true);
    } else {
      showNotification("Only pending sales can be approved", "error");
    }
  };

  const handleCancelSale = (sale: Sale) => {
    if (sale.Status === "pending") {
      setSelectedSale(sale);
      setIsDeleteDialogOpen(true);
    } else {
      showNotification("Only pending sales can be canceled", "error");
    }
  };

  const handleSaveSale = async (saleData: Partial<Sale>) => {
    try {
      if (selectedSale) {
        const updatedSale = await updateSale({
          ...selectedSale,
          ...saleData,
        } as Sale);

        setSales(
          sales.map((s) => (s.id === selectedSale.id ? updatedSale : s))
        );
        showNotification("Sale updated successfully", "success");
      } else {
        const saleWithId = {
          ...saleData,
          id: saleData.id || generateId(),
        };

        const newSale = await createSale(saleWithId);
        setSales([...sales, newSale]);
        showNotification("Sale created successfully", "success");
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving sale:", err);
      showNotification(err.message || "Failed to save sale", "error");
    }
  };

  const handleApproveSaleConfirm = async (
    prices: { sale_item_id: string; selling_price: number }[]
  ) => {
    if (selectedSale) {
      try {
        const updatedSale = await updateSaleStatus(selectedSale.id, {
          status: "completed",
          prices,
        });
        setSales(
          sales.map((s) => (s.id === selectedSale.id ? updatedSale : s))
        );
        showNotification("Sale approved successfully", "success");
        setIsApproveDialogOpen(false);
      } catch (err) {
        console.error("Error approving sale:", err);
        showNotification(err.message || "Failed to approve sale", "error");
      }
    }
  };

  const handleCancelSaleConfirm = async () => {
    if (selectedSale) {
      try {
        const updatedSale = await updateSaleStatus(selectedSale.id, {
          status: "canceled",
        });
        setSales(
          sales.map((s) => (s.id === selectedSale.id ? updatedSale : s))
        );
        showNotification("Sale canceled successfully", "success");
        setIsDeleteDialogOpen(false);
      } catch (err) {
        console.error("Error canceling sale:", err);
        showNotification(err.message || "Failed to cancel sale", "error");
      }
    }
  };

  // Calculate KPIs
  const totalSalesValue = useMemo(
    () =>
      sales
        .filter((sale) => sale.Status === "completed")
        .reduce((sum, sale) => sum + (sale.total_price || 0), 0),
    [sales]
  );

  const pendingSalesCount = useMemo(
    () => sales.filter((sale) => sale.Status === "pending").length,
    [sales]
  );

  const completedSalesCount = useMemo(
    () => sales.filter((sale) => sale.Status === "completed").length,
    [sales]
  );

  if (loading) {
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Sales & Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track sales performance
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 4,
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
        }}
      >
        <Card
          sx={{
            height: "100%",
            borderLeft: "4px solid",
            borderColor: "success.main",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 6,
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
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ETB {totalSalesValue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sales
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "success.50", color: "success.main" }}>
                <TrendingUpIcon />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
        <Card
          sx={{
            height: "100%",
            borderLeft: "4px solid",
            borderColor: "primary.main",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 6,
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
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {sales.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "primary.50", color: "primary.main" }}>
                <ReceiptIcon />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
        <Card
          sx={{
            height: "100%",
            borderLeft: "4px solid",
            borderColor: "warning.main",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 6,
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
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {pendingSalesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Orders
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "warning.50", color: "warning.main" }}>
                <ReceiptIcon />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
        <Card
          sx={{
            height: "100%",
            borderLeft: "4px solid",
            borderColor: "success.main",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 6,
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
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {completedSalesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Orders
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "success.50", color: "success.main" }}>
                <CheckCircleIcon />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
          maxWidth: "980px",
          background: "linear-gradient(145deg, #f5f7fa, #e4e8f0)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                background: "white",
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilter("all")}
              sx={{ borderRadius: 2 }}
            >
              All
            </Button>
            <Button
              variant={filter === "pending" ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilter("pending")}
              color="warning"
              sx={{ borderRadius: 2 }}
            >
              Pending
            </Button>
            <Button
              variant={filter === "completed" ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilter("completed")}
              color="success"
              sx={{ borderRadius: 2 }}
            >
              Completed
            </Button>
            <Button
              variant={filter === "canceled" ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilter("canceled")}
              color="error"
              sx={{ borderRadius: 2 }}
            >
              Canceled
            </Button>
          </Box>

          {permissions.create ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSale}
              sx={{
                px: 3,
                borderRadius: 2,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              Add Sale
            </Button>
          ) : (
            <Tooltip title="You don't have permission to add sales">
              <Button
                variant="contained"
                startIcon={<LockIcon />}
                sx={{
                  px: 3,
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
                Add Sale
              </Button>
            </Tooltip>
          )}
        </Box>

        <DataTable
          data={filteredSales}
          columns={[
            {
              field: "id",
              headerName: "Order #",
              width: 70,
              renderCell: (params) => (
                <Typography variant="subtitle2" fontWeight={600}>
                  {filteredSales.indexOf(params.row) + 1}
                </Typography>
              ),
            },
            {
              field: "customer_id",
              headerName: "Customer",
              width: 180,
              renderCell: (params) => {
                const customerName = getCustomerNameById(
                  params.row.customer_id
                );
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 35,
                        height: 35,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(customerName)}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {customerName}
                    </Typography>
                  </Box>
                );
              },
            },
            {
              field: "total_price",
              headerName: "Total",
              width: 120,
              renderCell: (params) => (
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color={
                    params.row.Status === "completed"
                      ? "success.main"
                      : "text.primary"
                  }
                >
                  {params.row.total_price
                    ? `ETB ${params.row.total_price.toLocaleString()}`
                    : "Pending"}
                </Typography>
              ),
            },
            {
              field: "Status",
              headerName: "Status",
              width: 120,
              renderCell: (params) => {
                const status = params.row.Status || "unknown";
                return (
                  <Chip
                    label={status}
                    size="small"
                    color={getStatusColor(status)}
                    variant={status === "pending" ? "outlined" : "filled"}
                    sx={{
                      fontWeight: 600,
                      textTransform: "capitalize",
                      borderRadius: 1,
                    }}
                  />
                );
              },
            },
            {
              field: "sale_date",
              headerName: "Date",
              width: 120,
              renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                  {params.row.sale_date
                    ? new Date(params.row.sale_date).toLocaleDateString()
                    : "N/A"}
                </Typography>
              ),
            },
            {
              field: "actions",
              headerName: "Actions",
              width: 250,
              renderCell: (params) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                  {permissions.approve && params.row.Status === "pending" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApproveSale(params.row)}
                        sx={{
                          px: 2,
                          textTransform: "none",
                          fontSize: "0.75rem",
                          borderRadius: 2,
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
                          },
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleCancelSale(params.row)}
                        sx={{
                          px: 2,
                          textTransform: "none",
                          fontSize: "0.75rem",
                          borderRadius: 2,
                          transition: "all 0.3s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {!permissions.approve && params.row.Status === "pending" && (
                    <Tooltip title="You don't have approval permissions">
                      <Chip
                        icon={<LockIcon fontSize="small" />}
                        label="Approval Locked"
                        color="default"
                        size="small"
                        sx={{
                          fontSize: "0.75rem",
                          borderRadius: 1,
                          backgroundColor: "#f5f5f5",
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
              ),
            },
          ]}
          sx={{
            "& .MuiDataGrid-row": {
              "&:hover": {
                backgroundColor: "rgba(36, 59, 36, 0.05)",
              },
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#f5f5f5",
              fontWeight: 700,
              borderRadius: 2,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
            },
            borderRadius: 3,
            border: "none",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          }}
          getRowId={(row) => row.id || generateId()}
        />
      </Paper>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: 700,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          }}
        >
          {selectedSale ? "Edit Sale" : "Add New Sale"}
        </DialogTitle>
        <DialogContent>
          <SaleForm
            sale={selectedSale}
            customers={customers}
            medicines={medicines}
            recurringPrescriptions={[]}
            onSave={handleSaveSale}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ApproveSaleDialog
        open={isApproveDialogOpen}
        sale={selectedSale}
        medicines={medicines}
        onClose={() => setIsApproveDialogOpen(false)}
        onApprove={handleApproveSaleConfirm}
      />

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Sale</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel this sale?
          </Typography>
          {selectedSale && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>Customer:</strong>{" "}
                {getCustomerNameById(selectedSale.customer_id)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Total:</strong>{" "}
                {selectedSale.total_price
                  ? `ETB ${selectedSale.total_price.toLocaleString()}`
                  : "Pending"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCancelSaleConfirm}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Cancel Sale
          </Button>
        </DialogActions>
      </Dialog>

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
              <CheckCircle
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

export default Sales;
