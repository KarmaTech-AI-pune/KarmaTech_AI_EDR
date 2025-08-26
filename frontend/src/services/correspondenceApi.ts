import { axiosInstance, ensureHeaders } from './axiosConfig.tsx';
import { AxiosResponse } from 'axios';

// Define interfaces for the API data
export interface InwardRow {
    id: number;
    projectId: number;
    incomingLetterNo: string;
    letterDate: string;
    njsInwardNo: string;
    receiptDate: string;
    from: string;
    subject: string;
    attachmentDetails?: string;
    actionTaken?: string;
    storagePath?: string;
    remarks?: string;
    repliedDate?: string;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface OutwardRow {
    id: number;
    projectId: number;
    letterNo: string;
    letterDate: string;
    to: string;
    subject: string;
    attachmentDetails?: string;
    actionTaken?: string;
    storagePath?: string;
    remarks?: string;
    acknowledgement?: string;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

// Create type for creating new rows (omitting id and some audit fields, but keeping createdBy)
export type CreateInwardRow = Omit<InwardRow, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>;
export type CreateOutwardRow = Omit<OutwardRow, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>;

// Create type for updating rows (requiring id, keeping updatedBy)
export type UpdateInwardRow = Omit<InwardRow, 'createdAt' | 'updatedAt' | 'createdBy'>;
export type UpdateOutwardRow = Omit<OutwardRow, 'createdAt' | 'updatedAt' | 'createdBy'>;

const BASE_URL = '/api/correspondence';

// Inward Correspondence API functions
export const getInwardRows = async (projectId: string | number): Promise<InwardRow[]> => {
    try {
        const response: AxiosResponse<InwardRow[]> = await axiosInstance.get(
            `${BASE_URL}/inward/project/${projectId}`,
            ensureHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching inward correspondence:', error);
        throw error;
    }
};

export const getInwardRowById = async (id: string | number): Promise<InwardRow> => {
    try {
        const response: AxiosResponse<InwardRow> = await axiosInstance.get(
            `${BASE_URL}/inward/${id}`,
            ensureHeaders()
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching inward correspondence ${id}:`, error);
        throw error;
    }
};

export const createInwardRow = async (data: CreateInwardRow): Promise<InwardRow> => {
    try {
        console.log('Creating inward row with data:', data);
        const response: AxiosResponse<InwardRow> = await axiosInstance.post(
            `${BASE_URL}/inward`,
            data,
            ensureHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error creating inward correspondence:', error);
        throw error;
    }
};

export const updateInwardRow = async (id: string | number, data: UpdateInwardRow): Promise<InwardRow> => {
    try {
        const response: AxiosResponse<InwardRow> = await axiosInstance.put(
            `${BASE_URL}/inward/${id}`,
            data,
            ensureHeaders()
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating inward correspondence ${id}:`, error);
        throw error;
    }
};

export const deleteInwardRow = async (id: string | number): Promise<void> => {
    try {
        await axiosInstance.delete(
            `${BASE_URL}/inward/${id}`,
            ensureHeaders()
        );
    } catch (error) {
        console.error(`Error deleting inward correspondence ${id}:`, error);
        throw error;
    }
};

// Outward Correspondence API functions
export const getOutwardRows = async (projectId: string | number): Promise<OutwardRow[]> => {
    try {
        const response: AxiosResponse<OutwardRow[]> = await axiosInstance.get(
            `${BASE_URL}/outward/project/${projectId}`,
            ensureHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching outward correspondence:', error);
        throw error;
    }
};

export const getOutwardRowById = async (id: string | number): Promise<OutwardRow> => {
    try {
        const response: AxiosResponse<OutwardRow> = await axiosInstance.get(
            `${BASE_URL}/outward/${id}`,
            ensureHeaders()
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching outward correspondence ${id}:`, error);
        throw error;
    }
};

export const createOutwardRow = async (data: CreateOutwardRow): Promise<OutwardRow> => {
    try {
        console.log('Creating outward row with data:', data);
        const response: AxiosResponse<OutwardRow> = await axiosInstance.post(
            `${BASE_URL}/outward`,
            data,
            ensureHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error creating outward correspondence:', error);
        throw error;
    }
};

export const updateOutwardRow = async (id: string | number, data: UpdateOutwardRow): Promise<OutwardRow> => {
    try {
        const response: AxiosResponse<OutwardRow> = await axiosInstance.put(
            `${BASE_URL}/outward/${id}`,
            data,
            ensureHeaders()
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating outward correspondence ${id}:`, error);
        throw error;
    }
};

export const deleteOutwardRow = async (id: string | number): Promise<void> => {
    try {
        await axiosInstance.delete(
            `${BASE_URL}/outward/${id}`,
            ensureHeaders()
        );
    } catch (error) {
        console.error(`Error deleting outward correspondence ${id}:`, error);
        throw error;
    }
};

// Export all functions
export const correspondenceApi = {
    getInwardRows,
    getInwardRowById,
    createInwardRow,
    updateInwardRow,
    deleteInwardRow,
    getOutwardRows,
    getOutwardRowById,
    createOutwardRow,
    updateOutwardRow,
    deleteOutwardRow
};

export default correspondenceApi;
