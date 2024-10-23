// File: frontend/src/types/index.ts
// Purpose: typescript types

export type screensArrayType = {
    [key : string] : JSX.Element
}

export type projectManagementAppContextType  = {
    screenState: string,
    setScreenState: React.Dispatch<React.SetStateAction<string>>,
    isAuthenticated: boolean,
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

export interface Project {
    id: number;
    name: string;
    clientName: string;
    estimatedCost: number;
    startDate: string;
    endDate: string;
    status: string;
    progress: number;
  }
  
  export interface ProjectItemProps {
    project: Project;
  }