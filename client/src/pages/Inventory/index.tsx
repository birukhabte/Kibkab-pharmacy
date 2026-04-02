import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add, Search, FilterList, Refresh } from "@mui/icons-material";
import DataTable from "@/components/shared/DataTable";
import Toast from "@/components/shared/Toast";
import {
  inventoryService,
  Medicine,
  Stock,
} from "../../service/inventoryService";
import DrugForm from "./DrugForm"; // Import the simplified DrugForm

interface InventoryItem extends Medicine {
  totalStock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  branches: {
    branch_id: string;
    quantity: number;
    expiry_date: string;
  }[];
}

const InventoryPage = () => {
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Transform API data to inventory items
  const transformToInventoryItems = (
    medicines: Medicine[],
    stocks: Stock[]
  ): InventoryItem[] => {
    return medicines.map((medicine) => {
      const medicineStocks = stocks.filter(
        (stock) => stock.medicine_id === medicine.id
      );
      const totalStock = medicineStocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );

      return {
        ...medicine,
        totalStock,
        status: getStockStatus(totalStock),
        branches: medicineStocks.map((stock) => ({
          branch_id: stock.branch_id,
          quantity: stock.quantity,
          expiry_date: stock.expiry_date,
        })),
      };
    });
  };

  const getStockStatus = (
    quantity: number
  ): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (quantity === 0) return "Out of Stock";
    if (quantity < 10) return "Low Stock";
    return "In Stock";
  };

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [medicines, stocks] = await Promise.all([
          inventoryService.getMedicines(),
          inventoryService.getStocks(),
        ]);

        const inventoryItems = transformToInventoryItems(medicines, stocks);
        setInventory(inventoryItems);
      } catch (err) {
        console.error("Failed to load inventory data:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load inventory data";
        setError(errorMessage);
        setToastMessage(errorMessage);
        setShowErrorToast(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  // Filter inventory based on search term
  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory;

    const term = searchTerm.toLowerCase();
    return inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.brand && item.brand.toLowerCase().includes(term)) ||
        item.category.toLowerCase().includes(term)
    );
  }, [inventory, searchTerm]);

  const columns = [
    {
      field: "name",
      headerName: "Medicine Name",
      flex: 1.2,
      renderCell: (params: any) => (
        <Stack>
          <Typography fontWeight={700} color="text.primary">
            {params.value}
          </Typography>
          {params.row.brand && (
            <Typography variant="body2" color="text.secondary">
              {params.row.brand}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: "primary.50",
            color: "primary.main",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "totalStock",
      headerName: "Stock",
      flex: 0.8,
      renderCell: (params: any) => (
        <Typography
          fontWeight={700}
          color={
            params.value === 0
              ? "error.main"
              : params.value < 10
              ? "warning.main"
              : "success.main"
          }
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={
            params.value === "Out of Stock"
              ? "error"
              : params.value === "Low Stock"
              ? "warning"
              : "success"
          }
          size="small"
          sx={{
            fontWeight: 700,
            minWidth: "100px",
          }}
        />
      ),
    },
  ];

  const handleCreateMedicine = async (medicineData: any) => {
    try {
      setError(null);
      const newMedicine = await inventoryService.createMedicine({
        ...medicineData,
        description: medicineData.description || "",
      });

      setInventory((prev) => [
        {
          ...newMedicine,
          totalStock: 0,
          status: "Out of Stock",
          branches: [],
        },
        ...prev,
      ]);
      setOpenForm(false);
      setShowSuccessToast(true);
    } catch (err) {
      console.error("Failed to add new medicine:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add new medicine";
      setError(errorMessage);
      setToastMessage(errorMessage);
      setShowErrorToast(true);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress size={60} />
        <Typography variant="body1" ml={2}>
          Loading inventory...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={handleRefresh}
          startIcon={<Refresh />}
        >
          Reload Inventory
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: 3,
          mb: 4,
          background: "linear-gradient(145deg, #f5f7ff, #eef2ff)",
          border: "1px solid #e0e7ff",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              mb={1}
              color="primary.main"
            >
              Medicine Inventory
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage pharmaceutical products and stock levels
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(94, 114, 228, 0.25)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(94, 114, 228, 0.35)",
              },
            }}
          >
            Add New Medicine
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search medicines, brands, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                backgroundColor: "background.paper",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              },
            }}
          />
          <Tooltip title="Advanced filters">
            <IconButton
              sx={{
                p: 1.5,
                backgroundColor: "primary.50",
                color: "primary.main",
                borderRadius: 3,
                "&:hover": {
                  backgroundColor: "primary.100",
                },
              }}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh inventory">
            <IconButton
              onClick={handleRefresh}
              sx={{
                p: 1.5,
                backgroundColor: "grey.100",
                borderRadius: 3,
                "&:hover": {
                  backgroundColor: "grey.200",
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      <DataTable
        rows={filteredInventory}
        columns={columns}
        loading={loading}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "primary.50",
            borderRadius: 3,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
          },
        }}
      />

      <DrugForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCreateMedicine}
      />

      <Toast
        open={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="New medicine added successfully!"
        severity="success"
        title="Success!"
      />
      <Toast
        open={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        message={toastMessage || "An error occurred."}
        severity="error"
        title="Error!"
      />
    </Box>
  );
};

export default InventoryPage;
