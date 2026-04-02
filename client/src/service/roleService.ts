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

export interface Permission {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  commission: number;
  permissions: Permission[];
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RoleUpdateData {
  name: string;
  description: string;
  commission: number;
  permission_ids: string[];
}

export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get("/roles");
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching roles:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await api.get("/permissions");
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching permissions:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const updateRole = async (
  id: string,
  data: RoleUpdateData
): Promise<Role> => {
  try {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating role:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const createRole = async (data: RoleUpdateData): Promise<Role> => {
  try {
    const response = await api.post("/roles", data);
    return response.data;
  } catch (error: unknown) {
    console.error("Error creating role:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteRole = async (id: string): Promise<void> => {
  try {
    await api.delete(`/roles/${id}`);
  } catch (error: unknown) {
    console.error("Error deleting role:", error);
    throw new Error(extractErrorMessage(error));
  }
};
