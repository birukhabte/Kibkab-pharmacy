import api from "../api/api";

export const CommissionService = {
  async getCommissions(paid?: boolean) {
    const params = paid !== undefined ? { paid } : {};
    const response = await api.get("/commissions", { params });
    return response.data;
  },

  async markCommissionAsPaid(id: string) {
    const response = await api.put(`/commissions/pay/${id}`);
    return response.data;
  },
};
