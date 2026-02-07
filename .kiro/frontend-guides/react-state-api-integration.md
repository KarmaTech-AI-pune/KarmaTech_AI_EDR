---
inclusion: manual
keywords: react, state, api, axios, hooks, context, integration
---

# React State Management and API Integration

## API Service Layer Architecture

Your project uses **Axios** for HTTP requests with a centralized service layer.

### API Service Structure
```
frontend/src/
├── api/                    # API configuration
│   └── axiosConfig.ts     # Axios instance with interceptors
├── services/              # API service modules
│   ├── authService.ts
│   ├── projectService.ts
│   ├── userService.ts
│   └── index.ts
└── types/                 # TypeScript types
    └── api.ts
```

## Axios Configuration

### Base Axios Instance
```typescript
// api/axiosConfig.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add auth token)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors globally)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - show error
      console.error('Access denied');
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

## API Service Patterns

### Service Module Template
```typescript
// services/projectService.ts
import axiosInstance from '../api/axiosConfig';
import { Project, CreateProjectDto, UpdateProjectDto } from '../types/project';

export const projectService = {
  // GET all projects
  getAll: async (params?: { status?: string; page?: number }): Promise<Project[]> => {
    const response = await axiosInstance.get<Project[]>('/projects', { params });
    return response.data;
  },
  
  // GET single project by ID
  getById: async (id: string): Promise<Project> => {
    const response = await axiosInstance.get<Project>(`/projects/${id}`);
    return response.data;
  },
  
  // POST create new project
  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await axiosInstance.post<Project>('/projects', data);
    return response.data;
  },
  
  // PUT update project
  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await axiosInstance.put<Project>(`/projects/${id}`, data);
    return response.data;
  },
  
  // PATCH partial update
  patch: async (id: string, data: Partial<UpdateProjectDto>): Promise<Project> => {
    const response = await axiosInstance.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },
  
  // DELETE project
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/projects/${id}`);
  },
  
  // Custom endpoint
  changeStatus: async (id: string, status: string): Promise<Project> => {
    const response = await axiosInstance.post<Project>(
      `/projects/${id}/status`,
      { status }
    );
    return response.data;
  }
};
```

### Authentication Service
```typescript
// services/authService.ts
import axiosInstance from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    
    // Store token
    localStorage.setItem('authToken', response.data.token);
    
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  getCurrentUser: (): User | null => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      const decoded = jwtDecode<User>(token);
      return decoded;
    } catch {
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};
```

## React State Management Patterns

### 1. Local Component State (useState)

**Use for:** Component-specific UI state

```typescript
import { useState } from 'react';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  
  return (
    <Box>
      {/* Component UI */}
    </Box>
  );
};
```

### 2. Data Fetching Pattern

**Standard pattern for API calls:**

```typescript
import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await projectService.getAll();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error fetching projects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []); // Empty dependency array = fetch once on mount
  
  if (isLoading) return <LoadingSpinner loading={true} />;
  if (error) return <Typography color="error">{error}</Typography>;
  
  return (
    <Box>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Box>
  );
};
```

### 3. Data Fetching with Dependencies

**Re-fetch when dependencies change:**

```typescript
const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const data = await projectService.getAll({ 
          status: filter, 
          page 
        });
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [filter, page]); // Re-fetch when filter or page changes
  
  return (
    <Box>
      <FilterButtons filter={filter} onChange={setFilter} />
      <ProjectGrid projects={projects} />
      <Pagination page={page} onChange={setPage} />
    </Box>
  );
};
```

### 4. Custom Hook for Data Fetching

**Reusable data fetching logic:**

```typescript
// hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

interface UseProjectsOptions {
  status?: string;
  page?: number;
}

export const useProjects = (options: UseProjectsOptions = {}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getAll(options);
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjects();
  }, [options.status, options.page]);
  
  const refetch = () => {
    fetchProjects();
  };
  
  return { projects, isLoading, error, refetch };
};

// Usage
const ProjectList: React.FC = () => {
  const { projects, isLoading, error, refetch } = useProjects({ status: 'active' });
  
  if (isLoading) return <LoadingSpinner loading={true} />;
  if (error) return <Typography color="error">{error}</Typography>;
  
  return (
    <Box>
      <Button onClick={refetch}>Refresh</Button>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Box>
  );
};
```

### 5. Mutation Pattern (Create/Update/Delete)

```typescript
const ProjectForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleSubmit = async (data: CreateProjectDto) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newProject = await projectService.create(data);
      
      // Navigate to new project
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <ProjectFormFields onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </Box>
  );
};
```

### 6. Optimistic Updates

**Update UI immediately, rollback on error:**

```typescript
const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
  const [localProject, setLocalProject] = useState(project);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleStatusChange = async (newStatus: string) => {
    // Save original state
    const originalStatus = localProject.status;
    
    // Optimistic update
    setLocalProject({ ...localProject, status: newStatus });
    
    try {
      setIsUpdating(true);
      await projectService.changeStatus(project.id, newStatus);
    } catch (err) {
      // Rollback on error
      setLocalProject({ ...localProject, status: originalStatus });
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card>
      <Typography>{localProject.name}</Typography>
      <Select
        value={localProject.status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating}
      >
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
      </Select>
    </Card>
  );
};
```

## Context API for Global State

### Auth Context Pattern
```typescript
// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);
  
  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage in main.tsx
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

// Usage in components
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <Box>
      <Typography>Welcome, {user?.name}</Typography>
      <Button onClick={logout}>Logout</Button>
    </Box>
  );
};
```

## Error Handling Patterns

### Global Error Handler
```typescript
// utils/errorHandler.ts
import { AxiosError } from 'axios';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Server responded with error
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 400:
          return `Bad Request: ${message}`;
        case 401:
          return 'Unauthorized. Please login again.';
        case 403:
          return 'Access denied.';
        case 404:
          return 'Resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return message;
      }
    }
    
    // Network error
    if (error.request) {
      return 'Network error. Please check your connection.';
    }
  }
  
  return 'An unexpected error occurred.';
};

// Usage
try {
  await projectService.create(data);
} catch (error) {
  const errorMessage = handleApiError(error);
  setError(errorMessage);
}
```

### Error Boundary Component
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Something went wrong
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {this.state.error?.message}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Loading States

### Skeleton Loading
```typescript
import { Skeleton, Card, CardContent } from '@mui/material';

const ProjectCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );
};

// Usage
const ProjectList: React.FC = () => {
  const { projects, isLoading } = useProjects();
  
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <ProjectCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }
  
  return <ProjectGrid projects={projects} />;
};
```

## Polling and Real-time Updates

### Polling Pattern
```typescript
const ProjectStatus: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [status, setStatus] = useState<string>('');
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const project = await projectService.getById(projectId);
        setStatus(project.status);
      } catch (err) {
        console.error(err);
      }
    };
    
    // Initial fetch
    fetchStatus();
    
    // Poll every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [projectId]);
  
  return <Typography>Status: {status}</Typography>;
};
```

## Best Practices

✅ **DO:**
- Use centralized API service layer
- Handle loading and error states
- Use TypeScript for type safety
- Implement request/response interceptors
- Store auth tokens securely
- Use custom hooks for reusable logic
- Implement optimistic updates for better UX
- Handle network errors gracefully
- Use Context for global state
- Clean up subscriptions in useEffect

❌ **DON'T:**
- Make API calls directly in components
- Ignore error handling
- Store sensitive data in localStorage (only tokens)
- Forget to handle loading states
- Make unnecessary API calls
- Mutate state directly
- Forget cleanup in useEffect
- Use any type (use proper TypeScript types)
- Expose API keys in frontend code
- Poll too frequently (respect server resources)

## Testing API Integration

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProjectList from './ProjectList';
import { projectService } from '../services/projectService';

vi.mock('../services/projectService');

describe('ProjectList', () => {
  it('fetches and displays projects', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' }
    ];
    
    vi.mocked(projectService.getAll).mockResolvedValue(mockProjects);
    
    render(<ProjectList />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
  });
  
  it('handles API errors', async () => {
    vi.mocked(projectService.getAll).mockRejectedValue(
      new Error('API Error')
    );
    
    render(<ProjectList />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```
