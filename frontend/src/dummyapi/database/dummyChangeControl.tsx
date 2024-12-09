export interface ChangeControl {
    id: number;
    projectId: number; // Foreign key to project
    srNo: number;
    dateLogged: string;
    originator: string;
    description: string;
    costImpact: string;
    timeImpact: string;
    resourcesImpact: string;
    qualityImpact: string;
    changeOrderStatus: string;
    clientApprovalStatus: string;
    claimSituation: string;
}

export const dummyChangeControl: ChangeControl[] = [];
