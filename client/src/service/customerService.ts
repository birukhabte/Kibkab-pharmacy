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

export async function fetchCustomers() {
  try {
    const response = await api.get("/customers");
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching customers:", error);
    throw new Error(extractErrorMessage(error));
  }
}

export async function addCustomer(customerData: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  address?: string;
}) {
  try {
    const response = await api.post("/customers", customerData);
    return response.data;
  } catch (error: unknown) {
    console.error("Error adding customer:", error);
    throw new Error(extractErrorMessage(error));
  }
}

export async function updateCustomer(
  id: string,
  customerData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    address?: string;
  }
) {
  try {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating customer:", error);
    throw new Error(extractErrorMessage(error));
  }
}

export async function deleteCustomer(id: string) {
  try {
    await api.delete(`/customers/${id}`);
  } catch (error: unknown) {
    console.error("Error deleting customer:", error);
    throw new Error(extractErrorMessage(error));
  }
}
