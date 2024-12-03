import { wbsTasks as initialWbsTasks, resourceAllocations as initialResourceAllocations, monthlyHours as initialMonthlyHours, getWBSOptions, getLevel1Options, getLevel2Options, getLevel3Options, WBSTask, WBSTaskResourceAllocation, MonthlyHour } from './database/dummyWBSTasks';
import { resourceRoles as initialResourceRoles, employees as initialEmployees, projectResources as initialProjectResources, resourceRole as ResourceRole, Employee } from './database/dummyResourceRoles';

// Project Resource type definition
interface ProjectResource {
    id: number;
    projectId: number;
    employeeId: number;
    projectRate: number;
    startDate: Date;
    endDate: Date;
}

// Mutable arrays to track changes
let wbsTasks = [...initialWbsTasks];
let resourceAllocations = [...initialResourceAllocations];
let monthlyHours = [...initialMonthlyHours];
let resourceRoles = [...initialResourceRoles];
let employees = [...initialEmployees];
let projectResources = [...initialProjectResources];

// Helper function to generate new IDs
const getNewId = (array: { id: number }[]): number => {
    return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

// Helper function to clean up old allocations and hours
const cleanupOldData = (projectId: number, currentTaskIds: Set<number>) => {
    // Get all allocations for tasks that no longer exist
    const allocationsToRemove = resourceAllocations.filter(
        allocation => !currentTaskIds.has(allocation.wbs_task_id)
    );

    // Remove monthly hours for these allocations
    const allocationIdsToRemove = new Set(allocationsToRemove.map(a => a.id));
    monthlyHours = monthlyHours.filter(
        hour => !allocationIdsToRemove.has(hour.resource_allocation_id)
    );

    // Remove the allocations themselves
    resourceAllocations = resourceAllocations.filter(
        allocation => !allocationIdsToRemove.has(allocation.id)
    );
};

export const WBSApi = {
    // Resource and Employee Management
    getAllRoles: async (): Promise<ResourceRole[]> => {
        try {
            return resourceRoles;
        } catch (error) {
            console.error('Error getting roles:', error);
            throw error;
        }
    },

    getRoleById: async (id: number): Promise<ResourceRole | undefined> => {
        try {
            return resourceRoles.find(role => role.id === id);
        } catch (error) {
            console.error('Error getting role:', error);
            throw error;
        }
    },

    getAllEmployees: async (): Promise<Employee[]> => {
        try {
            return employees;
        } catch (error) {
            console.error('Error getting employees:', error);
            throw error;
        }
    },

    getEmployeeById: async (id: number): Promise<Employee | undefined> => {
        try {
            return employees.find(emp => emp.id === id);
        } catch (error) {
            console.error('Error getting employee:', error);
            throw error;
        }
    },

    getProjectResources: async (projectId: number): Promise<ProjectResource[]> => {
        try {
            return projectResources.filter(resource => resource.projectId === projectId);
        } catch (error) {
            console.error('Error getting project resources:', error);
            throw error;
        }
    },

    // Get entire WBS structure for a project including hierarchy, resources, and monthly hours
    getProjectWBS: async (projectId: number): Promise<WBSTask[]> => {
        try {
            // Get all tasks for the project
            const tasks = wbsTasks.filter(task => task.project_id === projectId);
            
            // Get all resource allocations for these tasks
            const taskIds = tasks.map(task => task.id);
            const allocations = resourceAllocations.filter(alloc => 
                taskIds.includes(alloc.wbs_task_id)
            );
            
            // Get all monthly hours for these allocations
            const allocationIds = allocations.map(alloc => alloc.id);
            const hours = monthlyHours.filter(hour => 
                allocationIds.includes(hour.resource_allocation_id)
            );
            
            // Build the complete structure
            const tasksWithDetails = tasks.map(task => {
                const taskAllocations = allocations
                    .filter(alloc => alloc.wbs_task_id === task.id)
                    .map(alloc => {
                        const employee = employees.find(emp => emp.id === alloc.employee_id);
                        const monthlyHoursData = hours.filter(h => h.resource_allocation_id === alloc.id);
                        return {
                            ...alloc,
                            employee,
                            monthly_hours: monthlyHoursData
                        };
                    });

                return {
                    ...task,
                    resource_allocations: taskAllocations
                };
            });

            return tasksWithDetails;
        } catch (error) {
            console.error('Error getting project WBS:', error);
            throw error;
        }
    },

    // Save multiple WBS tasks at once (create and update)
    saveWBSTasks: async (projectId: number, tasks: WBSTask[]): Promise<{ created: number[], updated: number[] }> => {
        try {
            const createdTaskIds: number[] = [];
            const updatedTaskIds: number[] = [];

            tasks.forEach(task => {
                if (task.id) {
                    // Update existing task
                    const index = wbsTasks.findIndex(t => t.id === task.id);
                    if (index !== -1) {
                        wbsTasks[index] = { ...wbsTasks[index], ...task };
                        updatedTaskIds.push(task.id);
                    }
                } else {
                    // Create new task
                    const newTask: WBSTask = {
                        ...task,
                        id: getNewId(wbsTasks),
                        project_id: projectId,
                        created_at: new Date(),
                        updated_at: new Date()
                    };
                    wbsTasks.push(newTask);
                    createdTaskIds.push(newTask.id);
                }
            });

            // Clean up old data for tasks that no longer exist
            const currentTaskIds = new Set([...createdTaskIds, ...updatedTaskIds]);
            cleanupOldData(projectId, currentTaskIds);

            return {
                created: createdTaskIds,
                updated: updatedTaskIds
            };
        } catch (error) {
            console.error('Error saving WBS tasks:', error);
            throw error;
        }
    },

    // Delete a WBS task and its children
    deleteWBSTask: async (projectId: number, taskId: number): Promise<number[]> => {
        try {
            // Get all child tasks recursively
            const getAllChildTaskIds = (parentId: number): number[] => {
                const childTasks = wbsTasks.filter(task => task.parent_id === parentId);
                return childTasks.reduce((ids: number[], task) => {
                    return [...ids, task.id, ...getAllChildTaskIds(task.id)];
                }, []);
            };

            const taskIdsToDelete = [taskId, ...getAllChildTaskIds(taskId)];

            // Get all resource allocation IDs for these tasks
            const allocationIdsToDelete = resourceAllocations
                .filter(allocation => taskIdsToDelete.includes(allocation.wbs_task_id))
                .map(allocation => allocation.id);

            // Delete all monthly hours for these allocations
            monthlyHours = monthlyHours.filter(
                hour => !allocationIdsToDelete.includes(hour.resource_allocation_id)
            );

            // Delete all resource allocations for these tasks
            resourceAllocations = resourceAllocations.filter(
                allocation => !allocationIdsToDelete.includes(allocation.id)
            );

            // Delete the tasks
            wbsTasks = wbsTasks.filter(task => !taskIdsToDelete.includes(task.id));

            return taskIdsToDelete;
        } catch (error) {
            console.error('Error deleting WBS task:', error);
            throw error;
        }
    },

    // Get resource allocations with optional month/year filtering
    getResourceAllocations: async (projectId: number, month?: number, year?: number): Promise<WBSTaskResourceAllocation[]> => {
        try {
            // Get project tasks
            const projectTasks = wbsTasks.filter(task => task.project_id === projectId);
            const taskIds = projectTasks.map(task => task.id);

            // Get allocations for these tasks
            let filteredAllocations = resourceAllocations.filter(
                alloc => taskIds.includes(alloc.wbs_task_id)
            );

            // Get monthly hours for these allocations
            const allocationIds = filteredAllocations.map(alloc => alloc.id);
            let filteredHours = monthlyHours.filter(
                hour => allocationIds.includes(hour.resource_allocation_id)
            );

            // Apply month/year filtering if provided
            if (month !== undefined && year !== undefined) {
                filteredHours = filteredHours.filter(
                    hour => hour.month === month && hour.year === year
                );
                
                // Only include allocations that have hours in the specified month/year
                const activeAllocationIds = new Set(filteredHours.map(h => h.resource_allocation_id));
                filteredAllocations = filteredAllocations.filter(
                    alloc => activeAllocationIds.has(alloc.id)
                );
            }

            // Build complete structure with employee details
            return filteredAllocations.map(allocation => {
                const employee = employees.find(emp => emp.id === allocation.employee_id);
                const hours = filteredHours.filter(h => h.resource_allocation_id === allocation.id);
                return {
                    ...allocation,
                    employee,
                    monthly_hours: hours
                };
            });
        } catch (error) {
            console.error('Error getting resource allocations:', error);
            throw error;
        }
    },

    // Update monthly hours for a resource allocation
    updateMonthlyHours: async (projectId: number, taskId: number, data: {
        resource_allocation_id: number,
        monthly_hours: MonthlyHour[]
    }): Promise<{
        monthly_hours: MonthlyHour[],
        total_hours: number,
        total_cost: number
    }> => {
        try {
            const { resource_allocation_id, monthly_hours: newHours } = data;

            // Verify the task exists and belongs to the project
            const task = wbsTasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            if (task.project_id !== projectId) {
                throw new Error('Task not found in project');
            }

            // Verify the resource allocation exists and belongs to the task
            const allocation = resourceAllocations.find(a => a.id === resource_allocation_id);
            if (!allocation) {
                throw new Error('Resource allocation not found');
            }
            if (allocation.wbs_task_id !== taskId) {
                throw new Error('Resource allocation not found for task');
            }

            // Remove all existing hours for this allocation
            monthlyHours = monthlyHours.filter(h => h.resource_allocation_id !== resource_allocation_id);

            // Add the new hours
            const updatedHours = newHours.map(hourData => ({
                ...hourData,
                id: getNewId(monthlyHours),
                resource_allocation_id,
                created_at: new Date(),
                updated_at: new Date()
            }));

            monthlyHours.push(...updatedHours);

            // Calculate new totals
            const totalHours = updatedHours.reduce(
                (sum, h) => sum + h.planned_hours, 0
            );
            const totalCost = totalHours * allocation.cost_rate;

            // Update resource allocation totals
            const allocationIndex = resourceAllocations.findIndex(
                a => a.id === resource_allocation_id
            );
            if (allocationIndex !== -1) {
                resourceAllocations[allocationIndex] = {
                    ...resourceAllocations[allocationIndex],
                    total_hours: totalHours,
                    total_cost: totalCost,
                    updated_at: new Date()
                };
            }

            return {
                monthly_hours: updatedHours,
                total_hours: totalHours,
                total_cost: totalCost
            };
        } catch (error) {
            console.error('Error updating monthly hours:', error);
            throw error;
        }
    },

    // Get a single WBS task by ID
    getWBSTaskById: async (taskId: number): Promise<WBSTask | undefined> => {
        try {
            return wbsTasks.find(task => task.id === taskId);
        } catch (error) {
            console.error('Error getting WBS task:', error);
            throw error;
        }
    },

    // Create a new WBS task
    createWBSTask: async (taskData: Partial<WBSTask>): Promise<WBSTask> => {
        try {
            const newTask: WBSTask = {
                id: getNewId(wbsTasks),
                ...taskData,
                created_at: new Date(),
                updated_at: new Date()
            } as WBSTask;
            wbsTasks.push(newTask);
            return newTask;
        } catch (error) {
            console.error('Error creating WBS task:', error);
            throw error;
        }
    },

    // Update an existing WBS task
    updateWBSTask: async (taskId: number, taskData: Partial<WBSTask>): Promise<WBSTask> => {
        try {
            const index = wbsTasks.findIndex(task => task.id === taskId);
            if (index !== -1) {
                const updatedTask: WBSTask = {
                    ...wbsTasks[index],
                    ...taskData,
                    id: taskId,
                    updated_at: new Date()
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

    // Create a new resource allocation
    createResourceAllocation: async (allocationData: Partial<WBSTaskResourceAllocation>): Promise<WBSTaskResourceAllocation> => {
        try {
            const newAllocation: WBSTaskResourceAllocation = {
                id: getNewId(resourceAllocations),
                ...allocationData,
                created_at: new Date(),
                updated_at: new Date()
            } as WBSTaskResourceAllocation;
            
            resourceAllocations.push(newAllocation);
            return newAllocation;
        } catch (error) {
            console.error('Error creating resource allocation:', error);
            throw error;
        }
    },

    // Update an existing resource allocation
    updateResourceAllocation: async (allocationId: number, data: Partial<WBSTaskResourceAllocation>): Promise<WBSTaskResourceAllocation> => {
        try {
            const index = resourceAllocations.findIndex(a => a.id === allocationId);
            if (index === -1) {
                throw new Error('Resource allocation not found');
            }

            const updatedAllocation: WBSTaskResourceAllocation = {
                ...resourceAllocations[index],
                ...data,
                updated_at: new Date()
            };

            resourceAllocations[index] = updatedAllocation;
            return updatedAllocation;
        } catch (error) {
            console.error('Error updating resource allocation:', error);
            throw error;
        }
    },

    // Reset data to initial state
    resetData: () => {
        wbsTasks = [...initialWbsTasks];
        resourceAllocations = [...initialResourceAllocations];
        monthlyHours = [...initialMonthlyHours];
        resourceRoles = [...initialResourceRoles];
        employees = [...initialEmployees];
        projectResources = [...initialProjectResources];
    }
};

export const WBSOptionsAPI = {
    getAllOptions: () => {
        return Promise.resolve(getWBSOptions());
    },

    getLevel1Options: () => {
        return Promise.resolve(getLevel1Options());
    },

    getLevel2Options: () => {
        return Promise.resolve(getLevel2Options());
    },

    getLevel3Options: (level2Value: string) => {
        return Promise.resolve(getLevel3Options(level2Value));
    }
};
