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

export interface Employee {
  id: string;
  branch_id?: string | null;
  role_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmployeeInput {
  branch_id?: string | null;
  role_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  active?: boolean;
}

export interface Role {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
}

const transformEmployee = (employee: Employee): Employee => ({
  ...employee,
});

// API calls using the shared `api` instance
export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await api.get<Employee[]>("/employees");
    return response.data.map(transformEmployee);
  } catch (error: unknown) {
    console.error("Error fetching employees:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const getEmployee = async (id: string): Promise<Employee> => {
  try {
    const response = await api.get<Employee>(`/employees/${id}`);
    return transformEmployee(response.data);
  } catch (error: unknown) {
    console.error("Error fetching employee:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const createEmployee = async (
  employeeData: CreateEmployeeInput
): Promise<Employee> => {
  try {
    const response = await api.post<Employee>("/employees", employeeData);
    console.log("response", response);
    console.log("employeedata", employeeData);
    return transformEmployee(response.data);
  } catch (error: unknown) {
    console.error("Error creating employee:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const updateEmployee = async (
  id: string,
  employeeData: Partial<CreateEmployeeInput>
): Promise<Employee> => {
  try {
    const response = await api.put<Employee>(`/employees/${id}`, employeeData);
    return transformEmployee(response.data);
  } catch (error: unknown) {
    console.error("Error updating employee:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await api.delete(`/employees/${id}`);
  } catch (error: unknown) {
    console.error("Error deleting employee:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get<Role[]>("/roles");
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching roles:", error);
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchBranches = async (): Promise<Branch[]> => {
  try {
    const response = await api.get<Branch[]>("/branches");
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching branches:", error);
    throw new Error(extractErrorMessage(error));
  }
};
