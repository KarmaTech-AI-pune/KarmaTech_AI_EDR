# React Component Patterns and Best Practices

## Component Structure Standards

### File Organization
```
frontend/src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components (LoadingSpinner, ConfirmationDialog)
│   ├── dashboard/      # Dashboard-specific components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components (SideMenu, Navbar)
│   ├── navigation/     # Navigation components
│   ├── project/        # Project-specific components
│   ├── shared/         # Shared utility components
│   └── widgets/        # Widget components
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── services/           # API service layer
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── theme/              # Material-UI theme configuration
```

### Component Naming Conventions
- **PascalCase** for component files: `LoadingSpinner.tsx`, `MetricCard.tsx`
- **PascalCase** for component names: `const LoadingSpinner: React.FC<Props>`
- **camelCase** for props interfaces: `interface LoadingSpinnerProps`
- **Test files**: `ComponentName.test.tsx` (co-located with component)

## Component Architecture Patterns

### 1. Functional Components with TypeScript
**ALWAYS use functional components with TypeScript interfaces:**

```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
  value: number;
  onChange?: (value: number) => void;
  isLoading?: boolean;
}

const MyComponent: React.FC<MyComponentProps> = ({
  title,
  value,
  onChange,
  isLoading = false
}) => {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
};

export default MyComponent;
```

### 2. Props Interface Guidelines
- **Required props first**, optional props last
- Use **optional chaining** (`?`) for optional props
- Provide **default values** in destructuring when appropriate
- Use **union types** for restricted values: `type Status = 'active' | 'inactive' | 'pending'`

```typescript
interface ComponentProps {
  // Required props
  id: string;
  title: string;
  
  // Optional props
  subtitle?: string;
  onClose?: () => void;
  
  // Props with restricted values
  variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  
  // Complex types
  data?: Array<{ id: number; name: string }>;
  config?: Record<string, unknown>;
}
```

### 3. Component Export Patterns
**Default exports for main components:**
```typescript
export default MyComponent;
```

**Named exports for utility components:**
```typescript
export const ConfirmationDialog: React.FC<Props> = ({ ... }) => { ... };
```

## Material-UI Integration Standards

### 1. Import Organization
**Group imports in this order:**
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Material-UI core components
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material';

// 3. Material-UI icons
import { Add, Edit, Delete } from '@mui/icons-material';

// 4. Material-UI hooks/utilities
import { useTheme } from '@mui/material/styles';

// 5. Third-party libraries
import axios from 'axios';

// 6. Internal imports
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
```

### 2. Material-UI Component Usage

#### Box Component (Layout Container)
**Use Box for layout and spacing:**
```typescript
<Box sx={{ 
  display: 'flex', 
  flexDirection: 'column',
  gap: 2,
  p: 3,
  mb: 2
}}>
  {/* Content */}
</Box>
```

#### Typography Component
**Use Typography for all text:**
```typescript
<Typography variant="h4" fontWeight="bold" color="text.primary">
  Title
</Typography>
<Typography variant="body2" color="text.secondary">
  Description
</Typography>
```

**Typography Variants:**
- `h1` - `h6`: Headings
- `body1`, `body2`: Body text
- `caption`: Small text
- `subtitle1`, `subtitle2`: Subtitles

#### Card Component
**Use Card for content containers:**
```typescript
<Card 
  sx={{ 
    height: '100%',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4]
    }
  }}
>
  <CardContent sx={{ p: 2 }}>
    {/* Content */}
  </CardContent>
</Card>
```

### 3. sx Prop Styling (Preferred Method)
**ALWAYS use sx prop for component styling:**

```typescript
<Box
  sx={{
    // Layout
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    // Spacing
    p: 2,           // padding: theme.spacing(2)
    m: 1,           // margin: theme.spacing(1)
    mb: 3,          // marginBottom: theme.spacing(3)
    gap: 2,         // gap: theme.spacing(2)
    
    // Sizing
    width: '100%',
    height: 'auto',
    minHeight: 200,
    
    // Colors (use theme)
    bgcolor: 'background.paper',
    color: 'text.primary',
    
    // Borders
    border: 1,
    borderColor: 'divider',
    borderRadius: 2,
    
    // Shadows
    boxShadow: 2,
    
    // Responsive
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    },
    
    // Hover states
    '&:hover': {
      bgcolor: 'action.hover',
      cursor: 'pointer'
    }
  }}
>
  {/* Content */}
</Box>
```

### 4. Theme Access
**Use useTheme hook for theme values:**
```typescript
import { useTheme } from '@mui/material/styles';

const MyComponent: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      color: theme.palette.primary.main,
      bgcolor: theme.palette.background.default,
      boxShadow: theme.shadows[3]
    }}>
      {/* Content */}
    </Box>
  );
};
```

## State Management Patterns

### 1. Local State with useState
**Use for component-specific state:**
```typescript
const [isLoading, setIsLoading] = useState<boolean>(false);
const [data, setData] = useState<DataType[]>([]);
const [error, setError] = useState<string | null>(null);
```

### 2. Side Effects with useEffect
**Use for data fetching and subscriptions:**
```typescript
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getData();
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchData();
}, [/* dependencies */]);
```

### 3. Context for Global State
**Use Context for shared state:**
```typescript
// context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
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
  
  const login = async (credentials: Credentials) => {
    // Login logic
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Component Composition Patterns

### 1. Container/Presentational Pattern
**Separate logic from presentation:**

```typescript
// Container Component (logic)
const ProjectListContainer: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Fetch data logic
  }, []);
  
  return <ProjectList projects={projects} isLoading={isLoading} />;
};

// Presentational Component (UI)
interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, isLoading }) => {
  if (isLoading) return <LoadingSpinner loading={true} />;
  
  return (
    <Box>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </Box>
  );
};
```

### 2. Compound Components Pattern
**For complex, related components:**

```typescript
// Parent component
const Accordion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Box>{children}</Box>;
};

// Child components
Accordion.Item = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Box>
      <Button onClick={() => setIsOpen(!isOpen)}>{title}</Button>
      {isOpen && <Box>{children}</Box>}
    </Box>
  );
};

// Usage
<Accordion>
  <Accordion.Item title="Section 1">Content 1</Accordion.Item>
  <Accordion.Item title="Section 2">Content 2</Accordion.Item>
</Accordion>
```

## Performance Optimization

### 1. React.memo for Expensive Components
```typescript
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  // Expensive rendering logic
  return <Box>{/* ... */}</Box>;
});
```

### 2. useCallback for Function Props
```typescript
const ParentComponent: React.FC = () => {
  const handleClick = useCallback((id: string) => {
    // Handle click
  }, [/* dependencies */]);
  
  return <ChildComponent onClick={handleClick} />;
};
```

### 3. useMemo for Expensive Calculations
```typescript
const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'active');
}, [data]);
```

## Error Handling Patterns

### 1. Error Boundaries
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Typography>Something went wrong.</Typography>;
    }
    return this.props.children;
  }
}
```

### 2. Try-Catch in Async Functions
```typescript
const fetchData = async () => {
  try {
    setIsLoading(true);
    const response = await apiService.getData();
    setData(response.data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    setError('Failed to load data. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

## Accessibility Standards

### 1. Semantic HTML and ARIA
```typescript
<Button
  aria-label="Close dialog"
  aria-describedby="dialog-description"
  onClick={handleClose}
>
  <CloseIcon />
</Button>
```

### 2. Keyboard Navigation
```typescript
<Box
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
>
  {/* Content */}
</Box>
```

## Testing Requirements

### 1. Component Tests
**Every component MUST have a test file:**
```typescript
// MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Common Anti-Patterns to Avoid

### ❌ DON'T: Inline styles
```typescript
// BAD
<div style={{ color: 'red', padding: '10px' }}>Text</div>
```

### ✅ DO: Use sx prop
```typescript
// GOOD
<Box sx={{ color: 'error.main', p: 1.25 }}>Text</Box>
```

### ❌ DON'T: Mutate state directly
```typescript
// BAD
data.push(newItem);
setData(data);
```

### ✅ DO: Create new state
```typescript
// GOOD
setData([...data, newItem]);
```

### ❌ DON'T: Use index as key
```typescript
// BAD
{items.map((item, index) => <div key={index}>{item}</div>)}
```

### ✅ DO: Use unique identifiers
```typescript
// GOOD
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

## Summary Checklist

Before submitting a component for review, ensure:
- ✅ TypeScript interfaces defined for all props
- ✅ Material-UI components used (no raw HTML)
- ✅ sx prop used for styling (no inline styles)
- ✅ Proper import organization
- ✅ Accessibility attributes included
- ✅ Error handling implemented
- ✅ Loading states handled
- ✅ Test file created
- ✅ No console.log statements (use proper logging)
- ✅ Follows naming conventions
