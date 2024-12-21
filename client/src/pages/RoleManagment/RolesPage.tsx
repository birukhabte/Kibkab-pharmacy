import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  Fade,
  useTheme,
  IconButton,
  Collapse,
  Slide,
  Grow,
  Zoom,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  VerifiedUser as VerifiedUserIcon,
  Group as GroupIcon,
  Lock as LockIcon,
  Percent as PercentIcon,
  Description as DescriptionIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
  Role,
  Permission,
} from "../../service/roleService";
import Toast from "../../components/shared/Toast";

const PermissionsSection = ({
  permissions,
  selectedPermissions,
  onPermissionChange,
}) => {
  const [expanded, setExpanded] = useState(true);
  const theme = useTheme();

  return (
    <Box mt={3}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          cursor: "pointer",
          p: 1,
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[800]
              : theme.palette.grey[100],
          borderRadius: 1,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          display="flex"
          alignItems="center"
        >
          <AdminPanelSettingsIcon
            sx={{ mr: 1, color: theme.palette.primary.main }}
          />
          Permissions
        </Typography>
        <IconButton size="small">
          {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 1, p: 1 }}>
          {permissions.map((permission) => (
           <Grid size={{ xs: 12, sm: 6, md: 4 }} key={permission.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: selectedPermissions.includes(permission.id)
                    ? theme.palette.primary.light + "22"
                    : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: 1,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => onPermissionChange(permission.id)}
                      color="primary"
                      sx={{
                        "&.Mui-checked": {
                          color: theme.palette.primary.main,
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={500}>
                        {permission.name}
                      </Typography>
                      {permission.description && (
                        <Typography variant="body2" color="textSecondary">
                          {permission.description}
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{ width: "100%", m: 0 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Box>
  );
};

const RolesPage: React.FC = () => {
  const theme = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rolesData, permissionsData] = await Promise.all([
          fetchRoles(),
          fetchPermissions(),
        ]);
        setRoles(rolesData);
        setPermissions(permissionsData);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      commission: 0,
      permission_ids: [] as string[],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Role name is required"),
      description: Yup.string(),
      commission: Yup.number()
        .min(0, "Commission must be positive")
        .max(100, "Commission must be ≤ 100"),
      permission_ids: Yup.array().min(1, "Select at least one permission"),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        if (editMode) {
          const updatedRole = await updateRole(editMode, {
            name: values.name,
            description: values.description,
            commission: values.commission,
            permission_ids: values.permission_ids,
          });
          setRoles(roles.map((r) => (r.id === editMode ? updatedRole : r)));
          setToastMessage("Role updated successfully!");
          setShowSuccessToast(true);
        } else {
          const newRole = await createRole({
            name: values.name,
            description: values.description,
            commission: values.commission,
            permission_ids: values.permission_ids,
          });
          setRoles([...roles, newRole]);
          setToastMessage("Role created successfully!");
          setShowSuccessToast(true);
        }
        handleCloseModal();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Operation failed";
        setToastMessage(errorMessage);
        setShowErrorToast(true);
        console.error("API Error:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handlePermissionChange = (permissionId: string) => {
    const currentIndex = formik.values.permission_ids.indexOf(permissionId);
    const newPermissions = [...formik.values.permission_ids];

    if (currentIndex === -1) {
      newPermissions.push(permissionId);
    } else {
      newPermissions.splice(currentIndex, 1);
    }

    formik.setFieldValue("permission_ids", newPermissions);
  };

  const handleCreate = () => {
    setEditMode(null);
    setCurrentRole(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditMode(role.id);
    setCurrentRole(role);
    formik.setValues({
      name: role.name,
      description: role.description || "",
      commission: role.commission,
      permission_ids: role.permissions.map((p) => p.id),
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditMode(null);
    setCurrentRole(null);
    formik.resetForm();
  };

  const openDeleteDialog = (id: string) => {
    setRoleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      setIsDeleting(true);
      await deleteRole(roleToDelete);
      setRoles(roles.filter((role) => role.id !== roleToDelete));
      setToastMessage("Role deleted successfully!");
      setShowSuccessToast(true);
      closeDeleteDialog();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete role";
      setToastMessage(errorMessage);
      setShowErrorToast(true);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        textAlign="center"
      >
        <Paper sx={{ p: 4, maxWidth: 500, borderRadius: 3 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography paragraph>{error}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth={1600} margin="0 auto">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Role Management
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Create and manage user roles and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{
            background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
            boxShadow: "0 3px 5px 2px rgba(33, 150, 243, .3)",
            "&:hover": {
              boxShadow: "0 3px 8px 2px rgba(33, 150, 243, .5)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
            height: "50px",
            px: 4,
            fontSize: "1rem",
          }}
        >
          New Role
        </Button>
      </Box>

      {/* Success and Error Messages */}
      <Fade in={!!success || !!error}>
        <Box mb={3}>
          {success && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: theme.palette.success.light,
                color: theme.palette.success.contrastText,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 2,
              }}
            >
              <VerifiedUserIcon fontSize="large" />
              <Typography variant="body1" fontWeight={500}>
                {success}
              </Typography>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setSuccess(null)}
                sx={{ ml: "auto" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Paper>
          )}
          {error && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.contrastText,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 2,
              }}
            >
              <LockIcon fontSize="large" />
              <Typography variant="body1" fontWeight={500}>
                {error}
              </Typography>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setError(null)}
                sx={{ ml: "auto" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Paper>
          )}
        </Box>
      </Fade>

      {/* Roles List */}
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <GroupIcon color="primary" fontSize="large" />
              <span>Roles ({roles.length})</span>
            </Typography>
          </Stack>

          {roles.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: theme.palette.grey[50],
                borderRadius: 3,
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <VerifiedUserIcon
                sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
              />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Roles Found
              </Typography>
              <Typography color="textSecondary" mb={3}>
                Create your first role to get started
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{ mt: 1 }}
              >
                Create Role
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {roles.map((role) => (
                <Grid size={{ xs: 12 }} key={role.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                      },
                      overflow: "hidden",
                    }}
                  >
                    <Box p={2}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        sx={{ cursor: "pointer" }}
                        onClick={() => toggleRoleExpansion(role.id)}
                      >
                        <Box>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 36,
                                height: 36,
                                fontSize: "1rem",
                              }}
                            >
                              {role.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">
                              {role.name}
                            </Typography>
                            {role.commission > 0 && (
                              <Chip
                                label={`${role.commission}% commission`}
                                size="small"
                                color="secondary"
                                icon={<PercentIcon fontSize="small" />}
                                sx={{ fontWeight: "bold" }}
                              />
                            )}
                          </Box>
                          {role.description && (
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              mt={1}
                              ml={6}
                            >
                              <DescriptionIcon
                                fontSize="small"
                                sx={{ verticalAlign: "middle", mr: 0.5 }}
                              />
                              {role.description}
                            </Typography>
                          )}
                        </Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                        >
                          <IconButton
                            size="small"
                            onClick={() => toggleRoleExpansion(role.id)}
                          >
                            {expandedRole === role.id ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Edit role">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(role);
                                }}
                                sx={{
                                  backgroundColor: theme.palette.primary.light,
                                  "&:hover": {
                                    backgroundColor: theme.palette.primary.main,
                                    color: "white",
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete role">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(role.id);
                                }}
                                sx={{
                                  backgroundColor: theme.palette.error.light,
                                  "&:hover": {
                                    backgroundColor: theme.palette.error.main,
                                    color: "white",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Box>

                      <Collapse in={expandedRole === role.id}>
                        <Box mt={2} ml={6}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            mb={1}
                          >
                            Permissions:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {role.permissions.map((p) => (
                              <Tooltip
                                key={p.id}
                                title={p.description || p.name}
                                arrow
                              >
                                <Chip
                                  label={p.name}
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === "dark"
                                        ? theme.palette.grey[800]
                                        : theme.palette.grey[100],
                                    fontWeight: 500,
                                    borderRadius: 1,
                                  }}
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Role Form Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(145deg, #1a1a1a, #222222)"
                : "linear-gradient(145deg, #ffffff, #f5f5f5)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box
          sx={{
            background: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
            p: 2,
            textAlign: "center",
          }}
        >
          <DialogTitle
            sx={{
              color: "inherit",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: "2rem" }} />
            {editMode ? "Edit Role" : "Create New Role"}
          </DialogTitle>
        </Box>

        <DialogContent
          dividers
          sx={{ py: 4, maxHeight: "80vh", overflowY: "auto" }}
        >
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Role Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VerifiedUserIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="medium"
                  autoFocus
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Commission"
                  name="commission"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PercentIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                    inputProps: { min: 0, max: 100, step: 0.01 },
                  }}
                  value={formik.values.commission}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.commission &&
                    Boolean(formik.errors.commission)
                  }
                  helperText={
                    formik.touched.commission && formik.errors.commission
                  }
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <PermissionsSection
                  permissions={permissions}
                  selectedPermissions={formik.values.permission_ids}
                  onPermissionChange={handlePermissionChange}
                />
                {formik.touched.permission_ids &&
                  formik.errors.permission_ids && (
                    <Typography
                      color="error"
                      variant="caption"
                      display="block"
                      mt={1}
                      fontWeight={500}
                    >
                      {formik.errors.permission_ids}
                    </Typography>
                  )}
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseModal}
            startIcon={<CloseIcon />}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => formik.handleSubmit()}
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />
            }
            disabled={isSubmitting}
            sx={{
              background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 150, 243, .3)",
              "&:hover": {
                boxShadow: "0 3px 8px 2px rgba(33, 150, 243, .5)",
              },
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: "bold",
            }}
          >
            {editMode ? "Update Role" : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 500 } }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
        >
          <DeleteIcon color="error" sx={{ mr: 1, fontSize: 28 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this role?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This action cannot be undone. All users assigned to this role will
            lose their permissions.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeDeleteDialog}
            variant="outlined"
            disabled={isDeleting}
            sx={{ px: 3, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={
              isDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            disabled={isDeleting}
            sx={{ px: 3, borderRadius: 2, fontWeight: "bold" }}
          >
            {isDeleting ? "Deleting..." : "Delete Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notifications */}
      <Toast
        open={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message={toastMessage}
        severity="success"
        title="Success!"
      />
      <Toast
        open={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        message={toastMessage}
        severity="error"
        title="Error!"
      />
    </Box>
  );
};

export default RolesPage;

