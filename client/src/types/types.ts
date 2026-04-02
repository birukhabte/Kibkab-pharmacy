export interface EmployeeOverview {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  hireDate: string;
  avatar?: string;
  totalSales: number;
  commissionEarned: number;
  salesCount: number;
  isActive: boolean;
  branchId?: string;
  roleId?: string;
}

export interface CustomerOverview {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  prescriptionCount: number;
  lastVisit: string;
  isActive: boolean;
  loyaltyPoints?: number;
}

export interface Drug {
  id: string;
  name: string;
  genericName: string;
  category: string;
  strength: string;
  form: string;
  manufacturer: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  expiryDate: string;
  requiresPrescription: boolean;
  isActive: boolean;
  barcode?: string;
  batchNumber?: string;
}

export interface Prescription {
  id: string;
  customerId: string;
  customerName: string;
  drugId: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  prescribedDate: string;
  refillsRemaining: number;
  totalRefills: number;
  isActive: boolean;
  isCompleted: boolean;
  completionDate?: string;
  nextRefillDate?: string;
  refillInterval?: number;
  notes?: string;
  status?: "active" | "completed" | "cancelled";
}

export interface RecentSale {
  id: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  branchId?: string;
  branchName?: string;
  items: RecentSaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "credit" | "card" | "mobile";
  saleDate: string;
  prescriptionId?: string;
  status?: "completed" | "returned" | "refunded";
  notes?: string;
}

export interface RecentSaleItem {
  id: string;
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  requiresPrescription: boolean;
  batchNumber?: string;
  expiryDate?: string;
}

export interface CompanyCreditPayment {
  id: string;
  supplierName: string;
  supplierPhone: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  drugsReceived: string[];
  paymentMethod?: string;
  referenceNumber?: string;
  // Optional fields used in UI
  branchName?: string;
  status?: string;
}

export interface Commission {
  id: string;
  employeeId: string;
  employeeName: string;
  salesAmount: number;
  commissionAmount: number;
  period: string; // e.g. "2023-04" for April 2023
  isPaid: boolean;
  paidDate?: string;
  createdAt: string;
  paymentMethod?: string;
  referenceNumber?: string;
}

export interface Notification {
  id: string;
  type:
    | "prescription_complete"
    | "prescription_refill_due"
    | "company_credit_due"
    | "low_stock"
    | "commission_earned"
    | "inventory_alert"
    | "expiry_alert";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  customerId?: string;
  customerName?: string;
  refillDate?: string;
  priority?: "low" | "medium" | "high";
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalCustomers: number;
  totalEmployees: number;
  totalDrugs: {
    count: number;
    totalQuantity: number;
  };
  pendingPrescriptions: number;
  duePayments: number;
  lowStockItems: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  topSellingDrugs: Array<{
    drugId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  topEmployees: Array<{
    employeeId: string;
    name: string;
    salesCount: number;
    revenueGenerated: number;
  }>;
  refillReminders: number;
  expiringSoon: number;
  salesTrend: Array<{
    date: string;
    amount: number;
  }>;
  customerGrowth: number;
  inventoryValue: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  managerId?: string;
  isActive: boolean;
  openingHours?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  description?: string;
}

export interface InventoryMovement {
  id: string;
  drugId: string;
  drugName: string;
  quantity: number;
  type: "purchase" | "sale" | "transfer" | "adjustment" | "return";
  referenceId?: string;
  date: string;
  branchId?: string;
  notes?: string;
  performedBy?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  drugsSupplied: string[];
  paymentTerms?: string;
  isActive: boolean;
}

export interface Sale {
  id: string;
  customer_id: string;
  employee_id: string;
  branch_id: string;
  recurring_id?: string;
  Status: "pending" | "completed" | "canceled";
  sale_date: string;
  total_price?: number;
  items: Array<{
    id: string;
    medicine_id: string;
    quantity: number;
    selling_price?: number;
  }>;
  // Optional denormalized fields for dashboard UI
  customer_name?: string;
  employee_name?: string;
  branch_name?: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  email: string;
  phone: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  quantity: number;
  expiry_date: string;
  manufacturer: string;
}

export interface RecurringPrescription {
  id: string;
  customer_id: string;
  medicine_id: string;
  quantity: number;
  frequency: string;
  status: "active" | "inactive";
  start_date: string;
  end_date?: string;
  // Optional fields used by UI
  active?: boolean;
  prescribed_quantity?: number;
  interval_days?: number;
}

export interface RefillReminder {
  customer_id: string;
  customer_name: string;
  medicine_id: string;
  medicine_name: string;
  next_due_date: string;
  days_left: number;
}
