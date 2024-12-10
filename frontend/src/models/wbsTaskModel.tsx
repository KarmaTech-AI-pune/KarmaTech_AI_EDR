export type WBSTask ={
    id: number;
    project_id: number; //links to ID in dummyProjects
    parent_id: number | null; //links to a WBSTask parent
    level: number;
    title: string;
    created_at: Date;
    updated_at: Date;
    resource_allocation?: number;
}