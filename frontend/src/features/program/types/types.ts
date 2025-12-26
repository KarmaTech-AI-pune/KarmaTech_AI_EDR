export interface Program {
    id: number;
    tenantId: number;
    name: string;
    description?: string;
    startDate: string; // Assuming ISO 8601 string format for dates
    endDate: string;   // Assuming ISO 8601 string format for dates
    createdBy: string;
    lastModifiedBy?: string;
}
