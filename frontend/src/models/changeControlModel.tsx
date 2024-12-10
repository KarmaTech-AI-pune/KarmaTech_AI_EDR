export interface ChangeControl {
    id: number;
    projectId: number;
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
