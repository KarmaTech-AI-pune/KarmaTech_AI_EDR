import { ProjectStatus } from "../types/index";

export type Project = {
    id: string;
    name: string;
    details?: string;
    clientName: string;
    projectManagerId: string;
    office?: string;
    projectNo: string;
    typeOfJob?: string;
    seniorProjectManagerId: string;
    sector?: string;
    region?: string;
    typeOfClient?: string;
    estimatedProjectCost: number;
    estimatedProjectFee: number;
    feeType?: string;
    startDate?: string;
    endDate?: string;
    currency: string;
    priority?: string;
    regionalManagerId: string;
    letterOfAcceptance: boolean;
    opportunityId?: number;
    programId: number;
    createdAt: string;
    updatedAt: string;
    status: ProjectStatus;
    opportunityTrackingId?: number;
}
