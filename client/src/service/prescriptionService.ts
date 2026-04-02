import api from "../api/api";

// Define types
export interface RecurringPrescription {
  id: string;
  customer_id: string;
  medicine_id: string;
  interval_days: number;
  prescribed_quantity: number;
  sold_quantity: number;
  start_date: string;
  last_purchase_date: string | null;
  active: boolean;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface CreateRecurringPrescriptionInput {
  customer_id: string;
  medicine_id: string;
  interval_days: number;
  prescribed_quantity: number;
  sold_quantity: number;
  start_date: string | Date;
  last_purchase_date?: string | Date | null;
  active: boolean;
}

interface UpdateRecurringPrescriptionInput extends Partial<CreateRecurringPrescriptionInput> {
  id: string;
}

// Helper function to extract error message from backend
const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || "An unknown error occurred";
};

// Helper function to format dates to backend's expected format
const formatDateForBackend = (date: string | Date): string => {
  if (typeof date === 'string') {
    if (date.includes('T')) return date;
    return `${date}T00:00:00+03:00`;
  }
  return date.toISOString();
};

// API functions
export const fetchRecurringPrescriptions = async (): Promise<RecurringPrescription[]> => {
  try {
    const response = await api.get<RecurringPrescription[]>("/recurring");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const createRecurringPrescription = async (
  data: CreateRecurringPrescriptionInput
): Promise<RecurringPrescription> => {
  try {
    const payload = {
      ...data,
      start_date: formatDateForBackend(data.start_date),
      last_purchase_date: data.last_purchase_date 
        ? formatDateForBackend(data.last_purchase_date)
        : null,
      sold_quantity: data.sold_quantity || 0,
    };

    const response = await api.post<RecurringPrescription>("/recurring", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const updateRecurringPrescription = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateRecurringPrescriptionInput;
}): Promise<RecurringPrescription> => {
  try {
    const payload = {
      ...data,
      ...(data.start_date && { start_date: formatDateForBackend(data.start_date) }),
      ...(data.last_purchase_date && {
        last_purchase_date: formatDateForBackend(data.last_purchase_date),
      }),
    };

    const response = await api.put<RecurringPrescription>(`/recurring/${id}`, payload);
    return response.data;
  } catch (error) {
    console.log(error)
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteRecurringPrescription = async (id: string): Promise<void> => {
  try {
    await api.delete(`/recurring/${id}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await api.get<Customer[]>("/customers");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchMedicines = async (): Promise<Medicine[]> => {
  try {
    const response = await api.get<Medicine[]>("/medicines");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const formatMedicineDisplay = (medicine: Medicine): string => {
  return `${medicine.name} (${medicine.brand}) - ${medicine.category}`;
};
