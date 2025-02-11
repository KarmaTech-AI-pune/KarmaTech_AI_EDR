import { axiosInstance as axios } from './axiosConfig';
import { GoNoGoDecision } from '../models/goNoGoDecisionModel';
import { GoNoGoVersionDto, CreateGoNoGoVersionDto, ApproveGoNoGoVersionDto } from '../models/goNoGoVersionModel.tsx';

export const goNoGoApi = {
    getAll: async () => {
        const response = await axios.get('/api/gonogodecision');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await axios.get(`/api/gonogodecision/${id}`);
        return response.data;
    },

    getByProjectId: async (projectId: string) => {
        const response = await axios.get(`/api/gonogodecision/project/${projectId}`);
        return response.data;
    },

    getByOpportunityId: async (projectId: number) => {
        const response = await axios.get(`/api/gonogodecision/opportunity/${projectId}`);
        return response.data;
    },

    create: async (projectId: string, decision: any) => {
        const response = await axios.post(`/api/gonogodecision/createForm`, {
            ...decision
        });
        return response.data;
    },

    update: async (id: string, decision: any) => {
        const response = await axios.post(`/api/gonogodecision/createForm`, {
            ...decision
        });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axios.delete(`/api/gonogodecision/${id}`);
        return response.data;
    },

    // Version management endpoints
    getVersions: async (headerId: number): Promise<GoNoGoVersionDto[]> => {
        const response = await axios.get(`/api/gonogodecision/${headerId}/versions`);
        return response.data;
    },

    getVersion: async (headerId: number, versionNumber: number): Promise<GoNoGoVersionDto> => {
        const response = await axios.get(`/api/gonogodecision/${headerId}/versions/${versionNumber}`);
        return response.data;
    },

    createVersion: async (headerId: number, data: CreateGoNoGoVersionDto): Promise<GoNoGoVersionDto> => {
        const response = await axios.post(`/api/gonogodecision/${headerId}/versions`, data);
        return response.data;
    },

    approveVersion: async (
        headerId: number, 
        versionNumber: number, 
        data: ApproveGoNoGoVersionDto
    ): Promise<GoNoGoVersionDto> => {
        const response = await axios.post(
            `/api/gonogodecision/${headerId}/versions/${versionNumber}/approve`,
            data
        );
        return response.data;
    }
};
