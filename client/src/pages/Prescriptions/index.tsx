import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  Alert,
  LinearProgress,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Paper,
  useTheme,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  LocalHospital as MedicineIcon,
  Event as EventIcon,
  Medication as MedicationIcon,
  LocalPharmacy as PrescriptionIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import DataTable from "@/components/shared/DataTable";
import { alpha } from "@mui/material/styles";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRecurringPrescriptions,
  createRecurringPrescription,
  updateRecurringPrescription,
  deleteRecurringPrescription,
  fetchCustomers,
  fetchMedicines,
  type RecurringPrescription,
  type Customer,
  type Medicine,
} from "@/service/prescriptionService";
import {
  format,
  parseISO,
  addDays,
  isBefore,
  differenceInDays,
  isValid,
} from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function getInitials(name?: string | null) {
  if (!name || typeof name !== "string") return "NA";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Prescriptions = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] =
    useState<RecurringPrescription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "refill_due"
  >("all");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch data with React Query
  const {
    data: prescriptionsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recurringPrescriptions"],
    queryFn: fetchRecurringPrescriptions,
  });

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const { data: medicinesData, isLoading: medicinesLoading } = useQuery({
    queryKey: ["medicines"],
    queryFn: fetchMedicines,
  });

  // Toast notifications
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Helper to extract error message from Axios error
  const getErrorMessage = (error: any) => {
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return "An unknown error occurred";
  };

  // Mutations with toast notifications
  const createMutation = useMutation({
    mutationFn: createRecurringPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurringPrescriptions"] });
      setIsDialogOpen(false);
      showToast("Prescription created successfully!", "success");
    },
    onError: (error: any) => {
      showToast(
        `Failed to create prescription: ${getErrorMessage(error)}`,
        "error"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRecurringPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurringPrescriptions"] });
      setIsDialogOpen(false);
      showToast("Prescription updated successfully!", "success");
    },
    onError: (error: any) => {
      showToast(
        `Failed to update prescription: ${getErrorMessage(error)}`,
        "error"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecurringPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurringPrescriptions"] });
      setIsDeleteDialogOpen(false);
      showToast("Prescription deleted successfully!", "success");
    },
    onError: (error: any) => {
      showToast(
        `Failed to delete prescription: ${getErrorMessage(error)}`,
        "error"
      );
    },
  });

  // Enrich prescriptions with customer and medicine names
  const enrichedPrescriptions = (prescriptionsData || []).map(
    (prescription) => {
      const customer = customersData?.find(
        (c) => c.id === prescription.customer_id
      );
      const medicine = medicinesData?.find(
        (m) => m.id === prescription.medicine_id
      );

      const lastDate =
        prescription.last_purchase_date || prescription.start_date;
      const nextRefillDate = addDays(
        parseISO(lastDate),
        prescription.interval_days
      );

      const isCompleted =
        prescription.sold_quantity >= prescription.prescribed_quantity;

      return {
        ...prescription,
        customerName: customer
          ? `${customer.first_name} ${customer.last_name}`
          : "Unknown Customer",
        customerPhone: customer?.phone || "N/A",
        medicineName: medicine ? medicine.name : "Unknown Medicine",
        medicineBrand: medicine?.brand || "N/A",
        nextRefillDate: format(nextRefillDate, "yyyy-MM-dd"),
        isCompleted,
      };
    }
  );

  // Filter prescriptions
  const filteredPrescriptions = enrichedPrescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.medicineName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.customerPhone?.includes(searchTerm);

    const today = new Date();
    const nextRefillDate = parseISO(prescription.nextRefillDate || "");
    const isRefillDue =
      isBefore(nextRefillDate, today) &&
      prescription.active &&
      !prescription.isCompleted;

    const matchesFilter =
      filter === "all" ||
      (filter === "active" &&
        prescription.active &&
        !prescription.isCompleted) ||
      (filter === "completed" && prescription.isCompleted) ||
      (filter === "refill_due" && isRefillDue);

    return matchesSearch && matchesFilter;
  });

  const handleAddPrescription = () => {
    setSelectedPrescription({
      id: "",
      customer_id: "",
      medicine_id: "",
      interval_days: 30,
      prescribed_quantity: 1,
      sold_quantity: 0,
      start_date: format(new Date(), "yyyy-MM-dd"),
      last_purchase_date: null,
      active: true,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleEditPrescription = (prescription: RecurringPrescription) => {
    setSelectedPrescription(prescription);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleDeletePrescription = (prescription: RecurringPrescription) => {
    setSelectedPrescription(prescription);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = (prescription: RecurringPrescription) => {
    updateMutation.mutate({
      id: prescription.id,
      data: { id: prescription.id, active: !prescription.active },
    });
    showToast(
      `Prescription ${!prescription.active ? "activated" : "deactivated"}!`,
      "info"
    );
  };

  const getRefillStatus = (
    prescription: RecurringPrescription & { nextRefillDate?: string }
  ) => {
    if (!prescription.nextRefillDate) return null;
    const today = new Date();
    const nextRefillDate = parseISO(prescription.nextRefillDate);
    const diffDays = differenceInDays(nextRefillDate, today);

    if (diffDays < 0) return { status: "overdue", days: Math.abs(diffDays) };
    if (diffDays <= 3) return { status: "due_soon", days: diffDays };
    return { status: "upcoming", days: diffDays };
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedPrescription?.customer_id) {
      errors.customer_id = "Customer is required";
    }

    if (!selectedPrescription?.medicine_id) {
      errors.medicine_id = "Medicine is required";
    }

    if (
      !selectedPrescription?.interval_days ||
      selectedPrescription.interval_days < 1
    ) {
      errors.interval_days = "Interval must be at least 1 day";
    }

    if (
      !selectedPrescription?.prescribed_quantity ||
      selectedPrescription.prescribed_quantity < 1
    ) {
      errors.prescribed_quantity = "Quantity must be at least 1";
    }

    if (selectedPrescription?.sold_quantity < 0) {
      errors.sold_quantity = "Sold quantity cannot be negative";
    }

    if (
      selectedPrescription?.sold_quantity >
      selectedPrescription?.prescribed_quantity
    ) {
      errors.sold_quantity = "Sold quantity cannot exceed prescribed quantity";
    }

    if (
      !selectedPrescription?.start_date ||
      !isValid(parseISO(selectedPrescription.start_date))
    ) {
      errors.start_date = "Valid start date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePrescription = () => {
    if (!selectedPrescription) return;

    if (!validateForm()) return;

    const prescriptionData = {
      customer_id: selectedPrescription.customer_id,
      medicine_id: selectedPrescription.medicine_id,
      interval_days: selectedPrescription.interval_days,
      prescribed_quantity: selectedPrescription.prescribed_quantity,
      sold_quantity: selectedPrescription.sold_quantity || 0,
      start_date: selectedPrescription.start_date,
      last_purchase_date: selectedPrescription.last_purchase_date || null,
      active: selectedPrescription.active !== false,
    };

    if (selectedPrescription.id) {
      updateMutation.mutate({
        id: selectedPrescription.id,
        data: { id: selectedPrescription.id, ...prescriptionData },
      });
    } else {
      createMutation.mutate(prescriptionData);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedPrescription) {
      deleteMutation.mutate(selectedPrescription.id);
    }
  };

  const columns = [
    {
      field: "customerName",
      headerName: "Customer",
      flex: 1.5,
      renderCell: (params: any) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: theme.palette.primary.main,
              color: "white",
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {getInitials(params.row.customerName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={600} color="text.primary" noWrap>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.customerPhone}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "medicineInfo",
      headerName: "Prescription Details",
      flex: 2,
      renderCell: (params: any) => (
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MedicineIcon color="primary" fontSize="small" />
            <Typography
              fontWeight={600}
              color="text.primary"
              noWrap
              sx={{ fontSize: "1rem" }}
            >
              {params.row.medicineName}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <span>{params.row.medicineBrand}</span>
            <span>·</span>
            <span>Every {params.row.interval_days} days</span>
            <span>·</span>
            <span>{params.row.prescribed_quantity} units</span>
          </Typography>
        </Box>
      ),
    },
    {
      field: "progress",
      headerName: "Progress",
      flex: 1.2,
      renderCell: (params: any) => (
        <Tooltip
          title={`${params.row.sold_quantity} of ${params.row.prescribed_quantity} sold`}
        >
          <Box sx={{ width: "100%" }}>
            <Typography fontWeight={600} color="text.primary" noWrap>
              {`${params.row.sold_quantity}/${params.row.prescribed_quantity}`}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(
                100,
                (params.row.sold_quantity / params.row.prescribed_quantity) *
                  100
              )}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  backgroundColor: params.row.isCompleted
                    ? theme.palette.success.main
                    : theme.palette.primary.main,
                },
              }}
            />
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "nextRefill",
      headerName: "Next Refill",
      flex: 1.5,
      renderCell: (params: any) => {
        const refillStatus = getRefillStatus(params.row);
        if (!refillStatus || !params.row.nextRefillDate)
          return <Typography color="text.secondary">-</Typography>;

        const statusColor =
          refillStatus.status === "overdue"
            ? theme.palette.error.main
            : refillStatus.status === "due_soon"
            ? theme.palette.warning.main
            : theme.palette.success.main;

        return (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: alpha(statusColor, 0.1),
              }}
            >
              <EventIcon sx={{ color: statusColor }} />
            </Box>
            <Box>
              <Typography
                fontWeight={700}
                color="text.primary"
                noWrap
                sx={{ fontSize: "1rem" }}
              >
                {format(parseISO(params.row.nextRefillDate), "MMM dd, yyyy")}
              </Typography>
              <Typography
                variant="body2"
                color={statusColor}
                noWrap
                sx={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {refillStatus.status === "overdue" ? (
                  <>
                    <WarningIcon fontSize="small" />
                    <span>{refillStatus.days} days overdue</span>
                  </>
                ) : refillStatus.status === "due_soon" ? (
                  <>
                    <WarningIcon fontSize="small" />
                    <span>Due in {refillStatus.days} days</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon fontSize="small" />
                    <span>In {refillStatus.days} days</span>
                  </>
                )}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => {
        const refillStatus = getRefillStatus(params.row);
        const isRefillDue = refillStatus && refillStatus.status === "overdue";

        if (params.row.isCompleted) {
          return (
            <Chip
              label="Completed"
              color="success"
              size="medium"
              icon={<CheckCircleIcon fontSize="small" />}
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            />
          );
        }
        if (isRefillDue) {
          return (
            <Chip
              label="Refill Due"
              color="error"
              size="medium"
              icon={<WarningIcon fontSize="small" />}
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            />
          );
        }
        return params.row.active ? (
          <Chip
            label="Active"
            color="primary"
            size="medium"
            sx={{
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          />
        ) : (
          <Chip
            label="Inactive"
            color="default"
            size="medium"
            sx={{
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 140,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={params.row.active ? "Deactivate" : "Activate"}>
            <IconButton
              color={params.row.active ? "secondary" : "success"}
              onClick={() => handleToggleActive(params.row)}
              disabled={params.row.isCompleted}
              sx={{
                backgroundColor: params.row.active
                  ? alpha(theme.palette.error.light, 0.2)
                  : alpha(theme.palette.success.light, 0.2),
                "&:hover": {
                  backgroundColor: params.row.active
                    ? alpha(theme.palette.error.main, 0.2)
                    : alpha(theme.palette.success.main, 0.2),
                },
              }}
            >
              {params.row.active ? <WarningIcon /> : <CheckCircleIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              onClick={() => handleEditPrescription(params.row)}
              disabled={params.row.isCompleted}
              sx={{
                backgroundColor: alpha(theme.palette.primary.light, 0.2),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => handleDeletePrescription(params.row)}
              sx={{
                backgroundColor: alpha(theme.palette.error.light, 0.2),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.2),
                  color: theme.palette.error.main,
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (isLoading)
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );

  if (isError)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error loading prescriptions. Please try again later.
        </Alert>
      </Box>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, position: "relative" }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                color="text.primary"
                mb={1}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PrescriptionIcon fontSize="large" color="primary" />
                  <span>Recurring Prescriptions</span>
                </Stack>
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track prescription status, refills, and completion notifications
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPrescription}
              sx={{
                height: "fit-content",
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                  boxShadow: "0 6px 20px rgba(46, 125, 50, 0.4)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Add Prescription
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search prescriptions..."
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
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  label="Filter by"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Prescriptions</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="refill_due">Refill Due</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Chip
                  label={`Active: ${
                    enrichedPrescriptions.filter(
                      (p) => p.active && !p.isCompleted
                    ).length
                  }`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Completed: ${
                    enrichedPrescriptions.filter((p) => p.isCompleted).length
                  }`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`Refill Due: ${
                    enrichedPrescriptions.filter((p) => {
                      const today = new Date();
                      const nextRefillDate = parseISO(p.nextRefillDate || "");
                      return (
                        isBefore(nextRefillDate, today) &&
                        p.active &&
                        !p.isCompleted
                      );
                    }).length
                  }`}
                  color="error"
                  variant="outlined"
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <DataTable
            rows={filteredPrescriptions}
            columns={columns}
            sx={{
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.light, 0.04),
                },
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: theme.palette.grey[50],
                fontWeight: 700,
                fontSize: "0.9rem",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              borderRadius: 4,
              border: "none",
            }}
          />
        </Paper>

        {/* Prescription Form Dialog */}
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              background: "linear-gradient(145deg, #ffffff, #f5f7fa)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              py: 2,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PrescriptionIcon />
              <Typography variant="h6">
                {selectedPrescription?.id
                  ? "Edit Prescription"
                  : "Add New Prescription"}
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ py: 4, px: 3 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "grey.50",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    mb={2}
                    color="primary.main"
                  >
                    Customer Information
                  </Typography>

                  <FormControl
                    fullWidth
                    error={!!formErrors.customer_id}
                    sx={{ mb: 3 }}
                  >
                    <InputLabel>Customer *</InputLabel>
                    <Select
                      value={selectedPrescription?.customer_id || ""}
                      onChange={(e) =>
                        setSelectedPrescription({
                          ...(selectedPrescription ||
                            ({} as RecurringPrescription)),
                          customer_id: e.target.value,
                        })
                      }
                      label="Customer *"
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      {customersLoading ? (
                        <MenuItem disabled>Loading customers...</MenuItem>
                      ) : (
                        customersData?.map((customer) => (
                          <MenuItem key={customer.id} value={customer.id}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                            >
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: "primary.light",
                                  color: "white",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {getInitials(
                                  `${customer.first_name} ${customer.last_name}`
                                )}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={500}>
                                  {customer.first_name} {customer.last_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {customer.phone}
                                </Typography>
                              </Box>
                            </Stack>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {formErrors.customer_id && (
                      <FormHelperText>{formErrors.customer_id}</FormHelperText>
                    )}
                  </FormControl>

                  <DatePicker
                    label="Start Date *"
                    value={
                      selectedPrescription?.start_date
                        ? parseISO(selectedPrescription.start_date)
                        : null
                    }
                    onChange={(date) =>
                      setSelectedPrescription({
                        ...(selectedPrescription ||
                          ({} as RecurringPrescription)),
                        start_date: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.start_date,
                        helperText: formErrors.start_date,
                        InputLabelProps: { shrink: true },
                        sx: { borderRadius: 2 },
                      },
                    }}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "grey.50",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    mb={2}
                    color="primary.main"
                  >
                    Prescription Details
                  </Typography>

                  <FormControl
                    fullWidth
                    error={!!formErrors.medicine_id}
                    sx={{ mb: 3 }}
                  >
                    <InputLabel>Medicine *</InputLabel>
                    <Select
                      value={selectedPrescription?.medicine_id || ""}
                      onChange={(e) =>
                        setSelectedPrescription({
                          ...(selectedPrescription ||
                            ({} as RecurringPrescription)),
                          medicine_id: e.target.value,
                        })
                      }
                      label="Medicine *"
                      startAdornment={
                        <InputAdornment position="start">
                          <MedicineIcon color="action" />
                        </InputAdornment>
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      {medicinesLoading ? (
                        <MenuItem disabled>Loading medicines...</MenuItem>
                      ) : (
                        medicinesData?.map((medicine) => (
                          <MenuItem key={medicine.id} value={medicine.id}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                            >
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: "secondary.light",
                                  color: "white",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {medicine.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={500}>
                                  {medicine.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {medicine.brand} · {medicine.category}
                                </Typography>
                              </Box>
                            </Stack>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {formErrors.medicine_id && (
                      <FormHelperText>{formErrors.medicine_id}</FormHelperText>
                    )}
                  </FormControl>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="Interval (Days) *"
                        type="number"
                        value={selectedPrescription?.interval_days || ""}
                        onChange={(e) =>
                          setSelectedPrescription({
                            ...(selectedPrescription ||
                              ({} as RecurringPrescription)),
                            interval_days: parseInt(e.target.value) || 0,
                          })
                        }
                        error={!!formErrors.interval_days}
                        helperText={formErrors.interval_days}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EventIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="Prescribed Qty *"
                        type="number"
                        value={selectedPrescription?.prescribed_quantity || ""}
                        onChange={(e) =>
                          setSelectedPrescription({
                            ...(selectedPrescription ||
                              ({} as RecurringPrescription)),
                            prescribed_quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        error={!!formErrors.prescribed_quantity}
                        helperText={formErrors.prescribed_quantity}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MedicationIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Sold Quantity"
                    type="number"
                    value={selectedPrescription?.sold_quantity || 0}
                    onChange={(e) =>
                      setSelectedPrescription({
                        ...(selectedPrescription ||
                          ({} as RecurringPrescription)),
                        sold_quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    error={!!formErrors.sold_quantity}
                    helperText={formErrors.sold_quantity}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CheckCircleIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              px: 4,
              py: 3,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outlined"
              sx={{
                fontWeight: 500,
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: "divider",
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSavePrescription}
              disabled={createMutation.isPending || updateMutation.isPending}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1,
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                boxShadow: "0 4px 8px rgba(76, 175, 80, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                  boxShadow: "0 6px 12px rgba(46, 125, 50, 0.4)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save Prescription"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, py: 2 }}>
            Confirm Deletion
          </DialogTitle>
          <DialogContent sx={{ py: 3, px: 3 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  bgcolor: "error.light",
                }}
              >
                <WarningIcon color="error" fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600} mb={0.5}>
                  Delete Prescription?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This action cannot be undone. All data will be permanently
                  removed.
                </Typography>
              </Box>
            </Stack>

            {selectedPrescription && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: `4px solid ${theme.palette.error.main}`,
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Prescription Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Customer
                    </Typography>
                    <Typography>
                      {selectedPrescription.customer_id
                        ? (() => {
                            const customer = customersData?.find(
                              (c) => c.id === selectedPrescription.customer_id
                            );
                            return customer
                              ? `${customer.first_name} ${customer.last_name}`
                              : "Unknown";
                          })()
                        : "Unknown"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Medicine
                    </Typography>
                    <Typography>
                      {selectedPrescription.medicine_id
                        ? medicinesData?.find(
                            (m) => m.id === selectedPrescription.medicine_id
                          )?.name
                        : "Unknown"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Interval
                    </Typography>
                    <Typography>
                      Every {selectedPrescription.interval_days} days
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Prescribed Qty
                    </Typography>
                    <Typography>
                      {selectedPrescription.prescribed_quantity}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              px: 4,
              py: 3,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outlined"
              sx={{
                fontWeight: 500,
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: "divider",
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1,
                background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
                boxShadow: "0 4px 8px rgba(244, 67, 54, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)",
                  boxShadow: "0 6px 12px rgba(211, 47, 47, 0.4)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {deleteMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Delete Prescription"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Prescriptions;
