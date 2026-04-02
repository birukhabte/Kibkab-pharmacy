import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Typography,
} from "@mui/material";
import { Sale, Medicine } from "../../types/types";

interface ApproveSaleDialogProps {
  open: boolean;
  sale: Sale | null;
  medicines: Medicine[];
  onClose: () => void;
  onApprove: (prices: { sale_item_id: string; selling_price: number }[]) => void;
}

const ApproveSaleDialog: React.FC<ApproveSaleDialogProps> = ({
  open,
  sale,
  medicines,
  onClose,
  onApprove,
}) => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  const getMedicineName = (id: string) => {
    return medicines.find(m => m.id === id)?.name || "Unknown Medicine";
  };

  const handlePriceChange = (itemId: string, value: number) => {
    setPrices(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSubmit = () => {
    if (!sale) return;

    console.log("sale", sale)
    
    const priceEntries = sale.items.map(item => ({
      sale_item_id: item.id,
      selling_price: prices[item.medicine_id] || 0
    }));
    
    onApprove(priceEntries);
    setPrices({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Approve Sale</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Set final prices for each item
        </Typography>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Medicine</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sale?.items.map((item) => (
              <TableRow key={item.medicine_id}>
                <TableCell>{getMedicineName(item.medicine_id)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={prices[item.medicine_id] || ""}
                    onChange={(e) => 
                      handlePriceChange(item.medicine_id, parseFloat(e.target.value) || 0)
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Approve Sale
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApproveSaleDialog;
