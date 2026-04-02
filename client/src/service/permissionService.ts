import api from '../api/api';

export const checkPermission = async (permission: string) => {
  try {
    const response = await api.get(`/permissions/has/${permission}`);
    return response.status === 200;
  } catch (error) {
    console.error(`Error checking permission ${permission}:`, error);
    return false;
  }
};