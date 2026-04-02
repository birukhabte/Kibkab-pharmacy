import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import { Warning, Inventory } from "@mui/icons-material";

const InventoryAlert = () => {
  const lowStockItems = [
    { name: "Aspirin", remaining: 5, threshold: 20 },
    { name: "Bandages", remaining: 8, threshold: 30 },
    { name: "Antiseptic", remaining: 12, threshold: 25 },
  ];

  return (
    <Box sx={{ height: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Inventory color="warning" />
        <Typography variant="h6" fontWeight={600}>
          Inventory Alerts
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {lowStockItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "warning.light",
              backgroundColor: "warning.50",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "warning.100",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="warning.dark"
              >
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.remaining}/{item.threshold}
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={1}>
              Low stock alert
            </Typography>

            <LinearProgress
              variant="determinate"
              value={(item.remaining / item.threshold) * 100}
              color="warning"
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "warning.100",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default InventoryAlert;
