
// Service functions
import api from "../api/api";

// Interfaces
interface Order {
  id: string;
  supplier_id: string;
  branch_id: string;
  employee_id: string;
  total: number;
  is_paid: boolean;
  status: "PENDING" | "APPROVED" | "CANCELED";
  order_date: string;
  due_date: string;
  created_at: string;
  supplier_name?: string;
  branch_name?: string;
}

interface Payment {
  id: string;
  order_id: string;
  payment_date: string;
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

// Fetch orders with optional filters
export const fetchOrders = async (filters?: {
  id?: string;
  paid?: boolean;
  status?: string;
}) => {
  const params: any = {};
  if (filters?.id) params.id = filters.id;
  if (filters?.paid !== undefined) params.paid = filters.paid;
  if (filters?.status) params.status = filters.status;
  
  const response = await api.get("/orders", { params });
  return response.data;
};

// Create a new order
export const createOrder = async (orderData: {
  supplier_id: string;
  branch_id: string;
  due_date: string;
  total: number;
}) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

// Create a payment for an order
export const createPayment = async (orderId: string, paymentAmount: number) => {
  const response = await api.post("/orders/pay", { 
    order_id: orderId, 
    payment_amount: paymentAmount 
  });
  return response.data;
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  status: "APPROVED" | "CANCELED"
) => {
  const response = await api.put("/orders", {
    order_id: orderId,
    status: status
  });
  return response.data;
};

// Fetch all suppliers
export const fetchSuppliers = async () => {
  const response = await api.get("/suppliers");
  return response.data;
};

// Fetch all branches
export const fetchBranches = async () => {
  const response = await api.get("/branches");
  return response.data.branches || [];
};

// Export types for use in components
export type { Order, Payment, Supplier, Branch };
