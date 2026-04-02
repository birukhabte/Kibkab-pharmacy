import api from "../api/api";
import {
  Employee,
  Sale,
  CompanyCreditPayment,
  Notification,
  DashboardStats,
  RefillReminder,
} from "../types/types";

interface DashboardData {
  sales: Sale[];
  employees: Employee[];
  prescriptions: number;
  creditPayments: CompanyCreditPayment[];
  refillReminders: RefillReminder[];
  stats: DashboardStats;
  notifications: Notification[];
}

const getRecentSales = async (): Promise<Sale[]> => {
  try {
    const response = await api.get<Sale[]>("/reports/recent-sales");
    return response.data;
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    return [];
  }
};

const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await api.get<Employee[]>("/employees");
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

const getActivePrescriptions = async (): Promise<number> => {
  try {
    const response = await api.get<{ count: number }>(
      "/reports/active-prescriptions"
    );
    return response.data.count;
  } catch (error) {
    console.error("Error fetching active prescriptions:", error);
    return 0;
  }
};

const getTotalCustomers = async (): Promise<number> => {
  try {
    const response = await api.get<{ total_customers: number }>(
      "/reports/total-customers"
    );
    return response.data.total_customers;
  } catch (error) {
    console.error("Error fetching total customers:", error);
    return 0;
  }
};

const getTotalDrugs = async (): Promise<{
  count: number;
  totalQuantity: number;
}> => {
  try {
    const response = await api.get<{
      medicine_counts: number;
      total_quantity: number;
    }>("/reports/total-medicines");
    return {
      count: response.data.medicine_counts,
      totalQuantity: response.data.total_quantity,
    };
  } catch (error) {
    console.error("Error fetching total drugs:", error);
    return { count: 0, totalQuantity: 0 };
  }
};

const getLowStockItems = async (): Promise<number> => {
  try {
    const response = await api.get<any[]>("/reports/low-stocks");
    return response.data.length;
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return 0;
  }
};

const getMonthlyRevenue = async (): Promise<number> => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const response = await api.get("/analytics/revenue", {
      params: {
        start_date: `${formatDate(startDate)}T00:00:00Z`,
        end_date: `${formatDate(endDate)}T23:59:59Z`,
      },
    });

    return response.data.total?.branch_revenue || 0;
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return 0;
  }
};

const getRefillReminders = async (): Promise<RefillReminder[]> => {
  try {
    const response = await api.get<RefillReminder[]>("/reports/refills");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching refill reminders:", error);
    return [];
  }
};

const getCompanyCreditPayments = async (): Promise<CompanyCreditPayment[]> => {
  try {
    const response = await api.get<any[]>("/orders?paid=false");
    console.log("response", response);
    return response.data.map((order) => ({
      id: order.id,
      supplierName: order.supplier_name,
      amount: order.total,
      dueDate: order.due_date,
      isPaid: order.is_paid,
      status: order.status,
      purchaseDate: order.purchase_date,
      branchName: order.branch_name,
      supplierPhone: order.supplier_phone ?? "",
      createdAt: order.created_at ?? new Date().toISOString(),
      drugsReceived: order.drugs_received ?? [],
    }));
  } catch (error) {
    console.error("Error fetching company credit payments:", error);
    return [];
  }
};

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const [
      sales,
      employees,
      prescriptionsCount,
      totalCustomers,
      totalDrugs,
      lowStockItems,
      monthlyRevenue,
      refillReminders,
      creditPayments,
    ] = await Promise.all([
      getRecentSales(),
      getEmployees(),
      getActivePrescriptions(),
      getTotalCustomers(),
      getTotalDrugs(),
      getLowStockItems(),
      getMonthlyRevenue(),
      getRefillReminders(),
      getCompanyCreditPayments(),
    ]);

    const now = new Date();
    const duePayments = creditPayments.filter((payment) => {
      if (payment.isPaid) return false;
      const dueDate = new Date(payment.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff <= 10 && daysDiff >= 0;
    }).length;

    return {
      sales,
      employees,
      prescriptions: prescriptionsCount,
      creditPayments,
      notifications: [],
      refillReminders,
      stats: {
        totalSales: 0,
        totalRevenue: monthlyRevenue,
        totalCustomers,
        totalEmployees: employees.length,
        totalDrugs,
        pendingPrescriptions: prescriptionsCount,
        duePayments,
        lowStockItems,
        monthlyRevenue,
        weeklyRevenue: 0,
        dailyRevenue: 0,
        topSellingDrugs: [],
        topEmployees: [],
        refillReminders: refillReminders.length,
        expiringSoon: 0,
        salesTrend: [],
        customerGrowth: 0,
        inventoryValue: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
