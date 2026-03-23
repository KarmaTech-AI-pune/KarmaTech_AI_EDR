import { axiosInstance } from './axiosConfig';
import { Program, ProgramFormDto } from '../types/program';

export const programApi = {
  // Get all programs
  getAll: async (): Promise<Program[]> => {
    const response = await axiosInstance.get<Program[]>('api/Program');
    return response.data;
  },

  // Get program by ID
  getById: async (id: number): Promise<Program> => {
    const response = await axiosInstance.get<Program>(`api/Program/${id}`);
    return response.data;
  },

  // Create new program
  create: async (program: ProgramFormDto): Promise<number> => {
    const response = await axiosInstance.post<{ id: number }>('api/Program', program);
    return response.data.id;
  },

  // Update program
  update: async (id: number, program: ProgramFormDto): Promise<void> => {
    // Backend expects the Id field in the body to match the URL parameter
    const programDto = {
      id: id,
      ...program
    };
    await axiosInstance.put(`api/Program/${id}`, programDto);
  },

  // Delete program
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`api/Program/${id}`);
  }
};
