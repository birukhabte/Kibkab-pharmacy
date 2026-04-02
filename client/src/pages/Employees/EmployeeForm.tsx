import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  InputAdornment,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

export type RoleOption = {
  id: string;
  name: string;
};

export type BranchOption = {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  created_at?: string;
};

export type EmployeeFormData = {
  branch_id?: string;
  role_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  password: string;
  active: boolean;
};

type EmployeeFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  initialValues?: Partial<EmployeeFormData>;
  roles?: RoleOption[];
  branches?: BranchOption[] | { branches: BranchOption[] };
  loadingRoles?: boolean;
  loadingBranches?: boolean;
};

const EmployeeForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  roles = [],
  branches,
  loadingRoles = false,
  loadingBranches = false,
}: EmployeeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<EmployeeFormData>();

  const watchBranchId = watch("branch_id");
  const watchRoleId = watch("role_id");

  const normalizedBranches = React.useMemo(() => {
    try {
      if (!branches) return [];
      if (typeof branches === "object" && "branches" in branches) {
        return Array.isArray(branches.branches) ? branches.branches : [];
      }
      return Array.isArray(branches) ? branches : [];
    } catch (error) {
      console.error("Error normalizing branches:", error);
      return [];
    }
  }, [branches]);

  const normalizedRoles = React.useMemo(() => {
    try {
      return Array.isArray(roles) ? roles : [];
    } catch (error) {
      console.error("Error normalizing roles:", error);
      return [];
    }
  }, [roles]);

  React.useEffect(() => {
    if (open) {
      reset({
        branch_id: initialValues?.branch_id || "",
        role_id: initialValues?.role_id || "",
        email: initialValues?.email || "",
        first_name: initialValues?.first_name || "",
        last_name: initialValues?.last_name || "",
        username: initialValues?.username || "",
        phone: initialValues?.phone || "",
        password: "",
        active: initialValues?.active ?? true,
      });
    }
  }, [open, initialValues, reset]);

  const handleFormSubmit = (data: EmployeeFormData) => {
    const payload = {
      ...data,
      branch_id: data.branch_id?.trim() || undefined,
    };
    onSubmit(payload);
  };

  const selectedBranch = normalizedBranches.find((b) => b.id === watchBranchId);
  const selectedRole = normalizedRoles.find((r) => r.id === watchRoleId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="body"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          background: "#f9fafc",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: "#2A4D6E",
          textAlign: "center",
          pt: 3,
          pb: 2,
          fontSize: "1.5rem",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)",
          position: "relative",
          "&:after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "5%",
            width: "90%",
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(42, 77, 110, 0.2), transparent)",
          },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center">
          <PersonIcon sx={{ mr: 1, color: "#2A4D6E" }} />
          {initialValues ? "Edit Employee" : "New Employee"}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              fullWidth
              variant="filled"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              {...register("first_name", {
                required: "First name is required",
                minLength: { value: 2, message: "Minimum 2 characters" },
              })}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              sx={{
                "& .MuiFilledInput-root": {
                  borderRadius: 1,
                  background: "rgba(255,255,255,0.8)",
                  "&:hover": {
                    background: "rgba(255,255,255,0.9)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(255,255,255,1)",
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              fullWidth
              variant="filled"
              size="medium"
              {...register("last_name", {
                required: "Last name is required",
                minLength: { value: 2, message: "Minimum 2 characters" },
              })}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              sx={{
                "& .MuiFilledInput-root": {
                  borderRadius: 1,
                  background: "rgba(255,255,255,0.8)",
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              fullWidth
              variant="filled"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phone"
              fullWidth
              variant="filled"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^[0-9+\-\s]+$/,
                  message: "Invalid phone number",
                },
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>

          {/* Account Information */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Username"
              fullWidth
              variant="filled"
              size="medium"
              {...register("username", {
                required: "Username is required",
                minLength: { value: 5, message: "Minimum 5 characters" },
              })}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={initialValues ? "New Password" : "Password"}
              type="password"
              fullWidth
              variant="filled"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
              {...register("password", {
                required: initialValues ? false : "Password is required",
                minLength: { value: 8, message: "Minimum 8 characters" },
              })}
              error={!!errors.password}
              helperText={errors.password?.message || " "}
            />
          </Grid>

          {/* Branch Selection */}
          <Grid size={12}>
            <Box mb={1}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ mb: 0.5 }}
              >
                <BusinessIcon
                  sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }}
                />
                Branch Assignment
              </Typography>
              {selectedBranch && (
                <Chip
                  label={`${selectedBranch.name}${
                    selectedBranch.location
                      ? ` (${selectedBranch.location})`
                      : ""
                  }`}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                  onDelete={() => reset({ ...watch(), branch_id: "" })}
                />
              )}
            </Box>
            <TextField
              select
              fullWidth
              variant="filled"
              size="medium"
              value={watchBranchId || ""}
              {...register("branch_id")}
              error={!!errors.branch_id}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      "& .MuiMenuItem-root": {
                        minHeight: 48,
                      },
                    },
                  },
                },
                renderValue: (selected: unknown): React.ReactNode => {
                  if (!selected) {
                    return <em>Select a branch</em>;
                  }
                  return (
                    selectedBranch?.name ??
                    (typeof selected === "string" ? selected : "")
                  );
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>Select a branch</em>
              </MenuItem>
              {loadingBranches ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  Loading branches...
                </MenuItem>
              ) : (
                normalizedBranches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <BusinessIcon sx={{ mr: 2, color: "action.active" }} />
                      <Box>
                        <Typography variant="body1">{branch.name}</Typography>
                        {branch.location && (
                          <Typography variant="caption" color="textSecondary">
                            {branch.location}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          {/* Role Selection */}
          <Grid size={12}>
            <Box mb={1}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ mb: 0.5 }}
              >
                <WorkIcon
                  sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }}
                />
                Role Assignment
              </Typography>
              {selectedRole && (
                <Chip
                  label={selectedRole.name}
                  color="secondary"
                  size="small"
                  sx={{ mb: 1 }}
                  onDelete={() => reset({ ...watch(), role_id: "" })}
                />
              )}
            </Box>
            <TextField
              select
              fullWidth
              variant="filled"
              size="medium"
              value={watchRoleId || ""}
              {...register("role_id", { required: "Role is required" })}
              error={!!errors.role_id}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      "& .MuiMenuItem-root": {
                        minHeight: 48,
                      },
                    },
                  },
                },
                renderValue: (selected: unknown): React.ReactNode => {
                  if (!selected) {
                    return <em>Select a role</em>;
                  }
                  return (
                    selectedRole?.name ??
                    (typeof selected === "string" ? selected : "")
                  );
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>Select a role</em>
              </MenuItem>
              {loadingRoles ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  Loading roles...
                </MenuItem>
              ) : (
                normalizedRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <WorkIcon sx={{ mr: 2, color: "action.active" }} />
                    {role.name}
                  </MenuItem>
                ))
              )}
            </TextField>
            {errors.role_id && (
              <FormHelperText error sx={{ ml: 1.5, mt: 0.5 }}>
                {errors.role_id.message}
              </FormHelperText>
            )}
          </Grid>

          {/* Active Status */}
          <Grid size={12}>
            <FormControlLabel
              control={
                <Checkbox
                  {...register("active")}
                  defaultChecked={initialValues?.active ?? true}
                  color="primary"
                  sx={{
                    "&.Mui-checked": {
                      color: "#4ECCA3",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Active Employee
                </Typography>
              }
              sx={{
                ml: 0,
                p: 1,
                borderRadius: 1,
                background: "rgba(255,255,255,0.7)",
                width: "fit-content",
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          background: "linear-gradient(to right, #f5f5f5 0%, #e0e0e0 100%)",
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Button
          onClick={onClose}
          variant="text"
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            color: "#2A4D6E",
            "&:hover": {
              background: "rgba(42, 77, 110, 0.08)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={!isDirty && !!initialValues}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            background: "linear-gradient(135deg, #2A4D6E 0%, #4ECCA3 100%)",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(42, 77, 110, 0.2)",
            "&:hover": {
              background: "linear-gradient(135deg, #1f3c52 0%, #3cb89c 100%)",
              boxShadow: "0 4px 12px rgba(42, 77, 110, 0.3)",
            },
            "&:disabled": {
              background: "#e0e0e0",
              color: "#a0a0a0",
              boxShadow: "none",
            },
          }}
        >
          {initialValues ? "Update Employee" : "Create Employee"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeForm;
