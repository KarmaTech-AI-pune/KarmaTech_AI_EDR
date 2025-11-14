import { axiosInstance } from './axiosConfig'; // Assuming axiosConfig is in the same services folder

export const applyMigrations = async () => {
  const response = await axiosInstance.post('/api/Tenants/apply-migrations', {});
  return response.data.results;
};
