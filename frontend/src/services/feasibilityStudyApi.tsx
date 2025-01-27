import { axiosInstance } from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface FeasibilityStudy {
    id: number;
    projectId: number;
    projectDetails: string;
    strategicRanking: number;
    financialInformation: number;
    studyDate: Date;
    probabilityAssessment: number;
    competitionAnalysis: string;
    fundingStream: string;
    contractType: string;
    qualifyingCriteria: string;
}

const BASE_URL = '/api/feasibilitystudy';

export const feasibilityStudyApi = {
    getAll: async (): Promise<FeasibilityStudy[]> => {
        const response: AxiosResponse<FeasibilityStudy[]> = await axiosInstance.get(BASE_URL);
        return response.data;
    },

    getById: async (id: number): Promise<FeasibilityStudy> => {
        const response: AxiosResponse<FeasibilityStudy> = await axiosInstance.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    getByProjectId: async (projectId: number): Promise<FeasibilityStudy> => {
        const response: AxiosResponse<FeasibilityStudy> = await axiosInstance.get(`${BASE_URL}/project/${projectId}`);
        return response.data;
    },

    create: async (study: Omit<FeasibilityStudy, 'id'>): Promise<FeasibilityStudy> => {
        const response: AxiosResponse<FeasibilityStudy> = await axiosInstance.post(BASE_URL, study);
        return response.data;
    },

    update: async (id: number, study: FeasibilityStudy): Promise<void> => {
        await axiosInstance.put(`${BASE_URL}/${id}`, study);
    }
};

export default feasibilityStudyApi;
