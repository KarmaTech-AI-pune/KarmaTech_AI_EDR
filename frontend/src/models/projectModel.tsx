export type Project = {
    id: number;
    name: string;
    details?: string;
    clientName: string;
    projectMangerId: number;
    office?: string;
    projectNo: string;
    typeOfJob?: string;
    seniorProjectMangerId: number;
    sector?: string;
    region?: string;
    typeOfClient?: string;
    estimatedCost: number;
    feeType?: string;
    startDate?: string;
    endDate?: string;
    currency: string;
    budget?: number;
    priority?: string;
    regionalManagerID: number;
  }