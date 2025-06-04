import { axiosInstance } from './axiosConfig';

export const changeControlApi = {


    sendToReview: async (command: any) => {
        try {
            ;
            const response = await axiosInstance.post(`api/PMWorkflow/sendtoreview`, command);
            return response.data;
        }
        catch (error) {
            console.error('Error getting all projects:', error);
            throw error;
        }
    },

    sendToApprovalBySPM: async (command: any) => {
        try {
            ;
            const response = await axiosInstance.post(`api/PMWorkflow/sendToApproval`, command);
            return response.data;
        }
        catch (error) {
            console.error('Error getting all projects:', error);
            throw error;
        }
    },

    rejectBySPM: async (command: any) => {
        try {
            ;
            const response = await axiosInstance.post(`api/PMWorkflow/requestChanges`, command);
            return response.data;
        }
        catch (error) {
            console.error('Error getting all projects:', error);
            throw error;
        }
    },


    approvedByRDOrRM: async (command: any) => {
        try {
            ;
            const response = await axiosInstance.post(`api/PMWorkflow/approve`, command);
            return response.data;
        }
        catch (error) {
            console.error('Error getting all projects:', error);
            throw error;
        }
    },
    
    rejectByRDOrRM: async (command: any) => {
        try {
            ;
            const response = await axiosInstance.post(`api/PMWorkflow/requestChanges`, command);
            return response.data;
        }
        catch (error) {
            console.error('Error getting all projects:', error);
            throw error;
        }
    }
};
