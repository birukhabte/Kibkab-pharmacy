import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";

const RecentSales = () => {
  const sales = [
    {
      id: 1,
      drug: "Paracetamol",
      quantity: 5,
      amount: "$25.00",
      time: "10:30 AM",
    },
    {
      id: 2,
      drug: "Amoxicillin",
      quantity: 2,
      amount: "$18.50",
      time: "11:45 AM",
    },
    {
      id: 3,
      drug: "Ibuprofen",
      quantity: 3,
      amount: "$15.75",
      time: "1:15 PM",
    },
    {
      id: 4,
      drug: "Omeprazole",
      quantity: 1,
      amount: "$12.99",
      time: "2:30 PM",
    },
  ];

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Paracetamol"))
      return <MedicationIcon color="primary" />;
    if (drugName.includes("Amoxicillin"))
      return <LocalHospitalIcon color="secondary" />;
    return <MedicalServicesIcon color="action" />;
  };

  return (
    <Box sx={{ height: "100%" }}>
      <Typography variant="h6" gutterBottom fontWeight={600} mb={2}>
        Recent Sales
      </Typography>
      <List sx={{ p: 0 }}>
        {sales.map((sale, index) => (
          <Box key={sale.id}>
            <ListItem
              sx={{
                px: 0,
                py: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  borderRadius: 1,
                },
              }}
            >
              <Box
                sx={{
                  mr: 2,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: "rgba(46, 125, 50, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {getDrugIcon(sale.drug)}
              </Box>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight={500}>
                    {sale.drug}
                  </Typography>
                }
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {sale.quantity} items
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sale.time}
                    </Typography>
                  </Stack>
                }
              />
              <Typography variant="body1" fontWeight={600} color="primary.main">
                {sale.amount}
              </Typography>
            </ListItem>
            {index < sales.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default RecentSales;
