import api from "../api/api";

// Helper function to extract error message from axios error
const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    return axiosError.response?.data?.error || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An error occurred";
};

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
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
  updated_at: string;
}

interface CreateMedicineInput {
  name: string;
  brand: string;
  category: string;
  description: string;
}

interface UpdateMedicineInput extends Partial<CreateMedicineInput> {
  id: string;
}

export const inventoryService = {
  async getMedicines(): Promise<Medicine[]> {
    try {
      const response = await api.get<Medicine[]>("/medicines");
      return response.data || [];
    } catch (error: unknown) {
      console.error("Error fetching medicines:", error);
      throw new Error(extractErrorMessage(error));
    }
  },

  async getStocks(): Promise<Stock[]> {
    try {
      const response = await api.get<Stock[]>("/stocks");
      return response.data || [];
    } catch (error: unknown) {
      console.error("Error fetching stocks:", error);
      throw new Error(extractErrorMessage(error));
    }
  },

  async getMedicineById(id: string): Promise<Medicine> {
    try {
      const response = await api.get<Medicine>(`/medicines/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching medicine ${id}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  async createMedicine(medicineData: CreateMedicineInput): Promise<Medicine> {
    try {
      const response = await api.post<Medicine>("/medicines", medicineData);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating medicine:", error);
      throw new Error(extractErrorMessage(error));
    }
  },

  async updateMedicine(medicineData: UpdateMedicineInput): Promise<Medicine> {
    try {
      const { id, ...updateData } = medicineData;
      const response = await api.put<Medicine>(`/medicines/${id}`, updateData);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error updating medicine ${medicineData.id}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },

  async deleteMedicine(id: string): Promise<void> {
    try {
      await api.delete(`/medicines/${id}`);
    } catch (error: unknown) {
      console.error(`Error deleting medicine ${id}:`, error);
      throw new Error(extractErrorMessage(error));
    }
  },
};
