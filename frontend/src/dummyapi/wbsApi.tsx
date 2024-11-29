import { wbsTasks as initialWbsTasks, resourceAllocations as initialResourceAllocations, odcCosts as initialOdcCosts } from './database/dummyWBSTasks';

// Mutable arrays to track changes
let wbsTasks = [...initialWbsTasks];
let resourceAllocations = [...initialResourceAllocations];
let odcCosts = [...initialOdcCosts];

// Helper function to generate new IDs
const getNewId = (array: any[]) => {
    return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

// Reset function to restore initial state (useful for testing)
const resetData = () => {
    wbsTasks = [...initialWbsTasks];
    resourceAllocations = [...initialResourceAllocations];
    odcCosts = [...initialOdcCosts];
};

export const WBSApi = {
    // Get all WBS tasks for a project
    getWBSTasks: async (projectId: number) => {
        try {
            return wbsTasks.filter(task => task.projectId === projectId);
        } catch (error) {
            console.error('Error getting WBS tasks:', error);
            throw error;
        }
    },

    // Get a single WBS task by ID
    getWBSTaskById: async (taskId: number) => {
        try {
            return wbsTasks.find(task => task.id === taskId);
        } catch (error) {
            console.error('Error getting WBS task:', error);
            throw error;
        }
    },

    // Create a new WBS task
    createWBSTask: async (taskData: any) => {
        try {
            const newTask = {
                id: getNewId(wbsTasks),
                ...taskData
            };
            wbsTasks.push(newTask);
            return newTask;
        } catch (error) {
            console.error('Error creating WBS task:', error);
            throw error;
        }
    },

    // Update an existing WBS task
    updateWBSTask: async (taskId: number, taskData: any) => {
        try {
            const index = wbsTasks.findIndex(task => task.id === taskId);
            if (index !== -1) {
                // Preserve the ID and update other fields
                const updatedTask = {
                    ...wbsTasks[index],
                    ...taskData,
                    id: taskId
                };
                wbsTasks[index] = updatedTask;
                return updatedTask;
            }
            throw new Error('Task not found');
        } catch (error) {
            console.error('Error updating WBS task:', error);
            throw error;
        }
    },

    // Delete a WBS task and its children
    deleteWBSTask: async (taskId: number) => {
        try {
            // Get all child tasks recursively
            const getAllChildTaskIds = (parentId: number): number[] => {
                const childTasks = wbsTasks.filter(task => task.parentTaskId === parentId);
                return childTasks.reduce((ids: number[], task) => {
                    return [...ids, task.id, ...getAllChildTaskIds(task.id)];
                }, []);
            };

            const taskIdsToDelete = [taskId, ...getAllChildTaskIds(taskId)];

            // Delete all resource allocations for these tasks
            resourceAllocations = resourceAllocations.filter(
                allocation => !taskIdsToDelete.includes(allocation.wbsTaskId)
            );

            // Delete all ODC costs for these tasks
            odcCosts = odcCosts.filter(
                cost => !taskIdsToDelete.includes(cost.wbsTaskId)
            );

            // Delete the tasks
            wbsTasks = wbsTasks.filter(task => !taskIdsToDelete.includes(task.id));
            return true;
        } catch (error) {
            console.error('Error deleting WBS task:', error);
            throw error;
        }
    },

    // Get resource allocations for a WBS task
    getResourceAllocations: async (taskId: number) => {
        try {
            return resourceAllocations.filter(allocation => allocation.wbsTaskId === taskId);
        } catch (error) {
            console.error('Error getting resource allocations:', error);
            throw error;
        }
    },

    // Create a new resource allocation
    createResourceAllocation: async (allocationData: any) => {
        try {
            const newAllocation = {
                id: getNewId(resourceAllocations),
                ...allocationData
            };
            resourceAllocations.push(newAllocation);
            return newAllocation;
        } catch (error) {
            console.error('Error creating resource allocation:', error);
            throw error;
        }
    },

    // Update an existing resource allocation
    updateResourceAllocation: async (allocationId: number, allocationData: any) => {
        try {
            const index = resourceAllocations.findIndex(allocation => allocation.id === allocationId);
            if (index !== -1) {
                // Preserve the ID and update other fields
                const updatedAllocation = {
                    ...resourceAllocations[index],
                    ...allocationData,
                    id: allocationId
                };
                resourceAllocations[index] = updatedAllocation;
                return updatedAllocation;
            }
            throw new Error('Resource allocation not found');
        } catch (error) {
            console.error('Error updating resource allocation:', error);
            throw error;
        }
    },

    // Delete a resource allocation
    deleteResourceAllocation: async (allocationId: number) => {
        try {
            resourceAllocations = resourceAllocations.filter(allocation => allocation.id !== allocationId);
            return true;
        } catch (error) {
            console.error('Error deleting resource allocation:', error);
            throw error;
        }
    },

    // Get ODC costs for a WBS task
    getODCCosts: async (taskId: number) => {
        try {
            return odcCosts.filter(cost => cost.wbsTaskId === taskId);
        } catch (error) {
            console.error('Error getting ODC costs:', error);
            throw error;
        }
    },

    // Create a new ODC cost
    createODCCost: async (costData: any) => {
        try {
            const newCost = {
                id: getNewId(odcCosts),
                ...costData
            };
            odcCosts.push(newCost);
            return newCost;
        } catch (error) {
            console.error('Error creating ODC cost:', error);
            throw error;
        }
    },

    // Update an existing ODC cost
    updateODCCost: async (costId: number, costData: any) => {
        try {
            const index = odcCosts.findIndex(cost => cost.id === costId);
            if (index !== -1) {
                // Preserve the ID and update other fields
                const updatedCost = {
                    ...odcCosts[index],
                    ...costData,
                    id: costId
                };
                odcCosts[index] = updatedCost;
                return updatedCost;
            }
            throw new Error('ODC cost not found');
        } catch (error) {
            console.error('Error updating ODC cost:', error);
            throw error;
        }
    },

    // Delete an ODC cost
    deleteODCCost: async (costId: number) => {
        try {
            odcCosts = odcCosts.filter(cost => cost.id !== costId);
            return true;
        } catch (error) {
            console.error('Error deleting ODC cost:', error);
            throw error;
        }
    },

    // Reset the data to initial state
    resetData
};
