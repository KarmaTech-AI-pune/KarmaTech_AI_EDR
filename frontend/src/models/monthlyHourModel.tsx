export interface MonthlyHour {
    id: number;
    task_id: number;
    year: string;
    month: string;
    planned_hours: number;
    actual_hours?: number;
    created_at: Date;
    updated_at: Date;
  }