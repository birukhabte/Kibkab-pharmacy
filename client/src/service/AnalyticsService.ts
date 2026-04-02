import api from "../api/api";

const AnalyticsService = {
  getRevenue: (dateRange) => {
    return api.get("/analytics/revenue", { params: dateRange });
  },

  getTopProducts: (dateRange) => {
    return api.get("/analytics/top-products", { params: dateRange });
  },

  getTopCategories: (dateRange) => {
    return api.get("/analytics/top-categories", { params: dateRange });
  },
};

export default AnalyticsService;
