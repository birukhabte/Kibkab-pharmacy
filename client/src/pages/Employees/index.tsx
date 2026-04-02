import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Fade,
  Card,
  CardContent,
  Paper,
  InputAdornment,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import DataTable from "@/components/shared/DataTable";
import { Grid } from "@mui/material";
import {
  Employee,
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchRoles,
  fetchBranches,
  Role,
  Branch,
} from "../../service/employeeService";
import EmployeeForm from "./EmployeeForm";

function getInitials(name?: string | null) {
  if (!name || typeof name !== "string") return "NA";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setLoadingRoles(true);
      setLoadingBranches(true);
      try {
        const [employeesData, rolesData, branchesData] = await Promise.all([
          fetchEmployees(),
          fetchRoles(),
          fetchBranches(),
        ]);

        setEmployees(employeesData);
        setRoles(rolesData);
        setBranches(branchesData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load data";
        setError(errorMessage);
        showError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingRoles(false);
        setLoadingBranches(false);
      }
    };
    loadData();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const term = searchTerm.toLowerCase();
    return (
      `${employee.first_name} ${employee.last_name}`
        .toLowerCase()
        .includes(term) ||
      employee.email.toLowerCase().includes(term) ||
      employee.phone.includes(term) ||
      employee.username.toLowerCase().includes(term)
    );
  });

  const paginatedEmployees = filteredEmployees.slice(
    page * pageSize,
    page * pageSize + pageSize
  );
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

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

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEmployee = async (formData) => {
    try {
      if (selectedEmployee) {
        const { password, ...rest } = formData;
        const updateData = password ? { ...rest, password } : rest;
        const updatedEmployee = await updateEmployee(
          selectedEmployee.id,
          updateData
        );
        setEmployees(
          employees.map((e) =>
            e.id === selectedEmployee.id ? updatedEmployee : e
          )
        );
        showSuccess("Employee updated successfully!");
      } else {
        const newEmployee = await createEmployee(formData);
        setEmployees([newEmployee, ...employees]);
        showSuccess("Employee added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save employee";
      showError(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedEmployee) {
      try {
        await deleteEmployee(selectedEmployee.id);
        setEmployees(employees.filter((e) => e.id !== selectedEmployee.id));
        setIsDeleteDialogOpen(false);
        showSuccess("Employee deleted successfully!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete employee";
        showError(errorMessage);
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Employee",
      flex: 1.5,
      renderCell: (params) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2E7D32, #4CAF50)",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              flexShrink: 0,
            }}
          >
            {getInitials(`${params.row.first_name} ${params.row.last_name}`)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={600} color="text.primary" noWrap>
              {params.row.first_name} {params.row.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              @{params.row.username}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhoneIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "active",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "error"}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
            minWidth: "80px",
            height: "26px",
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit Employee">
            <IconButton
              size="small"
              onClick={() => handleEditEmployee(params.row)}
              sx={{ color: "primary.main" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Employee">
            <IconButton
              size="small"
              onClick={() => handleDeleteEmployee(params.row)}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box p={4}>
        <CircularProgress />
        <Typography>Loading employees...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Employee Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your pharmacy staff and their roles
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
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
                    {employees.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.50", color: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
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
                    color="success.main"
                  >
                    {employees.filter((e) => e.active).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Employees
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "success.50", color: "success.main" }}>
                  <TrendingUpIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {new Set(employees.map((e) => e.branch_id)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Branches
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "info.50", color: "info.main" }}>
                  <LocationIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
          <TextField
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEmployee}
            sx={{ px: 3 }}
          >
            Add Employee
          </Button>
        </Box>

        <DataTable
          rows={paginatedEmployees}
          columns={columns}
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-row": {
              "&:hover": {
                backgroundColor: "rgba(46, 125, 50, 0.04)",
              },
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#f5f5f5",
              fontWeight: 700,
            },
            borderRadius: 3,
            border: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 2,
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {filteredEmployees.length === 0 ? 0 : page * pageSize + 1}–
            {Math.min((page + 1) * pageSize, filteredEmployees.length)} of{" "}
            {filteredEmployees.length} employees
          </Typography>
          <Button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            variant="outlined"
            sx={{ borderRadius: 2, minWidth: 40 }}
          >
            Previous
          </Button>
          <Button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            variant="contained"
            sx={{ borderRadius: 2, minWidth: 40 }}
          >
            Next
          </Button>
        </Box>
      </Paper>

      {/* Employee Dialog */}
      <EmployeeForm
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSaveEmployee}
        initialValues={selectedEmployee || undefined}
        roles={roles}
        branches={branches}
        loadingRoles={loadingRoles}
        loadingBranches={loadingBranches}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, color: "error.main" }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete {selectedEmployee?.first_name}{" "}
            {selectedEmployee?.last_name}? This action is irreversible and will
            permanently remove all employee data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1,
              fontWeight: 600,
              color: "text.primary",
              borderColor: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #b71c1c 0%, #8e0000 100%)",
                boxShadow: "0 6px 20px rgba(211, 47, 47, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Confirm Delete
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

export default EmployeesPage;
