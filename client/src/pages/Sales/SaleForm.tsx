import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Divider,
  Paper,
  Avatar,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  LocalPharmacy as PharmacyIcon,
  Assignment as PrescriptionIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from "@mui/icons-material";
import { Sale, Medicine, RecurringPrescription } from "../../types/types";

interface SaleFormProps {
  sale: Sale | null;
  customers: any[];
  medicines: Medicine[];
  recurringPrescriptions: RecurringPrescription[];
  onSave: (data: Partial<Sale>) => void;
  onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({
  sale,
  customers = [],
  medicines = [],
  recurringPrescriptions = [],
  onSave,
  onCancel,
}) => {
  const theme = useTheme();
  const [customerId, setCustomerId] = useState(sale?.customer_id || "");
  const [recurringId, setRecurringId] = useState(sale?.recurring_id || "");
  const [items, setItems] = useState<
    { id: string; medicine_id: string; quantity: number }[]
  >(
    (sale?.items?.map((item) => ({
      id: item.id || `${Date.now()}`,
      medicine_id: item.medicine_id,
      quantity: item.quantity,
    })) as any) || []
  );
  const [customerRecurring, setCustomerRecurring] = useState<
    RecurringPrescription[]
  >([]);

  useEffect(() => {
    if (customerId) {
      const filtered = recurringPrescriptions.filter(
        (r) => r.customer_id === customerId
      );
      setCustomerRecurring(filtered);
      if (filtered.length === 1 && filtered[0].active && !recurringId) {
        setRecurringId(filtered[0].id);
      }
    } else {
      setCustomerRecurring([]);
      setRecurringId("");
    }
  }, [customerId, recurringPrescriptions]);

  useEffect(() => {
    if (recurringId) {
      const selectedPrescription = recurringPrescriptions.find(
        (r) => r.id === recurringId
      );
      if (selectedPrescription?.medicine_id) {
        setItems([
          {
            id: `${Date.now()}`,
            medicine_id: selectedPrescription.medicine_id,
            quantity: selectedPrescription.prescribed_quantity,
          },
        ]);
      }
    }
  }, [recurringId]);

  const handleAddItem = () => {
    setItems([...items, { id: `${Date.now()}`, medicine_id: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      customer_id: customerId || undefined,
      recurring_id: recurringId || undefined,
      items,
    });
  };

  const getSelectedCustomer = () => customers.find((c) => c.id === customerId);
  const getSelectedPrescription = () =>
    recurringPrescriptions.find((r) => r.id === recurringId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#2e7d32",
            fontWeight: 600,
          }}
        >
          <PersonIcon sx={{ mr: 1.5, color: "#2e7d32" }} />
          Customer Information
        </Typography>
        <Divider sx={{ mb: 3, borderColor: "#e0e0e0" }} />

        {/* Replaced Grid with Box flex layout */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ 
            width: "100%", 
            [theme.breakpoints.up("md")]: {
              width: customerId ? "calc(50% - 12px)" : "100%"
            } 
          }}>
            <FormControl fullWidth>
              <InputLabel
                id="customer-select-label"
                sx={{
                  color: "#616161",
                  "&.Mui-focused": {
                    color: "#2e7d32",
                  },
                }}
              >
                Select Customer (Optional)
              </InputLabel>
              <Select
                labelId="customer-select-label"
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value as string);
                  setRecurringId(""); // Reset recurring prescription when customer changes
                }}
                label="Select Customer (Optional)"
                sx={{
                  minWidth: 250,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2e7d32",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2e7d32",
                    borderWidth: "1px",
                  },
                }}
                renderValue={(selected) => {
                  if (!selected)
                    return (
                      <span style={{ color: "#9e9e9e" }}>
                        Select a customer (optional)
                      </span>
                    );
                  const customer = getSelectedCustomer();
                  return customer
                    ? `${customer.first_name} ${customer.last_name}`
                    : "";
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {customers.map((customer) => (
                  <MenuItem
                    key={customer.id}
                    value={customer.id}
                    sx={{ py: 1.5 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          mr: 2,
                          bgcolor: "#2e7d32",
                          color: "#ffffff",
                        }}
                      >
                        {customer.first_name.charAt(0)}
                        {customer.last_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ color: "#212121", fontWeight: 500 }}>
                          {customer.first_name} {customer.last_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#616161" }}>
                          {customer.email || customer.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {customerId && (
            <Box sx={{ 
              width: "100%", 
              [theme.breakpoints.up("md")]: {
                width: "calc(50% - 12px)"
              } 
            }}>
              <FormControl fullWidth>
                <InputLabel
                  id="prescription-select-label"
                  sx={{
                    color: "#616161",
                    "&.Mui-focused": {
                      color: "#2e7d32",
                    },
                  }}
                >
                  Recurring Prescription
                </InputLabel>
                <Select
                  labelId="prescription-select-label"
                  value={recurringId}
                  onChange={(e) => setRecurringId(e.target.value as string)}
                  label="Recurring Prescription"
                  disabled={customerRecurring.length === 0}
                  sx={{
                    minWidth: 250,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e7d32",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e7d32",
                      borderWidth: "1px",
                    },
                  }}
                  renderValue={(selected) => {
                    if (!selected)
                      return (
                        <span style={{ color: "#9e9e9e" }}>
                          No prescription selected
                        </span>
                      );
                    const prescription = getSelectedPrescription();
                    if (!prescription) return "";

                    const medicine = medicines.find(
                      (m) => m.id === prescription.medicine_id
                    );
                    return medicine
                      ? `${medicine.name} (${prescription.prescribed_quantity} every ${prescription.interval_days} days)`
                      : "";
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {customerRecurring.map((prescription) => {
                    const medicine = medicines.find(
                      (m) => m.id === prescription.medicine_id
                    );
                    return (
                      <MenuItem
                        key={prescription.id}
                        value={prescription.id}
                        sx={{ py: 1.5 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          {prescription.active ? (
                            <ActiveIcon sx={{ mr: 2, color: "#2e7d32" }} />
                          ) : (
                            <InactiveIcon sx={{ mr: 2, color: "#f44336" }} />
                          )}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              sx={{ color: "#212121", fontWeight: 500 }}
                            >
                              {medicine?.name || "Unknown Medicine"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                mt: 0.5,
                                flexWrap: "wrap",
                              }}
                            >
                              <Chip
                                label={`${prescription.prescribed_quantity} qty`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={`Every ${prescription.interval_days} days`}
                                size="small"
                                variant="outlined"
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: "#616161", ml: "auto" }}
                              >
                                Started {formatDate(prescription.start_date)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#2e7d32",
              fontWeight: 600,
            }}
          >
            <PharmacyIcon sx={{ mr: 1.5, color: "#2e7d32" }} />
            Sale Items
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            size="medium"
            disabled={!!recurringId}
            sx={{
              backgroundColor: "#2e7d32",
              "&:hover": {
                backgroundColor: "#1b5e20",
              },
              "&:disabled": {
                backgroundColor: "#e0e0e0",
                color: "#9e9e9e",
              },
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              py: 1,
            }}
          >
            Add Item
          </Button>
        </Box>
        <Divider sx={{ mb: 3, borderColor: "#e0e0e0" }} />

        {items.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              border: "1px dashed #e0e0e0",
              borderRadius: "8px",
              backgroundColor: "#fafafa",
            }}
          >
            <Typography sx={{ color: "#757575" }}>
              {customerId && customerRecurring.length > 0
                ? "Select a prescription or click 'Add Item' to add manually"
                : "No items added yet. Click 'Add Item' to start."}
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderColor: "#e0e0e0",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell
                    sx={{
                      width: "60%",
                      color: "#616161",
                      fontWeight: 600,
                    }}
                  >
                    Medicine
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      width: "30%",
                      color: "#616161",
                      fontWeight: 600,
                    }}
                  >
                    Quantity
                  </TableCell>
                  {!recurringId && (
                    <TableCell
                      align="center"
                      sx={{
                        width: "10%",
                        color: "#616161",
                        fontWeight: 600,
                      }}
                    >
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => {
                  const medicine = medicines.find(
                    (m) => m.id === item.medicine_id
                  );
                  return (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        "&:last-child td": { borderBottom: 0 },
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <TableCell>
                        {medicine ? (
                          <Typography
                            sx={{ color: "#212121", fontWeight: 500 }}
                          >
                            {medicine.name}
                          </Typography>
                        ) : (
                          <FormControl
                            fullWidth
                            required
                            sx={{ minWidth: 200 }}
                          >
                            <InputLabel
                              id={`medicine-label-${index}`}
                              sx={{
                                color: "#616161",
                                "&.Mui-focused": {
                                  color: "#2e7d32",
                                },
                              }}
                            >
                              Select Medicine
                            </InputLabel>
                            <Select
                              labelId={`medicine-label-${index}`}
                              value={item.medicine_id}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "medicine_id",
                                  e.target.value
                                )
                              }
                              label="Select Medicine"
                              disabled={!!recurringId}
                              sx={{
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#e0e0e0",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#2e7d32",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#2e7d32",
                                    borderWidth: "1px",
                                  },
                              }}
                            >
                              {medicines.map((medicine) => (
                                <MenuItem key={medicine.id} value={medicine.id}>
                                  <Typography sx={{ color: "#212121" }}>
                                    {medicine.name}
                                  </Typography>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          inputProps={{ min: 1 }}
                          sx={{ width: 120 }}
                          size="small"
                          variant="outlined"
                          disabled={!!recurringId}
                          InputProps={{
                            sx: {
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#e0e0e0",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#2e7d32",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#2e7d32",
                                },
                            },
                          }}
                        />
                      </TableCell>
                      {!recurringId && (
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleRemoveItem(index)}
                            size="medium"
                            sx={{
                              color: "#f44336",
                              "&:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.08)",
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          pt: 3,
        }}
      >
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            px: 4,
            py: 1.5,
            color: "#212121",
            borderColor: "#e0e0e0",
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              borderColor: "#bdbdbd",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={
            items.length === 0 || items.some((item) => !item.medicine_id)
          }
          sx={{
            px: 4,
            py: 1.5,
            backgroundColor: "#2e7d32",
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#1b5e20",
            },
            "&:disabled": {
              backgroundColor: "#e0e0e0",
              color: "#9e9e9e",
            },
          }}
        >
          {sale ? "Update Sale" : "Create Sale"}
        </Button>
      </Box>
    </Box>
  );
};

export default SaleForm;
