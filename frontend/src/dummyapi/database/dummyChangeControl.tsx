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

export const dummyChangeControl: ChangeControl[] = [
    {
        id: 1,
        projectId: 1,
        srNo: 1,
        dateLogged: "2024-01-15",
        originator: "Dr. Patel",
        description: "Modification in sewage treatment plant capacity from 5 MLD to 7 MLD due to population projection updates",
        costImpact: "High - ₹1.5 Crore",
        timeImpact: "3 months delay",
        resourcesImpact: "Additional civil work team required",
        qualityImpact: "Redesign of aeration tanks needed",
        changeOrderStatus: "Approved",
        clientApprovalStatus: "Approved",
        claimSituation: "Variation claim submitted"
    },
    {
        id: 2,
        projectId: 1,
        srNo: 2,
        dateLogged: "2024-01-20",
        originator: "Er. Singh",
        description: "Change in water treatment process - Addition of advanced oxidation process",
        costImpact: "Medium - ₹75 Lakhs",
        timeImpact: "2 months delay",
        resourcesImpact: "Specialized equipment installation team needed",
        qualityImpact: "Improved water quality parameters",
        changeOrderStatus: "Under Review",
        clientApprovalStatus: "Pending",
        claimSituation: "To be evaluated"
    }
];
