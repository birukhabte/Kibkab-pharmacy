import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Medication as MedicationIcon } from "@mui/icons-material";
import { fetchMedicines, fetchBranches } from "../../service/stockService";
import { StockFormData, Medicine, Branch, Stock } from "../../types/stockTypes";

interface StockFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (stockData: StockFormData) => void;
  initialData?: Stock | null;
}

const StockForm: React.FC<StockFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<StockFormData>({
    branch_id: "",
    medicine_id: "",
    expiry_date: new Date().toISOString(),
    purchase_price: 0,
    selling_price: 0,
    quantity: 1,
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [meds, brs] = await Promise.all([
          fetchMedicines(),
          fetchBranches(),
        ]);
        setMedicines(meds);
        setBranches(brs);

        if (initialData) {
          setFormData({
            branch_id: initialData.branch_id,
            medicine_id: initialData.medicine_id,
            expiry_date: initialData.expiry_date,
            purchase_price: initialData.purchase_price,
            selling_price: initialData.selling_price,
            quantity: initialData.quantity,
          });
        } else {
          // Reset form when opening for new entry
          setFormData({
            branch_id: "",
            medicine_id: "",
            expiry_date: new Date().toISOString(),
            purchase_price: 0,
            selling_price: 0,
            quantity: 1,
          });
        }
      } catch (err) {
        setError("Failed to load required data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchData();
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({ ...formData, expiry_date: date.toISOString() });
    }
  };

  const handleSubmit = () => {
    setError("");
    if (!formData.branch_id || !formData.medicine_id) {
      setError("Branch and Medicine selection are required");
      return;
    }

    const expiryDate = new Date(formData.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      setError("Expiry date must be in the future");
      return;
    }

    if (formData.purchase_price < 0 || formData.selling_price < 0) {
      setError("Prices cannot be negative");
      return;
    }

    if (formData.quantity <= 0) {
      setError("Quantity must be at least 1");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
          overflow: "visible",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          py: 1,
          px: 3,
          //   my: 3,
          display: "flex",
          alignItems: "center",
          borderTopLeftRadius: "inherit",
          borderTopRightRadius: "inherit",
        }}
      >
        <MedicationIcon sx={{ mr: 1.5, fontSize: "1.8rem" }} />
        <Typography variant="h6" fontWeight="600">
          {initialData ? "Update Stock Entry" : "Create New Stock Entry"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ py: 3, px: 3, my: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={40} color="primary" />
            <Typography variant="body1" ml={2} alignSelf="center">
              Loading inventory data...
            </Typography>
          </Box>
        ) : error ? (
          <Typography color="error" align="center" py={2} fontWeight="500">
            {error}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {/* Branch Selection */}
           <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel
                  shrink
                  sx={{ fontWeight: "600", color: "text.primary", my: 2 }}
                >
                  Branch Location
                </InputLabel>
                <Select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branch_id: e.target.value as string,
                    })
                  }
                  label="Branch Location"
                  required
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        minWidth: 300,
                      },
                    },
                  }}
                  sx={{
                    mt: 2,
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                >
                  <MenuItem disabled value="">
                    <em>Select a branch</em>
                  </MenuItem>
                  {branches.map((branch) => (
                    <MenuItem
                      key={branch.id}
                      value={branch.id}
                      sx={{ py: 1.5 }}
                    >
                      <Box>
                        <Typography fontWeight="600">{branch.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {branch.location}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Medicine Selection */}
           <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel
                  shrink
                  sx={{ fontWeight: "600", color: "text.primary", my: 2 }}
                >
                  Medicine
                </InputLabel>
                <Select
                  name="medicine_id"
                  value={formData.medicine_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medicine_id: e.target.value as string,
                    })
                  }
                  label="Medicine"
                  required
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        minWidth: 300,
                      },
                    },
                  }}
                  sx={{ mt: 2 }}
                >
                  <MenuItem disabled value="">
                    <em>Select a medicine</em>
                  </MenuItem>
                  {medicines.map((medicine) => (
                    <MenuItem
                      key={medicine.id}
                      value={medicine.id}
                      sx={{ py: 1.5 }}
                    >
                      <Box>
                        <Typography fontWeight="600">
                          {medicine.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {medicine.brand} • {medicine.category}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Expiry Date */}
           <Grid size={{ xs: 12, md: 6 }}>
              <Box mt={0.5}>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  mb={1}
                  color="text.primary"
                >
                  Expiry Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    format="MM/dd/yyyy"
                    value={new Date(formData.expiry_date)}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        InputProps: {
                          sx: {
                            "& input": { py: "13.5px" },
                            borderRadius: 1,
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>

            {/* Quantity */}
           <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 1 },
                  sx: { borderRadius: 1 },
                }}
                sx={{ mt: 0.5 }}
              />
            </Grid>

            {/* Prices */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="purchase_price"
                label="Purchase Price ($)"
                type="number"
                fullWidth
                value={formData.purchase_price}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: (
                    <Typography sx={{ mr: 1, color: "text.secondary" }}>
                      $
                    </Typography>
                  ),
                  sx: { borderRadius: 1 },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="selling_price"
                label="Selling Price ($)"
                type="number"
                fullWidth
                value={formData.selling_price}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: (
                    <Typography sx={{ mr: 1, color: "text.secondary" }}>
                      $
                    </Typography>
                  ),
                  sx: { borderRadius: 1 },
                }}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          py: 2,
          px: 3,
          bgcolor: "grey.50",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            px: 3,
            py: 1,
            borderRadius: 1,
            fontWeight: "600",
            borderWidth: 2,
            "&:hover": { borderWidth: 2 },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disableElevation
          sx={{
            px: 3,
            py: 1,
            borderRadius: 1,
            fontWeight: "600",
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          {initialData ? "Update Stock" : "Create Stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockForm;
