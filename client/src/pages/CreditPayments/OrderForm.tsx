// src/components/orders/OrderForm.tsx
import React from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
  styled,
  Fade,
} from "@mui/material";
import type { BoxProps } from "@mui/material";
import { Grid } from "@mui/material";
import { Order, Supplier, Branch } from "../../service/orderService";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Styled components for premium UI
const StyledForm = styled(Box)<BoxProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: (theme.shape.borderRadius as number) * 3,
  padding: theme.spacing(4),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12)",
    transform: "translateY(-2px)",
  },
}));

const FormHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  color: theme.palette.primary.dark,
  fontWeight: 700,
  position: "relative",
  paddingBottom: theme.spacing(1.5),
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "60px",
    height: "4px",
    backgroundColor: theme.palette.primary.main,
    borderRadius: "2px",
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  "& .MuiSelect-select": {
    padding: theme.spacing(1.8, 2.5),
    fontSize: "0.9rem",
    borderRadius: "12px !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
    borderRadius: "12px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.light,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderWidth: "2px",
    borderColor: theme.palette.primary.main,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: theme.spacing(1.2, 3.5),
  fontWeight: 700,
  letterSpacing: "0.5px",
  minWidth: "140px",
  fontSize: "0.9rem",
  textTransform: "none",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
  },
}));

const InfoText = styled(Typography)(({ theme }) => ({
  fontSize: "0.8rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  fontWeight: 500,
}));

interface OrderFormProps {
  order?: Order | null;
  suppliers: Supplier[];
  branches: Branch[];
  onSave: (data: {
    supplier_id: string;
    branch_id: string;
    due_date: string;
    total: number;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  order,
  suppliers,
  branches,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = React.useState({
    supplier_id: order?.supplier_id || "",
    branch_id: order?.branch_id || "",
    total: order?.total || "",
    due_date: order?.due_date || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      supplier_id: formData.supplier_id,
      branch_id: formData.branch_id,
      total: Number(formData.total),
      due_date: formData.due_date,
    });
  };

  return (
    <Fade in={true} timeout={500}>
      <StyledForm component="form" onSubmit={handleSubmit}>
        <FormHeader variant="h5">
          {order ? "Edit Purchase Order" : "Create Purchase Order"}
        </FormHeader>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required>
              <InputLabel
                shrink
                sx={{ fontWeight: 600, color: "text.primary", ml: 0.5 }}
              >
                Supplier
              </InputLabel>
              <StyledSelect
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplier_id: e.target.value as string,
                  })
                }
                label="Supplier"
                disabled={isLoading}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 320,
                      marginTop: 8,
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <Typography color="textSecondary">
                    Select a supplier
                  </Typography>
                </MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem
                    key={supplier.id}
                    value={supplier.id}
                    sx={{ py: 1.5 }}
                  >
                    <Box>
                      <Typography fontWeight={600} variant="subtitle1">
                        {supplier.name}
                      </Typography>
                      <Box display="flex" flexDirection="column" mt={0.5}>
                        <InfoText>
                          {(supplier as any).contact_email ||
                            (supplier as any).email}
                        </InfoText>
                        <InfoText>
                          {(supplier as any).contact_phone ||
                            (supplier as any).phone}
                        </InfoText>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required>
              <InputLabel
                shrink
                sx={{ fontWeight: 600, color: "text.primary", ml: 0.5 }}
              >
                Branch
              </InputLabel>
              <StyledSelect
                value={formData.branch_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branch_id: e.target.value as string,
                  })
                }
                label="Branch"
                disabled={isLoading}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 320,
                      marginTop: 8,
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <Typography color="textSecondary">Select a branch</Typography>
                </MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id} sx={{ py: 1.5 }}>
                    <Box>
                      <Typography fontWeight={600} variant="subtitle1">
                        {branch.name}
                      </Typography>
                      <InfoText>{branch.address}</InfoText>
                    </Box>
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Total Amount (ETB)"
              type="number"
              value={formData.total}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total: e.target.value,
                })
              }
              required
              inputProps={{ min: 0, step: 0.01 }}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  paddingLeft: 1,
                  borderRadius: "12px",
                },
              }}
              InputLabelProps={{
                shrink: true,
                sx: { ml: 0.5 },
              }}
              placeholder="Enter amount"
              sx={{
                "& .MuiInputBase-input": {
                  paddingLeft: 1,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              required
              InputLabelProps={{
                shrink: true,
                sx: { ml: 0.5 },
              }}
              disabled={isLoading}
              sx={{
                "& .MuiInputBase-input": {
                  padding: "16.5px 14px",
                  borderRadius: "12px",
                },
              }}
            />
          </Grid>
        </Grid>

        <Box
          sx={{ mt: 5, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <ActionButton
            onClick={onCancel}
            disabled={isLoading}
            variant="outlined"
            color="secondary"
            sx={{
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                backgroundColor: "action.hover",
                borderColor: "text.secondary",
              },
            }}
          >
            Cancel
          </ActionButton>
          <ActionButton
            type="submit"
            variant="contained"
            disabled={isLoading}
            color="primary"
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #0b3d91 100%)",
              },
            }}
          >
            {isLoading
              ? "Processing..."
              : order
              ? "Update Order"
              : "Create Order"}
          </ActionButton>
        </Box>
      </StyledForm>
    </Fade>
  );
};

export default OrderForm;
