import { axiosInstance } from '../../../../src/services/axiosConfig';
import { Program } from '../types/types';

const API_URL = '/api/Program';

export const programService = {
    getAllPrograms: async (): Promise<Program[]> => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    getProgramById: async (id: number): Promise<Program> => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    createProgram: async (program: Omit<Program, 'id' | 'lastModifiedBy'>): Promise<Program> => {
        const response = await axiosInstance.post(API_URL, program);
        return response.data;
    },

    updateProgram: async (id: number, program: Program): Promise<Program> => {
        const response = await axiosInstance.put(`${API_URL}/${id}`, program);
        return response.data;
    },

    deleteProgram: async (id: number): Promise<{ success: boolean; message: string }> => {
        const response = await axiosInstance.delete(`${API_URL}/${id}`);
        return response.data;
    },
};
