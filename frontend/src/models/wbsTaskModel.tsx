export type WBSTask ={
    id: string;
    project_id: string; //links to ID in dummyProjects
    parent_id: string | null; //links to a WBSTask parent
    level: number;
    title: string;
    created_at: Date;
    updated_at: Date;
    resource_allocation?: number;
    resource_role?: string;
}
