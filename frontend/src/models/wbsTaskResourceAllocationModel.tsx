export interface WBSTaskResourceAllocation {
    id: number;
    wbs_task_id: number;
    role_id: number | null; 
    employee_id: number | null;
    cost_rate: number;
    odc: number;
    total_hours?: number;
    total_cost?: number;
    created_at: Date;
    updated_at: Date;
    employee?: any;
}