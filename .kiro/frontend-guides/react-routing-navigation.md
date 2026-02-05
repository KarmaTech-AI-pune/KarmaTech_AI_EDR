# React Router and Navigation Patterns

## React Router Setup

Your project uses **React Router v7** (`react-router-dom@^7.6.1`).

### Router Configuration

```typescript
// main.tsx or App.tsx
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

## Route Patterns

### Basic Routes
```typescript
<Routes>
  {/* Home route */}
  <Route path="/" element={<Home />} />
  
  {/* Static routes */}
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  
  {/* Dynamic routes with params */}
  <Route path="/projects/:projectId" element={<ProjectDetails />} />
  <Route path="/users/:userId/profile" element={<UserProfile />} />
  
  {/* Catch-all route (404) */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Nested Routes
```typescript
<Routes>
  <Route path="/" element={<Layout />}>
    {/* Index route (default child) */}
    <Route index element={<Dashboard />} />
    
    {/* Nested routes */}
    <Route path="projects" element={<ProjectsLayout />}>
      <Route index element={<ProjectList />} />
      <Route path=":id" element={<ProjectDetails />} />
      <Route path=":id/edit" element={<ProjectEdit />} />
      <Route path="new" element={<ProjectCreate />} />
    </Route>
    
    <Route path="settings" element={<SettingsLayout />}>
      <Route index element={<GeneralSettings />} />
      <Route path="profile" element={<ProfileSettings />} />
      <Route path="security" element={<SecuritySettings />} />
    </Route>
  </Route>
</Routes>
```

### Layout Component with Outlet
```typescript
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import SideMenu from './components/SideMenu';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SideMenu />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box component="main" sx={{ flex: 1, p: 3 }}>
          {/* Child routes render here */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
```

## Navigation Hooks

### useNavigate (Programmatic Navigation)
```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent: React.FC = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Navigate to path
    navigate('/projects');
    
    // Navigate with state
    navigate('/projects/123', { 
      state: { from: 'dashboard' } 
    });
    
    // Navigate back
    navigate(-1);
    
    // Navigate forward
    navigate(1);
    
    // Replace current entry (no back button)
    navigate('/login', { replace: true });
  };
  
  return <Button onClick={handleClick}>Go to Projects</Button>;
};
```

### useParams (Route Parameters)
```typescript
import { useParams } from 'react-router-dom';

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    }
  }, [projectId]);
  
  return <div>Project ID: {projectId}</div>;
};
```

### useLocation (Current Location)
```typescript
import { useLocation } from 'react-router-dom';

const MyComponent: React.FC = () => {
  const location = useLocation();
  
  // Access pathname
  console.log(location.pathname); // "/projects/123"
  
  // Access search params
  console.log(location.search); // "?tab=details"
  
  // Access state passed via navigate
  console.log(location.state); // { from: 'dashboard' }
  
  return <div>Current path: {location.pathname}</div>;
};
```

### useSearchParams (Query Parameters)
```typescript
import { useSearchParams } from 'react-router-dom';

const ProjectList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get query param
  const tab = searchParams.get('tab'); // "details"
  const page = searchParams.get('page') || '1';
  
  // Set query params
  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab, page: '1' });
  };
  
  // Update single param
  const handlePageChange = (newPage: number) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };
  
  return (
    <Box>
      <Tabs value={tab} onChange={(_, value) => handleTabChange(value)}>
        <Tab label="Details" value="details" />
        <Tab label="History" value="history" />
      </Tabs>
    </Box>
  );
};
```

## Link Components

### Basic Link
```typescript
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

// Standard link
<Link to="/projects">Projects</Link>

// Link with state
<Link to="/projects/123" state={{ from: 'dashboard' }}>
  View Project
</Link>

// Material-UI Button as Link
<Button component={Link} to="/projects" variant="contained">
  Go to Projects
</Button>
```

### NavLink (Active Link Styling)
```typescript
import { NavLink } from 'react-router-dom';
import { ListItem, ListItemButton, ListItemText } from '@mui/material';

// NavLink with active class
<NavLink
  to="/projects"
  className={({ isActive }) => isActive ? 'active-link' : ''}
>
  Projects
</NavLink>

// Material-UI ListItem with NavLink
<ListItem disablePadding>
  <ListItemButton
    component={NavLink}
    to="/projects"
    sx={{
      '&.active': {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        '&:hover': {
          bgcolor: 'primary.dark'
        }
      }
    }}
  >
    <ListItemText primary="Projects" />
  </ListItemButton>
</ListItem>
```

## Protected Routes Pattern

### Auth Guard Component
```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login, save attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Usage
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Dashboard />} />
    
    <Route
      path="admin"
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminPanel />
        </ProtectedRoute>
      }
    />
    
    <Route
      path="projects"
      element={
        <ProtectedRoute>
          <ProjectList />
        </ProtectedRoute>
      }
    />
  </Route>
</Routes>
```

### Login Redirect After Auth
```typescript
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const handleLogin = async (credentials: Credentials) => {
    try {
      await login(credentials);
      
      // Redirect to attempted location or default
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // Handle error
    }
  };
  
  return <LoginForm onSubmit={handleLogin} />;
};
```

## Navigation Menu Patterns

### Side Menu with Active State
```typescript
import { NavLink } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Dashboard,
  Folder,
  Settings,
  People
} from '@mui/icons-material';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: <Dashboard /> },
  { path: '/projects', label: 'Projects', icon: <Folder /> },
  { path: '/users', label: 'Users', icon: <People /> },
  { path: '/settings', label: 'Settings', icon: <Settings /> }
];

const SideMenu: React.FC = () => {
  return (
    <Drawer variant="permanent" sx={{ width: 240 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText'
                  }
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
```

### Breadcrumbs Navigation
```typescript
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  return (
    <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return isLast ? (
          <Typography key={to} color="text.primary">
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Typography>
        ) : (
          <Link
            key={to}
            to={to}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
```

### Tabs Navigation
```typescript
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';

const ProjectTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { label: 'Details', path: '/projects/123/details' },
    { label: 'Budget', path: '/projects/123/budget' },
    { label: 'Timeline', path: '/projects/123/timeline' },
    { label: 'Team', path: '/projects/123/team' }
  ];
  
  const currentTab = tabs.findIndex(tab => 
    location.pathname.startsWith(tab.path)
  );
  
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={currentTab !== -1 ? currentTab : 0}>
        {tabs.map((tab, index) => (
          <Tab
            key={tab.path}
            label={tab.label}
            onClick={() => navigate(tab.path)}
          />
        ))}
      </Tabs>
    </Box>
  );
};
```

## Route-Based Code Splitting

### Lazy Loading Routes
```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProjectList = lazy(() => import('./pages/ProjectList'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner loading={true} />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
      </Routes>
    </Suspense>
  );
}
```

## Navigation Guards and Middleware

### Before Navigation Hook
```typescript
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useNavigationGuard = (condition: boolean, redirectTo: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!condition) {
      navigate(redirectTo, { replace: true });
    }
  }, [condition, redirectTo, navigate, location]);
};

// Usage
const AdminPage: React.FC = () => {
  const { user } = useAuth();
  
  useNavigationGuard(
    user?.role === 'admin',
    '/unauthorized'
  );
  
  return <div>Admin Content</div>;
};
```

### Unsaved Changes Warning
```typescript
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

const useUnsavedChangesWarning = (hasUnsavedChanges: boolean) => {
  // Block navigation if there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname
  );
  
  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      
      if (confirmed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
  
  // Warn on browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
};

// Usage
const EditForm: React.FC = () => {
  const [hasChanges, setHasChanges] = useState(false);
  
  useUnsavedChangesWarning(hasChanges);
  
  return <form>...</form>;
};
```

## URL State Management

### Sync State with URL
```typescript
import { useSearchParams } from 'react-router-dom';

const ProjectList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get state from URL
  const page = parseInt(searchParams.get('page') || '1');
  const filter = searchParams.get('filter') || 'all';
  const sort = searchParams.get('sort') || 'name';
  
  // Update URL when state changes
  const handleFilterChange = (newFilter: string) => {
    setSearchParams({
      page: '1', // Reset to page 1
      filter: newFilter,
      sort
    });
  };
  
  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      filter,
      sort
    });
  };
  
  return (
    <Box>
      <FilterButtons filter={filter} onChange={handleFilterChange} />
      <ProjectGrid page={page} filter={filter} sort={sort} />
      <Pagination page={page} onChange={handlePageChange} />
    </Box>
  );
};
```

## Error Handling

### 404 Not Found Page
```typescript
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center'
      }}
    >
      <Typography variant="h1" fontWeight="bold">
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Page Not Found
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </Box>
  );
};
```

### Error Boundary with Router
```typescript
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const ErrorBoundary: React.FC = () => {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">
          {error.status} {error.statusText}
        </Typography>
        <Typography>{error.data}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Oops! Something went wrong</Typography>
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </Box>
  );
};
```

## Best Practices

✅ **DO:**
- Use `useNavigate` for programmatic navigation
- Use `NavLink` for navigation menus with active states
- Implement protected routes for authentication
- Use lazy loading for route-based code splitting
- Sync important state with URL query parameters
- Handle 404 and error cases
- Use `replace: true` for redirects (no back button)
- Implement breadcrumbs for deep navigation
- Warn users about unsaved changes

❌ **DON'T:**
- Use `<a>` tags for internal navigation (breaks SPA)
- Forget to handle loading states during navigation
- Store all state in URL (only important/shareable state)
- Navigate without considering user experience
- Forget to implement 404 pages
- Use window.location for navigation (use React Router)
- Ignore accessibility in navigation components
- Create deeply nested routes without breadcrumbs

## Testing Navigation

```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('Navigation', () => {
  it('navigates to project details', async () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    const link = screen.getByRole('link', { name: /view project/i });
    await userEvent.click(link);
    
    expect(window.location.pathname).toBe('/projects/123');
  });
});
```
