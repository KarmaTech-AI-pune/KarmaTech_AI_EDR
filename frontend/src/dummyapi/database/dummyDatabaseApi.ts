import { wbsTasks as initialWbsTasks, taskProgress as initialTaskProgress, odcCosts as initialOdcCosts, resourceAllocations as initialResourceAllocations } from './dummyWBSTasks';
import { monthlyProgress as initialMonthlyProgress, resourceUtilization as initialResourceUtilization, resourceCapacity as initialResourceCapacity, projectFinancials as initialProjectFinancials } from './dummyMonthlyProgress';
import { resourceRoles as initialResourceRoles, employees as initialEmployees, projectResources as initialProjectResources } from './dummyResourceRoles';

// Mutable arrays to store data
let wbsTasks = [...initialWbsTasks];
let taskProgress = [...initialTaskProgress];
let odcCosts = [...initialOdcCosts];
let resourceAllocations = [...initialResourceAllocations];
let monthlyProgress = [...initialMonthlyProgress];
let resourceUtilization = [...initialResourceUtilization];
let resourceCapacity = [...initialResourceCapacity];
let projectFinancials = [...initialProjectFinancials];
let resourceRoles = [...initialResourceRoles];
let employees = [...initialEmployees];
let projectResources = [...initialProjectResources];

// WBS Tasks CRUD operations
export const WBSTasksAPI = {
  getAllTasks: () => wbsTasks,
  getTaskById: (id: number) => wbsTasks.find(task => task.id === id),
  createTask: (task: any) => {
    const newTask = { ...task, id: wbsTasks.length + 1 };
    wbsTasks.push(newTask);
    return newTask;
  },
  updateTask: (id: number, task: any) => {
    const index = wbsTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      wbsTasks[index] = { ...wbsTasks[index], ...task };
      return wbsTasks[index];
    }
    return null;
  },
  deleteTask: (id: number) => {
    const index = wbsTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      wbsTasks.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Task Progress CRUD operations
export const TaskProgressAPI = {
  getAllProgress: () => taskProgress,
  getProgressById: (id: number) => taskProgress.find(progress => progress.id === id),
  createProgress: (progress: any) => {
    const newProgress = { ...progress, id: taskProgress.length + 1 };
    taskProgress.push(newProgress);
    return newProgress;
  },
  updateProgress: (id: number, progress: any) => {
    const index = taskProgress.findIndex(p => p.id === id);
    if (index !== -1) {
      taskProgress[index] = { ...taskProgress[index], ...progress };
      return taskProgress[index];
    }
    return null;
  },
  deleteProgress: (id: number) => {
    const index = taskProgress.findIndex(p => p.id === id);
    if (index !== -1) {
      taskProgress.splice(index, 1);
      return true;
    }
    return false;
  }
};

// ODC Costs CRUD operations
export const ODCCostsAPI = {
  getAllCosts: () => odcCosts,
  getCostById: (id: number) => odcCosts.find(cost => cost.id === id),
  createCost: (cost: any) => {
    const newCost = { ...cost, id: odcCosts.length + 1 };
    odcCosts.push(newCost);
    return newCost;
  },
  updateCost: (id: number, cost: any) => {
    const index = odcCosts.findIndex(c => c.id === id);
    if (index !== -1) {
      odcCosts[index] = { ...odcCosts[index], ...cost };
      return odcCosts[index];
    }
    return null;
  },
  deleteCost: (id: number) => {
    const index = odcCosts.findIndex(c => c.id === id);
    if (index !== -1) {
      odcCosts.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Monthly Progress CRUD operations
export const MonthlyProgressAPI = {
  getAllProgress: () => monthlyProgress,
  getProgressById: (id: number) => monthlyProgress.find(progress => progress.id === id),
  createProgress: (progress: any) => {
    const newProgress = { ...progress, id: monthlyProgress.length + 1 };
    monthlyProgress.push(newProgress);
    return newProgress;
  },
  updateProgress: (id: number, progress: any) => {
    const index = monthlyProgress.findIndex(p => p.id === id);
    if (index !== -1) {
      monthlyProgress[index] = { ...monthlyProgress[index], ...progress };
      return monthlyProgress[index];
    }
    return null;
  },
  deleteProgress: (id: number) => {
    const index = monthlyProgress.findIndex(p => p.id === id);
    if (index !== -1) {
      monthlyProgress.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Resource Roles CRUD operations
export const ResourceRolesAPI = {
  getAllRoles: () => resourceRoles,
  getRoleById: (id: number) => resourceRoles.find(role => role.id === id),
  createRole: (role: any) => {
    const newRole = { ...role, id: resourceRoles.length + 1 };
    resourceRoles.push(newRole);
    return newRole;
  },
  updateRole: (id: number, role: any) => {
    const index = resourceRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      resourceRoles[index] = { ...resourceRoles[index], ...role };
      return resourceRoles[index];
    }
    return null;
  },
  deleteRole: (id: number) => {
    const index = resourceRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      resourceRoles.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Employees CRUD operations
export const EmployeesAPI = {
  getAllEmployees: () => employees,
  getEmployeeById: (id: number) => employees.find(employee => employee.id === id),
  createEmployee: (employee: any) => {
    const newEmployee = { ...employee, id: employees.length + 1 };
    employees.push(newEmployee);
    return newEmployee;
  },
  updateEmployee: (id: number, employee: any) => {
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...employee };
      return employees[index];
    }
    return null;
  },
  deleteEmployee: (id: number) => {
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      employees.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Project Resources CRUD operations
export const ProjectResourcesAPI = {
  getAllResources: () => projectResources,
  getResourceById: (id: number) => projectResources.find(resource => resource.id === id),
  createResource: (resource: any) => {
    const newResource = { ...resource, id: projectResources.length + 1 };
    projectResources.push(newResource);
    return newResource;
  },
  updateResource: (id: number, resource: any) => {
    const index = projectResources.findIndex(r => r.id === id);
    if (index !== -1) {
      projectResources[index] = { ...projectResources[index], ...resource };
      return projectResources[index];
    }
    return null;
  },
  deleteResource: (id: number) => {
    const index = projectResources.findIndex(r => r.id === id);
    if (index !== -1) {
      projectResources.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Resource Utilization CRUD operations
export const ResourceUtilizationAPI = {
  getAllUtilization: () => resourceUtilization,
  getUtilizationById: (id: number) => resourceUtilization.find(util => util.id === id),
  createUtilization: (utilization: any) => {
    const newUtilization = { ...utilization, id: resourceUtilization.length + 1 };
    resourceUtilization.push(newUtilization);
    return newUtilization;
  },
  updateUtilization: (id: number, utilization: any) => {
    const index = resourceUtilization.findIndex(u => u.id === id);
    if (index !== -1) {
      resourceUtilization[index] = { ...resourceUtilization[index], ...utilization };
      return resourceUtilization[index];
    }
    return null;
  },
  deleteUtilization: (id: number) => {
    const index = resourceUtilization.findIndex(u => u.id === id);
    if (index !== -1) {
      resourceUtilization.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Resource Capacity CRUD operations
export const ResourceCapacityAPI = {
  getAllCapacity: () => resourceCapacity,
  getCapacityById: (id: number) => resourceCapacity.find(cap => cap.id === id),
  createCapacity: (capacity: any) => {
    const newCapacity = { ...capacity, id: resourceCapacity.length + 1 };
    resourceCapacity.push(newCapacity);
    return newCapacity;
  },
  updateCapacity: (id: number, capacity: any) => {
    const index = resourceCapacity.findIndex(c => c.id === id);
    if (index !== -1) {
      resourceCapacity[index] = { ...resourceCapacity[index], ...capacity };
      return resourceCapacity[index];
    }
    return null;
  },
  deleteCapacity: (id: number) => {
    const index = resourceCapacity.findIndex(c => c.id === id);
    if (index !== -1) {
      resourceCapacity.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Project Financials CRUD operations
export const ProjectFinancialsAPI = {
  getAllFinancials: () => projectFinancials,
  getFinancialsById: (id: number) => projectFinancials.find(fin => fin.id === id),
  createFinancials: (financials: any) => {
    const newFinancials = { ...financials, id: projectFinancials.length + 1 };
    projectFinancials.push(newFinancials);
    return newFinancials;
  },
  updateFinancials: (id: number, financials: any) => {
    const index = projectFinancials.findIndex(f => f.id === id);
    if (index !== -1) {
      projectFinancials[index] = { ...projectFinancials[index], ...financials };
      return projectFinancials[index];
    }
    return null;
  },
  deleteFinancials: (id: number) => {
    const index = projectFinancials.findIndex(f => f.id === id);
    if (index !== -1) {
      projectFinancials.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Resource Allocations CRUD operations
export const ResourceAllocationsAPI = {
  getAllAllocations: () => resourceAllocations,
  getAllocationById: (id: number) => resourceAllocations.find(alloc => alloc.id === id),
  createAllocation: (allocation: any) => {
    const newAllocation = { ...allocation, id: resourceAllocations.length + 1 };
    resourceAllocations.push(newAllocation);
    return newAllocation;
  },
  updateAllocation: (id: number, allocation: any) => {
    const index = resourceAllocations.findIndex(a => a.id === id);
    if (index !== -1) {
      resourceAllocations[index] = { ...resourceAllocations[index], ...allocation };
      return resourceAllocations[index];
    }
    return null;
  },
  deleteAllocation: (id: number) => {
    const index = resourceAllocations.findIndex(a => a.id === id);
    if (index !== -1) {
      resourceAllocations.splice(index, 1);
      return true;
    }
    return false;
  }
};
