import { workflowData } from './database/dummyOpporunityWorkflow';
import type { WorkflowEntry } from './database/dummyOpporunityWorkflow';
import { opportunityApi } from './opportunityApi';
import { getOpportunityById } from './database/dummyopportunityTracking';

// Mutable array to store workflow data
let mutableWorkflowData: WorkflowEntry[] = [...workflowData];

// Create new workflow entry
export const createWorkflow = async (data: Omit<WorkflowEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkflow: WorkflowEntry = {
        id: mutableWorkflowData.length + 1,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    mutableWorkflowData.push(newWorkflow);
    return newWorkflow;
};

// Get workflow entry by opportunity ID
export const getWorkflowByOpportunityId = async (opportunityId: number) => {
    return mutableWorkflowData.find(w => w.opportunityId === opportunityId);
};

// Update workflow entry and opportunity atomically
export const updateWorkflow = async (opportunityId: number, workflowId: number, opportunityData?: any) => {
    try {
        // First update the workflow
        const index = mutableWorkflowData.findIndex(w => w.opportunityId === opportunityId);
        let updatedWorkflow;
        
        if (index !== -1) {
            mutableWorkflowData[index] = {
                ...mutableWorkflowData[index],
                workflowId: workflowId,
                updatedAt: new Date().toISOString()
            };
            updatedWorkflow = mutableWorkflowData[index];
        } else {
            // Create new workflow entry if it doesn't exist
            updatedWorkflow = await createWorkflow({
                opportunityId: opportunityId,
                formStage: 'opportunityTracking',
                workflowId: workflowId
            });
        }

        // Then update the opportunity if opportunityData is provided
        if (opportunityData) {
            const opportunity = await opportunityApi.getById(opportunityId);
            if (opportunity) {
                await opportunityApi.update({
                    ...opportunity,
                    ...opportunityData,
                    workflowId: workflowId // Ensure workflow ID is updated in opportunity as well
                });
            }
        }

        return updatedWorkflow;
    } catch (error) {
        console.error('Error updating workflow:', error);
        throw error;
    }
};

// Delete workflow entry
export const deleteWorkflow = async (id: number) => {
    const index = mutableWorkflowData.findIndex(w => w.id === id);
    if (index !== -1) {
        const deletedWorkflow = mutableWorkflowData[index];
        mutableWorkflowData.splice(index, 1);
        return deletedWorkflow;
    }
    return null;
};

// Get all workflows
export const getAllWorkflows = async () => {
    return mutableWorkflowData;
};

// Get workflow by ID
export const getWorkflowById = async (id: number) => {
    return mutableWorkflowData.find(w => w.id === id);
};

// Update workflow stage
export const updateWorkflowStage = async (id: number, formStage: WorkflowEntry['formStage']) => {
    const index = mutableWorkflowData.findIndex(w => w.id === id);
    if (index !== -1) {
        mutableWorkflowData[index] = {
            ...mutableWorkflowData[index],
            formStage,
            updatedAt: new Date().toISOString()
        };
        return mutableWorkflowData[index];
    }
    return null;
};

// Bulk update workflows
export const bulkUpdateWorkflows = async (updates: Partial<WorkflowEntry>[]) => {
    updates.forEach(update => {
        if (!update.id) return;
        const index = mutableWorkflowData.findIndex(w => w.id === update.id);
        if (index !== -1) {
            mutableWorkflowData[index] = {
                ...mutableWorkflowData[index],
                ...update,
                updatedAt: new Date().toISOString()
            };
        }
    });
    return mutableWorkflowData;
};

// Get opportunities with bidAccepted stage
export const getBidAcceptedOpportunities = async () => {
    const bidAcceptedWorkflows = mutableWorkflowData.filter(w => w.formStage === 'bidAccepted');
    return Promise.all(
        bidAcceptedWorkflows.map(async (workflow) => {
            const opportunity = getOpportunityById(workflow.opportunityId);
            if (opportunity) {
                return {
                    id: workflow.opportunityId,
                    workName: opportunity.workName,
                    client: opportunity.client
                };
            }
            return null;
        })
    ).then(opportunities => opportunities.filter(Boolean));
};
