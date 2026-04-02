import { useState, useEffect } from "react";
import { getDashboardData } from "../service/DashboardService";
import {
  Sale,
  Employee,
  Notification,
  CompanyCreditPayment,
  DashboardStats,
  RefillReminder,
} from "../types/types";

interface DashboardState {
  notifications: Notification[];
  sales: Sale[];
  employees: Employee[];
  prescriptions: number;
  creditPayments: CompanyCreditPayment[];
  refillReminders: RefillReminder[]; // Added
  stats: DashboardStats;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardState>({
    notifications: [],
    sales: [],
    employees: [],
    prescriptions: 0,
    creditPayments: [],
    refillReminders: [], // Added
    stats: {
      totalSales: 0,
      totalCustomers: 0,
      totalEmployees: 0,
      totalDrugs: { count: 0, totalQuantity: 0 },
      pendingPrescriptions: 0,
      duePayments: 0,
      lowStockItems: 0,
      monthlyRevenue: 0,
      refillReminders: 0,
      totalRevenue: 0,
      weeklyRevenue: 0,
      dailyRevenue: 0,
      topSellingDrugs: [],
      topEmployees: [],
      expiringSoon: 0,
      salesTrend: [],
      customerGrowth: 0,
      inventoryValue: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
