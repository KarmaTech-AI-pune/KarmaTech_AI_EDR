// File: frontend/src/types/index.ts
// Purpose: typescript types

export type screensArrayType = {
    [key : string] : JSX.Element
}

export type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export type projectManagementAppContextType  = {
    screenState: string,
    setScreenState: React.Dispatch<React.SetStateAction<string>>,
    isAuthenticated: boolean,
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    handleLogout: () => void;
}

export type Project = {
  id: number;
  name: string;
  clientName: string;
  estimatedCost: number;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
}

export type ProjectFormData = Omit<Project, 'id'>;
  
export type ProjectItemProps = {
  project: Project;
  onProjectDeleted?: (projectId: number) => void;
  onProjectUpdated?: () => void;
}

export type Credentials = {
  username: string;
  password: string;
}

export type LoginResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export type ProjectFormType = {
  project?: Project;
  onSubmit: (data: ProjectFormData) => void;
  onCancel?: () => void;
}
