import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
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
  CircularProgress,
  Fade,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  ArrowBack,
  ArrowForward,
  CheckCircle,
} from "@mui/icons-material";
import { Customer } from "../../types/types";
import DataTable from "../../components/shared/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../service/customerService";

const Customers = () => {
  type CustomerRow = Customer & { name: string };
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const pageSize = 10;

  // Fetch customers from backend
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const apiCustomers = await fetchCustomers();
      const transformedCustomers = apiCustomers.map((customer: any) => ({
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        email: customer.email,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
      }));
      setCustomers(transformedCustomers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching customers");
      showNotification("Error fetching customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(term)
    );
  });

  const paginatedCustomers = filteredCustomers.slice(
    page * pageSize,
    page * pageSize + pageSize
  );
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [filteredCustomers.length, totalPages, page]);

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

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    setSaveLoading(true);
    try {
      if (selectedCustomer) {
        // Update existing customer
        await updateCustomer(selectedCustomer.id, {
          first_name: customerData.first_name || "",
          last_name: customerData.last_name || "",
          phone: customerData.phone || "",
          email: customerData.email || "",
        });
        showNotification("Customer updated successfully", "success");
      } else {
        // Add new customer
        await addCustomer({
          first_name: customerData.first_name || "",
          last_name: customerData.last_name || "",
          phone: customerData.phone || "",
          email: customerData.email || "",
        });
        showNotification("Customer added successfully", "success");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Operation failed";
      showNotification(errorMessage, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    setDeleteLoading(true);
    try {
      await deleteCustomer(selectedCustomer.id);
      showNotification("Customer deleted successfully", "success");
      setIsDeleteDialogOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      showNotification(errorMessage, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Customer",
      flex: 3,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 30,
              height: 40,
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {getInitials(params.row.name)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.phone || "No phone"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 3,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.email || "No email"}
        </Typography>
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.row.created_at).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleEditCustomer(params.row)}
            sx={{
              color: "primary.main",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.08)",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteCustomer(params.row)}
            sx={{
              color: "error.main",
              "&:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.08)",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Customers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your customer database and track their prescription history
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: "100%",
              boxShadow: 3,
              borderRadius: 3,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 5,
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
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {customers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: "primary.50",
                    color: "primary.main",
                    width: 48,
                    height: 48,
                  }}
                >
                  <PersonIcon fontSize="medium" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: 3,
          background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
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
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                height: 56,
              },
            }}
            sx={{ flexGrow: 1, minWidth: 300 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCustomer}
            sx={{
              px: 3,
              borderRadius: 2,
              height: 56,
              minWidth: 180,
              fontWeight: 600,
              textTransform: "none",
              fontSize: 16,
            }}
          >
            Add Customer
          </Button>
        </Box>

        <DataTable
          columns={columns}
          rows={paginatedCustomers}
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f7fa",
              borderRadius: 2,
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {filteredCustomers.length === 0 ? 0 : page * pageSize + 1}–
            {Math.min((page + 1) * pageSize, filteredCustomers.length)} of{" "}
            {filteredCustomers.length} customers
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              variant="outlined"
              sx={{
                borderRadius: 2,
                minWidth: 40,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Previous
            </Button>
            <Button
              endIcon={<ArrowForward />}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              variant="contained"
              sx={{
                borderRadius: 2,
                minWidth: 40,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Customer Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => !saveLoading && setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 2,
            px: 3,
            display: "flex",
            alignItems: "center",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            {selectedCustomer ? "Edit Customer" : "Add New Customer"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 4, px: 3 }}>
          <CustomerForm
            customer={selectedCustomer}
            onSave={handleSaveCustomer}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={saveLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !deleteLoading && setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle fontWeight={600} sx={{ pb: 1 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <Box component="span" fontWeight={600}>
              {selectedCustomer
                ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                : ""}
            </Box>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={deleteLoading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
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

// Enhanced Customer Form Component
interface CustomerFormProps {
  customer: Customer | null;
  onSave: (data: Partial<Customer>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSave,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
  });

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  const validate = () => {
    const newErrors = {
      first_name: !formData.first_name ? "First name is required" : "",
      last_name: !formData.last_name ? "Last name is required" : "",
      phone: !formData.phone ? "Phone is required" : "",
      email: formData.email
        ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
          ? "Invalid email format"
          : ""
        : "",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="h6"
          fontWeight={600}
          color="text.primary"
          gutterBottom
        >
          Personal Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth error={!!errors.first_name}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
                error={!!errors.first_name}
                variant="outlined"
                size="medium"
              />
              {errors.first_name && (
                <FormHelperText sx={{ ml: 0 }}>
                  {errors.first_name}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth error={!!errors.last_name}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
                error={!!errors.last_name}
                variant="outlined"
                size="medium"
              />
              {errors.last_name && (
                <FormHelperText sx={{ ml: 0 }}>
                  {errors.last_name}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          fontWeight={600}
          color="text.primary"
          gutterBottom
        >
          Contact Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth error={!!errors.phone}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                error={!!errors.phone}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="medium" />
                    </InputAdornment>
                  ),
                }}
              />
              {errors.phone && (
                <FormHelperText sx={{ ml: 0 }}>{errors.phone}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth error={!!errors.email}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={!!errors.email}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="medium" />
                    </InputAdornment>
                  ),
                }}
              />
              {errors.email && (
                <FormHelperText sx={{ ml: 0 }}>{errors.email}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
          pt: 3,
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
        }}
      >
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outlined"
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: 16,
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: 16,
          }}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CheckCircle />
            )
          }
        >
          {isLoading
            ? "Saving..."
            : customer
            ? "Update Customer"
            : "Add Customer"}
        </Button>
      </Box>
    </Box>
  );
};

export default Customers;
