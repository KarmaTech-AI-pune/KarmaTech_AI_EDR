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

// Extended WBS Task type for API responses
interface ExtendedWBSTask extends Omit<WBSTask, 'resource_allocation'> {
    resource_allocation?: WBSTaskResourceAllocation & {
        employee?: Employee;
        monthly_hours?: MonthlyHour[];
    };
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
    monthlyHours = monthlyHours.filter(
        hour => !currentTaskIds.has(hour.task_id)
    );
    resourceAllocations = resourceAllocations.filter(
        allocation => !currentTaskIds.has(allocation.wbs_task_id)
    );
};

// Individual WBS Task Management
export const WBSTaskAPI = {
    getWBSTaskById: async (taskId: number): Promise<WBSTask | undefined> => {
        try {
            return wbsTasks.find(task => task.id === taskId);
        } catch (error) {
            console.error('Error getting WBS task:', error);
            throw error;
        }
    },

    createWBSTask: async (taskData: Partial<WBSTask>): Promise<WBSTask> => {
        try {
            const newTask: WBSTask = {
                id: getNewId(wbsTasks),
                project_id: taskData.project_id!,
                parent_id: taskData.parent_id || null,
                level: taskData.level!,
                title: taskData.title || '',
                created_at: new Date(),
                updated_at: new Date(),
                resource_allocation: taskData.resource_allocation
            };
            wbsTasks.push(newTask);
            return newTask;
        } catch (error) {
            console.error('Error creating WBS task:', error);
            throw error;
        }
    },

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

    deleteWBSTask: async (projectId: number, taskId: number): Promise<number[]> => {
        try {
            const getAllChildTaskIds = (parentId: number): number[] => {
                const childTasks = wbsTasks.filter(task => task.parent_id === parentId);
                return childTasks.reduce((ids: number[], task) => {
                    return [...ids, task.id, ...getAllChildTaskIds(task.id)];
                }, []);
            };

            const taskIdsToDelete = [taskId, ...getAllChildTaskIds(taskId)];
            monthlyHours = monthlyHours.filter(
                hour => !taskIdsToDelete.includes(hour.task_id)
            );
            resourceAllocations = resourceAllocations.filter(
                allocation => !taskIdsToDelete.includes(allocation.wbs_task_id)
            );
            wbsTasks = wbsTasks.filter(task => !taskIdsToDelete.includes(task.id));

            return taskIdsToDelete;
        } catch (error) {
            console.error('Error deleting WBS task:', error);
            throw error;
        }
    }
};

// Overall WBS Structure Management
export const WBSStructureAPI = {
    getProjectWBS: async (projectId: number): Promise<any[]> => {
        try {
            const tasks = wbsTasks.filter(task => task.project_id === projectId);
            
            return tasks.map(task => {
                const allocation = resourceAllocations.find(alloc => 
                    alloc.wbs_task_id === task.id
                );

                const taskHours = monthlyHours.filter(hour => 
                    hour.task_id === task.id
                );

                // Transform monthly hours into nested object structure
                const monthlyHoursObj: any = {};
                taskHours.forEach(hour => {
                    if (!monthlyHoursObj[hour.year]) {
                        monthlyHoursObj[hour.year] = {};
                    }
                    monthlyHoursObj[hour.year][hour.month] = hour.planned_hours;
                });

                return {
                    id: task.id,
                    level: task.level,
                    title: task.title,
                    role: allocation?.role_id || null,
                    name: allocation?.employee_id || null,
                    costRate: allocation?.cost_rate || 0,
                    monthlyHours: monthlyHoursObj,
                    odc: allocation?.odc || 0,
                    totalHours: allocation?.total_hours || 0,
                    totalCost: allocation?.total_cost || 0,
                    parentId: task.parent_id
                };
            });
        } catch (error) {
            console.error('Error getting project WBS:', error);
            throw error;
        }
    },

    saveWBSTasks: async (projectId: number, tasks: Partial<WBSTask>[]): Promise<{ created: number[], updated: number[] }> => {
        try {
            const createdTaskIds: number[] = [];
            const updatedTaskIds: number[] = [];

            tasks.forEach(task => {
                if (task.id) {
                    const index = wbsTasks.findIndex(t => t.id === task.id);
                    if (index !== -1) {
                        wbsTasks[index] = {
                            ...wbsTasks[index],
                            ...task,
                            updated_at: new Date()
                        };
                        updatedTaskIds.push(task.id);
                    }
                } else {
                    const newTask: WBSTask = {
                        id: getNewId(wbsTasks),
                        project_id: projectId,
                        parent_id: task.parent_id || null,
                        level: task.level!,
                        title: task.title || '',
                        created_at: new Date(),
                        updated_at: new Date(),
                        resource_allocation: task.resource_allocation
                    };
                    wbsTasks.push(newTask);
                    createdTaskIds.push(newTask.id);
                }
            });

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
    }
};

// Resource Management
export const ResourceAPI = {
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

    getResourceAllocations: async (projectId: number, month?: number, year?: number): Promise<WBSTaskResourceAllocation[]> => {
        try {
            const projectTasks = wbsTasks.filter(task => task.project_id === projectId);
            const taskIds = projectTasks.map(task => task.id);

            let filteredAllocations = resourceAllocations.filter(
                alloc => taskIds.includes(alloc.wbs_task_id)
            );

            let filteredHours = monthlyHours.filter(
                hour => taskIds.includes(hour.task_id)
            );

            if (month !== undefined && year !== undefined) {
                const monthStr = new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });
                const yearStr = year.toString();
                
                filteredHours = filteredHours.filter(
                    hour => hour.month === monthStr && hour.year === yearStr
                );
                const activeTaskIds = new Set(filteredHours.map(h => h.task_id));
                filteredAllocations = filteredAllocations.filter(
                    alloc => activeTaskIds.has(alloc.wbs_task_id)
                );
            }

            return filteredAllocations.map(allocation => {
                const employee = employees.find(emp => emp.id === allocation.employee_id);
                const hours = filteredHours.filter(h => h.task_id === allocation.wbs_task_id);
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

    createResourceAllocation: async (allocationData: Partial<WBSTaskResourceAllocation>): Promise<WBSTaskResourceAllocation> => {
        try {
            const newAllocation: WBSTaskResourceAllocation = {
                id: getNewId(resourceAllocations),
                wbs_task_id: allocationData.wbs_task_id!,
                role_id: allocationData.role_id!,
                employee_id: allocationData.employee_id!,
                cost_rate: allocationData.cost_rate!,
                odc: allocationData.odc || 0,
                total_hours: allocationData.total_hours,
                total_cost: allocationData.total_cost,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            resourceAllocations.push(newAllocation);
            return newAllocation;
        } catch (error) {
            console.error('Error creating resource allocation:', error);
            throw error;
        }
    },

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
    }
};

// Monthly Hours Management
export const MonthlyHoursAPI = {
    getMonthlyHoursByProjectId: async (projectId: number): Promise<MonthlyHour[]> => {
        try {
            const projectTasks = wbsTasks.filter(task => task.project_id === projectId);
            const taskIds = projectTasks.map(task => task.id);
            return monthlyHours.filter(hour => taskIds.includes(hour.task_id));
        } catch (error) {
            console.error('Error getting monthly hours by project:', error);
            throw error;
        }
    },

    updateMonthlyHours: async (projectId: number, taskId: number, data: {
        monthly_hours: Partial<MonthlyHour>[]
    }): Promise<{
        monthly_hours: MonthlyHour[],
        total_hours: number,
        total_cost: number
    }> => {
        try {
            const { monthly_hours: newHours } = data;

            const task = wbsTasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            if (task.project_id !== projectId) {
                throw new Error('Task not found in project');
            }

            monthlyHours = monthlyHours.filter(h => h.task_id !== taskId);

            const updatedHours = newHours.map(hourData => ({
                id: getNewId(monthlyHours),
                task_id: taskId,
                year: hourData.year!,
                month: hourData.month!,
                planned_hours: hourData.planned_hours!,
                actual_hours: hourData.actual_hours,
                created_at: new Date(),
                updated_at: new Date()
            }));

            monthlyHours.push(...updatedHours);

            const totalHours = updatedHours.reduce(
                (sum, h) => sum + h.planned_hours, 0
            );

            const taskAllocations = resourceAllocations.filter(a => a.wbs_task_id === taskId);
            let totalCost = 0;

            taskAllocations.forEach(allocation => {
                const allocationCost = totalHours * allocation.cost_rate;
                totalCost += allocationCost;

                const allocationIndex = resourceAllocations.findIndex(a => a.id === allocation.id);
                if (allocationIndex !== -1) {
                    resourceAllocations[allocationIndex] = {
                        ...resourceAllocations[allocationIndex],
                        total_hours: totalHours,
                        total_cost: allocationCost,
                        updated_at: new Date()
                    };
                }
            });

            return {
                monthly_hours: updatedHours,
                total_hours: totalHours,
                total_cost: totalCost
            };
        } catch (error) {
            console.error('Error updating monthly hours:', error);
            throw error;
        }
    }
};

// WBS Options Management
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

// Data Reset Function
export const resetData = () => {
    wbsTasks = [...initialWbsTasks];
    resourceAllocations = [...initialResourceAllocations];
    monthlyHours = [...initialMonthlyHours];
    resourceRoles = [...initialResourceRoles];
    employees = [...initialEmployees];
    projectResources = [...initialProjectResources];
};
