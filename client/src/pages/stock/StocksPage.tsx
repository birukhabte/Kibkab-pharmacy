import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip,
  Chip,
  Avatar,
  useTheme,
  Fade,
} from "@mui/material";
import { Grid } from "@mui/material";

import {
  Add,
  Edit,
  Delete,
  Warning,
  Medication as MedicationIcon,
  CheckCircle,
} from "@mui/icons-material";
import {
  fetchStocks,
  fetchExpiringStocks,
  createStock,
  updateStock,
  deleteStock,
  fetchBranches,
  fetchMedicines,
} from "../../service/stockService";
import StockForm from "./StockForm";
import { Stock, ExpiringStock, Branch, Medicine } from "../../types/stockTypes";

// Define form data type with explicit number types
interface StockFormData {
  medicine_id: string;
  branch_id: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
}

const StocksPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [expiringStocks, setExpiringStocks] = useState<ExpiringStock[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const theme = useTheme();

  // Toast notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Create lookup maps for branches and medicines
  const branchMap = useMemo(() => {
    return (
      branches?.reduce((map, branch) => {
        map[branch.id] = branch;
        return map;
      }, {} as Record<string, Branch>) || {}
    );
  }, [branches]);

  const medicineMap = useMemo(() => {
    return (
      medicines?.reduce((map, medicine) => {
        map[medicine.id] = medicine;
        return map;
      }, {} as Record<string, Medicine>) || {}
    );
  }, [medicines]);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [branchesData, medicinesData] = await Promise.all([
          fetchBranches(),
          fetchMedicines(),
        ]);

        setBranches(branchesData || []);
        setMedicines(medicinesData || []);

        const [stocksData, expiringData] = await Promise.all([
          fetchStocks(),
          fetchExpiringStocks(),
        ]);

        setStocks(stocksData || []);
        setExpiringStocks(expiringData || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load stock data";
        showNotification(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBranchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const branchId = e.target.value;
    setSelectedBranch(branchId);

    try {
      setLoading(true);

      const [stocksData, expiringData] = await Promise.all([
        fetchStocks(branchId || undefined),
        fetchExpiringStocks(branchId || undefined),
      ]);

      setStocks(stocksData || []);
      setExpiringStocks(expiringData || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to filter stock data";
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStock = async (stockData: StockFormData) => {
    try {
      const newStock = await createStock({
        ...stockData,
        quantity: Number(stockData.quantity),
        purchase_price: Number(stockData.purchase_price),
        selling_price: Number(stockData.selling_price),
      });
      setStocks((prev) => [...prev, newStock]);
      showNotification("Stock added successfully!", "success");
      setFormOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add stock";
      showNotification(errorMessage, "error");
    }
  };

  const handleUpdateStock = async (stockData: StockFormData) => {
    if (!editingStock) return;

    try {
      const updatedStock = await updateStock(editingStock.id, {
        quantity: Number(stockData.quantity),
        purchase_price: Number(stockData.purchase_price),
        selling_price: Number(stockData.selling_price),
      });

      setStocks((prev) =>
        prev.map((stock) =>
          stock.id === editingStock.id ? updatedStock : stock
        )
      );

      showNotification("Stock updated successfully!", "success");
      setFormOpen(false);
      setEditingStock(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update stock";
      showNotification(errorMessage, "error");
    }
  };

  const handleDeleteStock = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this stock record?")) {
      try {
        await deleteStock(id);
        setStocks((prev) => prev.filter((stock) => stock.id !== id));
        showNotification("Stock deleted successfully!", "success");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete stock";
        showNotification(errorMessage, "error");
      }
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30)
      return { color: "error", label: `Expiring in ${diffDays} days` };
    if (diffDays <= 90)
      return { color: "warning", label: `Expiring in ${diffDays} days` };
    return { color: "success", label: "Valid" };
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Grid container justifyContent="space-between" alignItems="center" mb={4}>
        <Grid>
          <Typography variant="h4" fontWeight="bold" color="#2e7d32">
            Medicine Stock Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage and track your pharmacy inventory
          </Typography>
        </Grid>

        <Grid>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
            sx={{
              bgcolor: "#2e7d32",
              "&:hover": { bgcolor: "#1b5e20" },
              color: "white",
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            Add New Stock
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Main Stock Table */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={3}
            sx={{ borderRadius: "16px", overflow: "hidden" }}
          >
            <Box
              sx={{
                bgcolor: "#2e7d32",
                color: "white",
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Current Stock</Typography>
              <TextField
                select
                value={selectedBranch}
                onChange={handleBranchChange}
                variant="outlined"
                size="small"
                sx={{
                  bgcolor: "white",
                  borderRadius: "4px",
                  minWidth: 200,
                }}
              >
                <MenuItem value="">All Branches</MenuItem>
                {branches?.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={60} color="success" />
              </Box>
            ) : !stocks || stocks.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                  No stock records found
                </Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#e8f5e9" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Medicine
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Branch</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Expiry</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="right">
                        Qty
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="right">
                        Buy Price
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }} align="right">
                        Sell Price
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stocks?.map((stock) => {
                      const branch = branchMap[stock.branch_id];
                      const medicine = medicineMap[stock.medicine_id];
                      const expiryStatus = getExpiryStatus(stock.expiry_date);

                      return (
                        <TableRow key={stock.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                sx={{
                                  bgcolor: "#e8f5e9",
                                  color: "#2e7d32",
                                  mr: 2,
                                }}
                              >
                                <MedicationIcon />
                              </Avatar>
                              <Box>
                                <Typography fontWeight="medium">
                                  {medicine?.name || "Unknown Medicine"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  ID: {stock.medicine_id.substring(0, 8)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {branch?.name || "Unknown Branch"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={expiryStatus.label}
                              color={expiryStatus.color as any}
                              size="small"
                            />
                            <Typography variant="body2" mt={0.5}>
                              {new Date(stock.expiry_date).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="medium">
                              {stock.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            ETB {stock.purchase_price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="medium" color="#2e7d32">
                              ETB {stock.selling_price.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton
                                onClick={() => {
                                  setEditingStock(stock);
                                  setFormOpen(true);
                                }}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                onClick={() => handleDeleteStock(stock.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Expiring Stocks Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={3}
            sx={{ borderRadius: "16px", overflow: "hidden" }}
          >
            <Box
              sx={{
                bgcolor: theme.palette.warning.dark,
                color: "white",
                p: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Warning sx={{ mr: 1 }} />
              <Typography variant="h6">
                Expiring Soon (within 3 months)
              </Typography>
            </Box>

            {!expiringStocks || expiringStocks.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                  No expiring medicines found
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: "600px", overflowY: "auto" }}>
                {expiringStocks?.map((stock) => (
                  <Box
                    key={stock.id}
                    sx={{
                      p: 2,
                      borderBottom: "1px solid #eee",
                      "&:hover": { bgcolor: "#fffde7" },
                    }}
                  >
                    <Grid container alignItems="center">
                      <Grid size={8}>
                        <Typography fontWeight="medium">
                          {stock.medicine_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stock.branch_name}
                        </Typography>
                      </Grid>
                      <Grid size={4} textAlign="right">
                        <Chip
                          label={`${stock.remaining_days} days`}
                          color="warning"
                          size="small"
                        />
                      </Grid>
                    </Grid>

                    <Grid container mt={1} spacing={1}>
                      <Grid size={6}>
                        <Typography variant="body2">
                          Expiry:{" "}
                          {new Date(stock.expiry_date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid size={6} textAlign="right">
                        <Typography variant="body2" fontWeight="medium">
                          Qty: {stock.quantity}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box mt={1} display="flex" justifyContent="space-between">
                      <Typography variant="body2">
                        Buy: ETB {stock.purchase_price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        Sell: ETB {stock.selling_price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Stock Form Modal */}
      <StockForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingStock(null);
        }}
        onSubmit={editingStock ? handleUpdateStock : handleCreateStock}
        initialData={editingStock}
      />

      {/* Toast Notification */}
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

export default StocksPage;
