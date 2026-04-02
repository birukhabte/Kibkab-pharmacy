import api from "../api/api";
import {
  Stock,
  ExpiringStock,
  StockFormData,
  Medicine,
  Branch,
} from "../types/stockTypes";

const STOCK_BASE_URL = "/stocks";

export const fetchStocks = async (branchId?: string): Promise<Stock[]> => {
  const params = branchId ? { branch_id: branchId } : {};
  const response = await api.get(STOCK_BASE_URL, { params });
  return response.data;
};

export const fetchExpiringStocks = async (
  branchId?: string
): Promise<ExpiringStock[]> => {
  const params = branchId ? { branch_id: branchId } : {};
  const response = await api.get(`${STOCK_BASE_URL}/expiring`, { params });
  return response.data;
};

export const createStock = async (stockData: StockFormData): Promise<Stock> => {
  console.log("stock date", stockData);
  const response = await api.post(STOCK_BASE_URL, stockData);
  return response.data;
};

export const updateStock = async (
  id: string,
  updateData: {
    quantity: number;
    purchase_price?: number;
    selling_price: number;
  }
): Promise<Stock> => {
  const response = await api.put(`${STOCK_BASE_URL}/${id}`, updateData);
  return response.data;
};

export const deleteStock = async (id: string): Promise<void> => {
  await api.delete(`${STOCK_BASE_URL}/${id}`);
};

export const fetchMedicines = async (): Promise<Medicine[]> => {
  const response = await api.get("/medicines");
  return response.data;
};

export const fetchBranches = async (): Promise<Branch[]> => {
  const response = await api.get("/branches");
  return response.data.branches ?? response.data;
};
