export interface WBSTaskResourceAllocation {
    id: string;
    wbs_task_id: string;
    role_id: string | null; 
    employee_id: string | null;
    cost_rate: number;
    odc: number;
    total_hours?: number;
    total_cost?: number;
    created_at: Date;
    updated_at: Date;
    employee?: any;
}
