import api from "../api/api";
import { Sale, Employee, Medicine, RecurringPrescription } from "../types/types";

// Helper function to extract error message
const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || "An unknown error occurred";
};

// Fetch all sales
export const getSales = async (): Promise<Sale[]> => {
  try {
    const response = await api.get('/sales');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Create a new sale
export const createSale = async (saleData: Partial<Sale>): Promise<Sale> => {
  try {
    const response = await api.post('/sales', {
      ...saleData,
      Status: 'pending'
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Update sale status (approve/cancel)
export const updateSaleStatus = async (
  saleId: string,
  statusData: {
    status: "completed" | "canceled";
    prices?: Array<{
      sale_item_id: string;
      selling_price: number;
    }>;
  }
): Promise<Sale> => {
  try {
    const response = await api.put(`/sales/${saleId}`, {
      Status: statusData.status,
      prices: statusData.prices
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Delete a sale
export const deleteSale = async (saleId: string): Promise<void> => {
  try {
    await api.delete(`/sales/${saleId}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Fetch all employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await api.get('/employees');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Fetch all medicines
export const getMedicines = async (): Promise<Medicine[]> => {
  try {
    const response = await api.get('/medicines');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Update a sale
export const updateSale = async (sale: Sale): Promise<Sale> => {
  try {
    const response = await api.put(`/sales/${sale.id}`, sale);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Fetch recurring prescriptions
export const getRecurringPrescriptions = async (): Promise<RecurringPrescription[]> => {
  try {
    const response = await api.get('/recurring');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
