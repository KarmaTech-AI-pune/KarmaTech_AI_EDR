export interface MonthlyHour {
    id: string;
    task_id: string;
    year: string;
    month: string;
    planned_hours: number;
    actual_hours?: number;
    created_at: Date;
    updated_at: Date;
  }
