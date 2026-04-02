// src/types/stockTypes.ts

export interface Medicine {
    id: string;
    name: string;
    brand: string;
    category: string;
    description: string;
    created_at: string;
    updated_at: string | null;
  }
  
  export interface Branch {
    id: string;
    name: string;
    location: string;
    phone: string;
    created_at: string;
    updated_at: string | null;
  }
  
  export interface Stock {
    id: string;
    branch_id: string;
    medicine_id: string;
    expiry_date: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    created_at: string;
    updated_at: string | null;
    // Optional nested objects (if your API might include them in some responses)
    branch?: {
      id: string;
      name: string;
      location?: string;
      phone?: string;
    };
    medicine?: {
      id: string;
      name: string;
      brand?: string;
      category?: string;
    };
  }
  
  export interface ExpiringStock {
    id: string;
    branch_id: string;
    branch_name: string;
    medicine_id: string;
    medicine_name: string;
    expiry_date: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    remaining_days: number;
    created_at?: string;
    updated_at?: string | null;
  }
  
  export interface StockFormData {
    branch_id: string;
    medicine_id: string;
    expiry_date: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
  }
  
  // For API responses
  export interface StocksResponse {
    data: Stock[];
  }
  
  export interface ExpiringStocksResponse {
    data: ExpiringStock[];
  }
  
  export interface MedicineResponse {
    data: Medicine[];
  }
  
  export interface BranchResponse {
    branches: Branch[];
  }
  
  export interface CreateStockPayload {
    branch_id: string;
    medicine_id: string;
    expiry_date: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
  }
  
  export interface UpdateStockPayload {
    quantity?: number;
    selling_price?: number;
  }
