# React Implementation Workflow - Top-Down Approach

## Overview

This document defines the **mandatory implementation order** for React features. All implementations MUST follow this top-down, structured approach to ensure consistency, maintainability, and proper architecture.

**📌 Applicability:** This workflow applies ONLY to React/Frontend implementations. Backend-only changes follow the backend implementation order defined in `workflow-enforcement-rules.md`.

**🔧 Flexibility:** 
- **Full-stack features:** Follow both backend AND frontend workflows
- **Frontend-only features:** Follow this React workflow
- **Backend-only features:** Skip this workflow, follow backend patterns only
- **Component library work:** May skip routing steps if no page is involved
- **Bug fixes/updates:** Maintain existing structure, apply workflow to new additions only

## 🎯 Core Principle

**Top-Down Development:** Start from the highest level (folders, routes, pages) and work down to the smallest components. Never start with individual components in isolation.

## 🔄 Implementation Flow Summary

**MANDATORY ORDER for all React implementations:**

1. **Project Setup & Base Structure** → Create folders and files first
2. **Type Definitions** → Define TypeScript interfaces
3. **API Service Layer** → Create service methods
4. **Custom Hooks** → Data-fetching logic (if needed)
5. **Skeleton Pages & Components** → Create basic structure with placeholders
6. **Routing Configuration** → Define routes using the skeleton pages
7. **Implement Page Logic** → Add full functionality to page containers
8. **Implement Component Logic** → Build out child components
9. **Component Integration** → Assemble and wire up components
10. **Validation & Error Handling** → Add validation, loading states, error handling
11. **Testing** → Write comprehensive tests

**Key Rule:** For any implementation requiring a page:
- ✅ Create skeleton pages and components FIRST (basic structure)
- ✅ Configure routes SECOND (using the skeleton pages)
- ✅ Implement full page logic THIRD (data fetching, state management)
- ✅ Implement child components LAST (detailed UI logic)

This ensures proper data flow and prevents orphaned components.

**⚠️ When This Workflow Applies:**
- ✅ Creating new pages with routes
- ✅ Building new features with UI components
- ✅ Full-stack features (apply backend workflow first, then frontend)

**⚠️ When You Can Be Flexible:**
- 🔧 Backend-only API changes (skip frontend workflow entirely)
- 🔧 Reusable component libraries (may skip routing/page steps)
- 🔧 Updating existing components (maintain current structure)
- 🔧 Bug fixes (fix in place, don't restructure)
- 🔧 Styling/CSS updates (no workflow needed)

---

## 📋 Mandatory Implementation Steps

### Step 1: Create Folder Structure

**ALWAYS start by creating the required folder structure.**

#### Required Actions:
1. Identify all folders needed for the feature
2. Create folders in the correct locations
3. Verify folder structure matches project standards

#### Example:
```bash
# For a "User Profile" feature
frontend/src/
├── pages/
│   └── UserProfile.tsx          # Create page first
├── components/
│   └── profile/                 # Create feature folder
│       ├── ProfileHeader.tsx
│       ├── ProfileDetails.tsx
│       └── ProfileSettings.tsx
├── services/
│   └── userService.ts           # Create service
├── types/
│   └── user.ts                  # Create types
└── hooks/
    └── useUserProfile.ts        # Create custom hook
```

#### Folder Creation Order:
1. **types/** - TypeScript interfaces first
2. **services/** - API service layer
3. **hooks/** - Custom hooks (if needed)
4. **pages/** - Page component
5. **components/[feature]/** - Feature-specific components

---

### Step 2: Define TypeScript Types

**Create all TypeScript interfaces and types BEFORE writing any components.**

#### Required Actions:
1. Create type definition files in `types/` folder
2. Define all interfaces for data models
3. Define prop interfaces for components
4. Export all types for reuse

#### Example:
```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface UserProfileProps {
  userId: string;
}

export interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
}
```

#### Why Types First?
- ✅ Provides clear contract for components
- ✅ Enables TypeScript autocomplete
- ✅ Prevents type errors during development
- ✅ Documents data structure

---

### Step 3: Create API Service Layer

**Create service methods BEFORE creating components that need data.**

#### Required Actions:
1. Create service file in `services/` folder
2. Define all API methods needed
3. Use proper TypeScript types
4. Follow existing service patterns

#### Example:
```typescript
// services/userService.ts
import axiosInstance from '../api/axiosConfig';
import { User } from '../types/user';

export const userService = {
  getUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  },
  
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${id}`, data);
    return response.data;
  }
};
```

---

### Step 4: Create Custom Hooks (If Needed)

**Create reusable data-fetching hooks BEFORE page components.**

#### Required Actions:
1. Create hook file in `hooks/` folder
2. Implement data fetching logic
3. Handle loading, error, and success states
4. Return clean interface for components

#### Example:
```typescript
// hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User } from '../types/user';

export const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getUserById(userId);
        setUser(data);
      } catch (err) {
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  return { user, isLoading, error };
};
```

---

### Step 5: Create Skeleton Pages & Components

**Create basic page and component structure BEFORE configuring routes.**

#### Required Actions:
1. Create skeleton page file in `pages/` folder
2. Create skeleton component files in `components/[feature]/` folder
3. Add basic structure with placeholders
4. Define prop interfaces
5. Add TODO comments for implementation

#### Example:
```typescript
// pages/UserProfile.tsx (SKELETON)
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const UserProfile: React.FC = () => {
  // TODO: Add route parameter extraction
  // TODO: Add data fetching logic
  // TODO: Add state management
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4">User Profile (Skeleton)</Typography>
        {/* TODO: Add ProfileHeader component */}
        {/* TODO: Add ProfileDetails component */}
        {/* TODO: Add ProfileSettings component */}
      </Box>
    </Container>
  );
};

export default UserProfile;
```

```typescript
// components/profile/ProfileHeader.tsx (SKELETON)
import React from 'react';
import { Box, Typography } from '@mui/material';
import { User } from '../../types/user';

interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEdit }) => {
  // TODO: Implement full UI logic
  
  return (
    <Box>
      <Typography>Profile Header (Skeleton)</Typography>
      {/* TODO: Add avatar, user info, edit button */}
    </Box>
  );
};

export default ProfileHeader;
```

#### Why Skeleton First?
- ✅ Allows route configuration with actual components
- ✅ Prevents import errors in routing
- ✅ Provides clear structure for implementation
- ✅ Makes it easy to see what needs to be built
- ✅ Enables parallel development of multiple components

---

### Step 6: Configure Routing

**Add route configuration using the skeleton pages created in Step 5.**

#### Required Actions:
1. Open routing configuration file
2. Add new route entry
3. Import skeleton page component (already created)
4. Configure route parameters if needed

#### Example:
```typescript
// routes/index.tsx or App.tsx
import { Routes, Route } from 'react-router-dom';
import UserProfile from '../pages/UserProfile'; // Skeleton already exists

<Routes>
  <Route path="/" element={<Layout />}>
    {/* Existing routes */}
    
    {/* New route using skeleton page */}
    <Route path="/users/:userId" element={<UserProfile />} />
  </Route>
</Routes>
```

#### Route Configuration Checklist:
- [ ] Route path defined
- [ ] Route parameters identified
- [ ] Skeleton page component imported (no errors)
- [ ] Protected route wrapper added (if needed)
- [ ] Parent layout specified

---

### Step 7: Implement Page Component Logic

**Implement full functionality in the skeleton page component created in Step 5.**

#### Required Actions:
1. Add route parameter extraction
2. Import and use hooks/services
3. Implement data fetching and state management
4. Add loading and error handling
5. Prepare props for child components
6. Replace TODO comments with actual implementation
7. **Decide on data flow pattern** (prop drilling vs Context API)

#### 🔑 Data Flow Decision Matrix:

**Use Prop Drilling when:**
- ✅ Data is only needed by 1-3 levels of components
- ✅ Component tree is shallow (< 3 levels deep)
- ✅ Data is simple (primitives, single objects)
- ✅ Components are tightly coupled to the page
- ✅ Example: User profile data passed to header and details

**Use Context API when:**
- ✅ Data is needed by 4+ levels of components
- ✅ Component tree is deep (≥ 3 levels)
- ✅ Data is complex (multiple related objects)
- ✅ Data is shared across many unrelated components
- ✅ Example: Theme, authentication, global settings

#### Example:
```typescript
// pages/UserProfile.tsx (FULL IMPLEMENTATION)
import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { useUserProfile } from '../hooks/useUserProfile';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import ProfileSettings from '../components/profile/ProfileSettings';

const UserProfile: React.FC = () => {
  // Extract route parameters
  const { userId } = useParams<{ userId: string }>();
  
  // Fetch data using custom hook
  const { user, isLoading, error } = useUserProfile(userId!);
  
  // Handle loading state
  if (isLoading) return <LoadingSpinner loading={true} />;
  
  // Handle error state
  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  
  // Handle no data
  if (!user) return null;
  
  // Render with child components
  // ✅ Using PROP DRILLING (shallow tree, simple data)
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Page orchestrates child components */}
        <ProfileHeader user={user} onEdit={() => {/* handle edit */}} />
        <ProfileDetails user={user} />
        <ProfileSettings userId={user.id} />
      </Box>
    </Container>
  );
};

export default UserProfile;
```

#### Example with Context API (for complex data):
```typescript
// pages/ProjectDashboard.tsx (CONTEXT API for deep tree)
import React, { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProject';

// Create context for project data (shared across many components)
interface ProjectContextType {
  project: Project;
  updateProject: (data: Partial<Project>) => Promise<void>;
  permissions: ProjectPermissions;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};

const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, updateProject, permissions, isLoading } = useProject(projectId!);
  
  if (isLoading) return <LoadingSpinner loading={true} />;
  if (!project) return null;
  
  // ✅ Using CONTEXT API (deep tree, complex data, many consumers)
  return (
    <ProjectContext.Provider value={{ project, updateProject, permissions }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <ProjectHeader /> {/* Uses context internally */}
        <ProjectTabs>
          <ProjectOverview /> {/* Uses context internally */}
          <ProjectBudget /> {/* Uses context internally */}
          <ProjectTeam /> {/* Uses context internally */}
        </ProjectTabs>
      </Container>
    </ProjectContext.Provider>
  );
};

export default ProjectDashboard;
```

#### Page Component Responsibilities:
- ✅ Route parameter extraction
- ✅ Data fetching via hooks/services
- ✅ State management
- ✅ Loading/error handling
- ✅ Layout structure
- ✅ Child component orchestration
- ✅ Props preparation

#### Page Component Should NOT:
- ❌ Contain detailed UI elements
- ❌ Have complex styling
- ❌ Implement business logic directly
- ❌ Be reusable (pages are route-specific)

---

### Step 8: Implement Child Component Logic

**Implement full functionality in skeleton child components created in Step 5.**

#### Required Actions:
1. Replace skeleton structure with full UI implementation
2. Implement all prop-driven logic
3. Add proper styling with Material-UI
4. **Ensure components are reusable** (not tightly coupled to specific pages)
5. Keep components focused and single-purpose
6. Use appropriate data access pattern (props vs context)

#### 🎯 Component Reusability Guidelines:

**Make components reusable by:**
- ✅ Accepting data via props (not hardcoding)
- ✅ Using generic prop names (e.g., `data` instead of `userData`)
- ✅ Avoiding page-specific logic
- ✅ Keeping components small and focused
- ✅ Using composition over inheritance
- ✅ Exporting components for use in other pages

**Example: Reusable Component (Good)**
```typescript
// components/common/DataCard.tsx (REUSABLE)
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface DataCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error';
}

const DataCard: React.FC<DataCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'primary' 
}) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon && <Box sx={{ color: `${color}.main` }}>{icon}</Box>}
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataCard;

// ✅ Can be reused in multiple pages:
// <DataCard title="Total Users" value={1234} icon={<People />} />
// <DataCard title="Revenue" value="$50,000" icon={<AttachMoney />} color="success" />
```

**Example: Non-Reusable Component (Bad)**
```typescript
// ❌ BAD: Tightly coupled to UserProfile page
const ProfileCard: React.FC = () => {
  const { user } = useUserProfile(); // ❌ Fetches data internally
  
  return (
    <Card>
      <CardContent>
        <Typography>{user.name}</Typography> {/* ❌ Hardcoded structure */}
      </CardContent>
    </Card>
  );
};
```

#### Example:
```typescript
// components/profile/ProfileHeader.tsx (FULL IMPLEMENTATION)
import React from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { User } from '../../types/user';

interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
}

// ✅ REUSABLE: Accepts data via props, no internal data fetching
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEdit }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Avatar
        src={user.avatar}
        sx={{ width: 100, height: 100 }}
      >
        {user.name.charAt(0)}
      </Avatar>
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" fontWeight="bold">
          {user.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user.email}
        </Typography>
      </Box>
      
      <Button
        variant="outlined"
        startIcon={<Edit />}
        onClick={onEdit}
      >
        Edit Profile
      </Button>
    </Box>
  );
};

export default ProfileHeader;
```

#### Example with Context API (for deeply nested components):
```typescript
// components/project/ProjectBudgetChart.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useProjectContext } from '../../pages/ProjectDashboard';

// ✅ Uses Context API (avoids prop drilling through 4+ levels)
const ProjectBudgetChart: React.FC = () => {
  // Access project data from context (no props needed)
  const { project, permissions } = useProjectContext();
  
  // Only render if user has permission
  if (!permissions.canViewBudget) {
    return <Typography>No permission to view budget</Typography>;
  }
  
  return (
    <Box>
      <Typography variant="h6">Budget: ${project.budget}</Typography>
      {/* Chart implementation */}
    </Box>
  );
};

export default ProjectBudgetChart;
```

#### 🔑 When to Use Props vs Context:

**Use Props (Prop Drilling) when:**
```typescript
// ✅ GOOD: Shallow component tree (1-2 levels)
<UserProfile>
  <ProfileHeader user={user} />           {/* Level 1 */}
  <ProfileDetails user={user} />          {/* Level 1 */}
</UserProfile>
```

**Use Context API when:**
```typescript
// ✅ GOOD: Deep component tree (3+ levels)
<ProjectDashboard>
  <ProjectContext.Provider value={{ project, permissions }}>
    <ProjectTabs>                         {/* Level 1 */}
      <ProjectOverview>                   {/* Level 2 */}
        <ProjectMetrics>                  {/* Level 3 */}
          <BudgetChart />                 {/* Level 4 - uses context */}
          <TimelineChart />               {/* Level 4 - uses context */}
        </ProjectMetrics>
      </ProjectOverview>
    </ProjectTabs>
  </ProjectContext.Provider>
</ProjectDashboard>
```

#### Component Implementation Order:
1. **Layout components** (headers, containers)
2. **Display components** (cards, lists)
3. **Interactive components** (forms, buttons)
4. **Utility components** (modals, dialogs)

#### Component Best Practices:
- ✅ Single responsibility
- ✅ Prop-driven (receive data from parent)
- ✅ Reusable across pages
- ✅ Minimal state (prefer props)
- ✅ Clear prop interfaces
- ✅ Proper TypeScript types
- ✅ **Choose appropriate data flow pattern** (props vs context)
- ✅ **Design for reusability** (generic, composable)
- ✅ **NEVER write redundant code** (DRY principle - Don't Repeat Yourself)

---

## 📋 Component Reusability & Data Flow Patterns

### 🎯 Reusability Principles

#### 1. Design Components to be Generic

**❌ Bad: Specific to one use case**
```typescript
const UserNameDisplay: React.FC = () => {
  const { user } = useUserProfile();
  return <Typography>{user.name}</Typography>;
};
```

**✅ Good: Generic and reusable**
```typescript
interface NameDisplayProps {
  name: string;
  variant?: 'h4' | 'h5' | 'h6';
}

const NameDisplay: React.FC<NameDisplayProps> = ({ name, variant = 'h5' }) => {
  return <Typography variant={variant}>{name}</Typography>;
};

// Can be used for users, projects, teams, etc.
```

#### 2. Use Composition Over Inheritance

**❌ Bad: Inheritance-based**
```typescript
class BaseCard extends React.Component { ... }
class UserCard extends BaseCard { ... }
class ProjectCard extends BaseCard { ... }
```

**✅ Good: Composition-based**
```typescript
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MuiCard>{children}</MuiCard>
);

const UserCard: React.FC<{ user: User }> = ({ user }) => (
  <Card>
    <Typography>{user.name}</Typography>
  </Card>
);

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <Card>
    <Typography>{project.name}</Typography>
  </Card>
);
```

#### 3. Extract Common Patterns

**Identify repeated patterns and extract them:**
```typescript
// ✅ Reusable InfoRow component
interface InfoRowProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
    {icon}
    <Typography variant="body2" color="text.secondary">{label}:</Typography>
    <Typography variant="body1" fontWeight="medium">{value}</Typography>
  </Box>
);

// Use in multiple components:
<InfoRow label="Email" value={user.email} icon={<Email />} />
<InfoRow label="Phone" value={user.phone} icon={<Phone />} />
<InfoRow label="Location" value={user.location} icon={<Place />} />
```

### 🔄 Data Flow Patterns

#### Pattern 1: Prop Drilling (Simple, Shallow Trees)

**When to use:**
- Component tree is 1-3 levels deep
- Data is simple (primitives, single objects)
- Components are tightly related

**Example:**
```typescript
// Page (Level 0)
const UserProfile: React.FC = () => {
  const { user } = useUserProfile();
  
  return (
    <Container>
      <ProfileHeader user={user} />        {/* Level 1 */}
      <ProfileDetails user={user} />       {/* Level 1 */}
    </Container>
  );
};

// Component (Level 1)
const ProfileDetails: React.FC<{ user: User }> = ({ user }) => (
  <Box>
    <InfoSection user={user} />            {/* Level 2 */}
    <ContactSection user={user} />         {/* Level 2 */}
  </Box>
);

// ✅ Only 2 levels deep - prop drilling is fine
```

#### Pattern 2: Context API (Complex, Deep Trees)

**When to use:**
- Component tree is 4+ levels deep
- Data is complex (multiple related objects)
- Data is shared across many unrelated components
- Avoiding "prop drilling hell"

**Example:**
```typescript
// 1. Create Context
interface ProjectContextType {
  project: Project;
  budget: Budget;
  team: TeamMember[];
  permissions: Permissions;
  updateProject: (data: Partial<Project>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 2. Create Custom Hook
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};

// 3. Provide Context at Page Level
const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  const { project, budget, team, permissions } = useProject(projectId!);
  
  const updateProject = async (data: Partial<Project>) => {
    await projectService.update(projectId!, data);
  };
  
  return (
    <ProjectContext.Provider value={{ project, budget, team, permissions, updateProject }}>
      <Container>
        <ProjectHeader />                  {/* Level 1 */}
        <ProjectTabs>                      {/* Level 2 */}
          <ProjectOverview />              {/* Level 3 */}
          <ProjectBudget />                {/* Level 3 */}
        </ProjectTabs>
      </Container>
    </ProjectContext.Provider>
  );
};

// 4. Consume Context in Deep Components
const BudgetChart: React.FC = () => {
  const { budget, permissions } = useProjectContext(); // ✅ No prop drilling!
  
  if (!permissions.canViewBudget) return null;
  
  return <Chart data={budget} />;
};
```

#### Pattern 3: Hybrid Approach (Best of Both)

**Combine props and context based on needs:**
```typescript
// Use Context for global/shared data
const ProjectDashboard: React.FC = () => {
  const { project, permissions } = useProject();
  
  return (
    <ProjectContext.Provider value={{ project, permissions }}>
      <Container>
        {/* Use props for component-specific data */}
        <ProjectHeader 
          title={project.name}           {/* Prop: specific to header */}
          onEdit={handleEdit}            {/* Prop: specific callback */}
        />
        
        {/* Context used internally for shared data */}
        <ProjectMetrics />               {/* Uses context internally */}
        <ProjectBudget />                {/* Uses context internally */}
      </Container>
    </ProjectContext.Provider>
  );
};
```

### 📊 Decision Matrix: Props vs Context

| Criteria | Props | Context |
|----------|-------|---------|
| **Tree Depth** | 1-3 levels | 4+ levels |
| **Data Complexity** | Simple (1-2 objects) | Complex (3+ objects) |
| **Number of Consumers** | 1-3 components | 4+ components |
| **Update Frequency** | Frequent | Infrequent |
| **Component Coupling** | Tight (parent-child) | Loose (unrelated) |
| **Performance** | Better (no re-renders) | Good (with optimization) |
| **Testability** | Easier (just props) | Harder (mock context) |

### 🎯 Best Practices Summary

**Component Reusability:**
1. ✅ Accept data via props, not internal fetching
2. ✅ Use generic prop names (`data`, `items`, `value`)
3. ✅ Keep components small and focused
4. ✅ Extract common patterns into shared components
5. ✅ Use composition over inheritance
6. ✅ Make components configurable (variants, sizes, colors)

**Data Flow:**
1. ✅ Start with props (simplest approach)
2. ✅ Use context when prop drilling becomes painful (4+ levels)
3. ✅ Combine props and context for optimal solution
4. ✅ Keep context values stable (use useMemo)
5. ✅ Split contexts by concern (AuthContext, ThemeContext, etc.)
6. ✅ Document when and why context is used

**Anti-Patterns to Avoid:**
1. ❌ Fetching data inside reusable components
2. ❌ Using context for everything (overkill)
3. ❌ Prop drilling through 5+ levels (use context)
4. ❌ Tightly coupling components to specific pages
5. ❌ Creating components that can't be reused
6. ❌ Mixing data fetching and UI logic in same component
7. ❌ **Writing redundant code (violates DRY principle)**

---

## 🚫 Code Redundancy Prevention

### The DRY Principle: Don't Repeat Yourself

**CRITICAL RULE:** Never write the same code twice. If you find yourself copying and pasting code, STOP and extract it into a reusable component, function, or utility.

### Common Redundancy Patterns to Avoid

#### 1. Duplicate Component Logic

**❌ BAD: Redundant components**
```typescript
// UserCard.tsx
const UserCard: React.FC<{ user: User }> = ({ user }) => (
  <Card>
    <CardContent>
      <Avatar src={user.avatar} />
      <Typography variant="h6">{user.name}</Typography>
      <Typography variant="body2">{user.email}</Typography>
    </CardContent>
  </Card>
);

// ProjectCard.tsx (DUPLICATE STRUCTURE!)
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <Card>
    <CardContent>
      <Avatar src={project.logo} />
      <Typography variant="h6">{project.name}</Typography>
      <Typography variant="body2">{project.description}</Typography>
    </CardContent>
  </Card>
);
```

**✅ GOOD: Generic reusable component**
```typescript
// EntityCard.tsx (ONE component for all use cases)
interface EntityCardProps {
  avatar?: string;
  title: string;
  subtitle: string;
}

const EntityCard: React.FC<EntityCardProps> = ({ avatar, title, subtitle }) => (
  <Card>
    <CardContent>
      {avatar && <Avatar src={avatar} />}
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2">{subtitle}</Typography>
    </CardContent>
  </Card>
);

// Usage:
<EntityCard avatar={user.avatar} title={user.name} subtitle={user.email} />
<EntityCard avatar={project.logo} title={project.name} subtitle={project.description} />
```

#### 2. Duplicate Data Fetching Logic

**❌ BAD: Repeated fetch logic**
```typescript
// UserProfile.tsx
const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getById(userId);
        setUser(data);
      } catch (err) {
        setError('Failed to load user');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);
};

// UserSettings.tsx (DUPLICATE FETCH LOGIC!)
const UserSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getById(userId);
        setUser(data);
      } catch (err) {
        setError('Failed to load user');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);
};
```

**✅ GOOD: Extract into custom hook**
```typescript
// hooks/useUser.ts (ONE hook for all use cases)
export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getById(userId);
        setUser(data);
      } catch (err) {
        setError('Failed to load user');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);
  
  return { user, isLoading, error };
};

// Usage in both components:
const UserProfile: React.FC = () => {
  const { user, isLoading, error } = useUser(userId);
  // ...
};

const UserSettings: React.FC = () => {
  const { user, isLoading, error } = useUser(userId);
  // ...
};
```

#### 3. Duplicate Styling

**❌ BAD: Repeated sx props**
```typescript
// Multiple components with same styling
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2 }}>
  {/* Content */}
</Box>

<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2 }}>
  {/* Different content */}
</Box>
```

**✅ GOOD: Extract into styled component or constant**
```typescript
// Option 1: Styled component
const FlexContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius
}));

// Usage:
<FlexContainer>{/* Content */}</FlexContainer>
<FlexContainer>{/* Different content */}</FlexContainer>

// Option 2: Style constant
const flexContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  p: 2,
  borderRadius: 2
};

<Box sx={flexContainerStyles}>{/* Content */}</Box>
<Box sx={flexContainerStyles}>{/* Different content */}</Box>
```

#### 4. Duplicate Validation Logic

**❌ BAD: Repeated validation schemas**
```typescript
// CreateUserForm.tsx
const createUserSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone')
});

// EditUserForm.tsx (DUPLICATE SCHEMA!)
const editUserSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone')
});
```

**✅ GOOD: Shared validation schema**
```typescript
// schemas/userSchema.ts (ONE schema for all forms)
export const userSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone')
});

// For partial updates
export const userUpdateSchema = userSchema.partial();

// Usage:
const CreateUserForm: React.FC = () => {
  const { control } = useForm({ resolver: zodResolver(userSchema) });
};

const EditUserForm: React.FC = () => {
  const { control } = useForm({ resolver: zodResolver(userUpdateSchema) });
};
```

#### 5. Duplicate Utility Functions

**❌ BAD: Same function in multiple files**
```typescript
// UserProfile.tsx
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// ProjectDetails.tsx (DUPLICATE FUNCTION!)
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};
```

**✅ GOOD: Extract into utility file**
```typescript
// utils/dateUtils.ts (ONE function for all use cases)
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// Usage:
import { formatDate } from '../utils/dateUtils';

const UserProfile: React.FC = () => {
  return <Typography>{formatDate(user.createdAt)}</Typography>;
};

const ProjectDetails: React.FC = () => {
  return <Typography>{formatDate(project.startDate)}</Typography>;
};
```

### Redundancy Detection Checklist

**Before writing code, ask:**
- [ ] Have I written similar code before?
- [ ] Can this logic be extracted into a reusable component?
- [ ] Can this be a custom hook?
- [ ] Can this be a utility function?
- [ ] Am I copying and pasting code?
- [ ] Do multiple components have the same structure?
- [ ] Do multiple components fetch data the same way?
- [ ] Do multiple components have the same validation?

**If you answer YES to any question, STOP and refactor!**

### Refactoring Strategy

**When you find redundant code:**

1. **Identify the pattern** - What's being repeated?
2. **Extract to appropriate location:**
   - UI patterns → Reusable component (`components/common/`)
   - Data fetching → Custom hook (`hooks/`)
   - Business logic → Utility function (`utils/`)
   - Validation → Schema file (`schemas/`)
   - Styling → Styled component or constant
3. **Replace all instances** - Update all places using the old code
4. **Test thoroughly** - Ensure nothing breaks

### Code Organization for DRY

```
frontend/src/
├── components/
│   ├── common/          # Reusable UI components (NO REDUNDANCY)
│   │   ├── DataCard.tsx
│   │   ├── EntityHeader.tsx
│   │   └── InfoRow.tsx
│   └── feature/         # Feature-specific components
├── hooks/               # Reusable custom hooks (NO REDUNDANCY)
│   ├── useUser.ts
│   ├── useProject.ts
│   └── useFetch.ts
├── utils/               # Reusable utility functions (NO REDUNDANCY)
│   ├── dateUtils.ts
│   ├── formatUtils.ts
│   └── validationUtils.ts
├── schemas/             # Reusable validation schemas (NO REDUNDANCY)
│   ├── userSchema.ts
│   └── projectSchema.ts
└── styles/              # Reusable styled components (NO REDUNDANCY)
    ├── containers.ts
    └── typography.ts
```

### Benefits of DRY Code

1. **Maintainability** - Fix bugs in one place, not ten
2. **Consistency** - Same behavior everywhere
3. **Testability** - Test once, works everywhere
4. **Readability** - Less code to read and understand
5. **Performance** - Smaller bundle size
6. **Scalability** - Easy to add new features

### Red Flags (Signs of Redundancy)

🚩 **Copy-pasting code between files**  
🚩 **Similar component names** (UserCard, ProjectCard, TeamCard)  
🚩 **Repeated useEffect patterns**  
🚩 **Same validation rules in multiple forms**  
🚩 **Identical styling in multiple components**  
🚩 **Same utility functions in multiple files**  
🚩 **Duplicate API calls**  

**If you see any red flag, REFACTOR IMMEDIATELY!**

---

### Step 9: Component Integration

**Wire up all components with proper data flow and event handling.**

#### Required Actions:
1. Verify all child components are imported in page
2. Ensure props are passed correctly from page state
3. Implement event handlers for component interactions
4. Establish proper data flow (parent → child)
5. Coordinate communication between components

#### Example:
```typescript
// pages/UserProfile.tsx (FULL INTEGRATION)
const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, isLoading, error } = useUserProfile(userId!);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = async (updatedUser: Partial<User>) => {
    await userService.updateUser(userId!, updatedUser);
    setIsEditing(false);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Components fully integrated with proper props and handlers */}
        <ProfileHeader 
          user={user} 
          onEdit={handleEdit} 
        />
        
        <ProfileDetails 
          user={user} 
          isEditing={isEditing}
          onSave={handleSave}
        />
        
        <ProfileSettings 
          userId={user.id}
          onUpdate={() => {/* refresh data */}}
        />
      </Box>
    </Container>
  );
};
```

#### Integration Checklist:
- [ ] All components imported
- [ ] Props passed correctly
- [ ] Event handlers defined
- [ ] Data flow established (parent → child)
- [ ] Component communication handled
- [ ] No prop drilling issues

---

### Step 10: Add Validation & Error Handling

**Enhance components with proper validation and error handling.**

#### Required Actions:
1. Add form validation (if forms exist)
2. Implement error boundaries
3. Add user feedback (success/error messages)
4. Handle edge cases
5. Add loading states for async operations

#### Example:
```typescript
// Add validation to form component
const ProfileEditForm: React.FC<Props> = ({ user, onSave }) => {
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email')
  });
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: user
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(data);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}
      {/* Form fields */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </Box>
  );
};
```

---

### Step 11: Create Tests

**Write tests for components and pages.**

#### Required Actions:
1. Create test files alongside components
2. Test page component behavior
3. Test child component rendering
4. Test user interactions
5. Test error scenarios

#### Example:
```typescript
// pages/UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from './UserProfile';
import { userService } from '../services/userService';

vi.mock('../services/userService');

describe('UserProfile', () => {
  it('renders user profile data', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };
    
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser);
    
    render(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });
});
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ DON'T: Start with Components
```typescript
// BAD - Creating component without page context
// components/UserCard.tsx
const UserCard = () => {
  // What props does this need?
  // Where will this be used?
  // What data structure?
};
```

### ✅ DO: Start with Page Structure
```typescript
// GOOD - Page defines requirements first
// pages/UserProfile.tsx
const UserProfile = () => {
  const { user } = useUserProfile();
  
  return (
    <Container>
      {/* Now we know what UserCard needs */}
      <UserCard user={user} onEdit={handleEdit} />
    </Container>
  );
};
```

### ❌ DON'T: Skip Folder Structure
```typescript
// BAD - Creating files without structure
components/ProfileHeader.tsx
components/ProfileDetails.tsx
components/ProfileSettings.tsx
```

### ✅ DO: Organize by Feature
```typescript
// GOOD - Clear feature organization
components/profile/ProfileHeader.tsx
components/profile/ProfileDetails.tsx
components/profile/ProfileSettings.tsx
```

### ❌ DON'T: Mix Concerns in Components
```typescript
// BAD - Component doing too much
const UserProfile = () => {
  const [user, setUser] = useState();
  
  useEffect(() => {
    fetch('/api/users/1').then(/* ... */);
  }, []);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {/* Lots of UI code */}
    </div>
  );
};
```

### ✅ DO: Separate Concerns
```typescript
// GOOD - Clear separation
// Page handles data
const UserProfile = () => {
  const { user } = useUserProfile();
  return <ProfileView user={user} />;
};

// Component handles UI
const ProfileView = ({ user }) => {
  return (
    <Box>
      <Typography variant="h4">{user.name}</Typography>
      <Typography>{user.email}</Typography>
    </Box>
  );
};
```

---

## 📊 Implementation Checklist

Use this checklist for every new feature:

### Pre-Implementation
- [ ] Feature requirements understood
- [ ] Folder structure planned
- [ ] Data models identified
- [ ] API endpoints known

### Step-by-Step Implementation
- [ ] **Step 1:** Folders created
- [ ] **Step 2:** TypeScript types defined
- [ ] **Step 3:** API service created
- [ ] **Step 4:** Custom hooks created (if needed)
- [ ] **Step 5:** Skeleton pages and components created
- [ ] **Step 6:** Route configured (using skeleton pages)
- [ ] **Step 7:** Page component logic implemented
- [ ] **Step 8:** Child component logic implemented
- [ ] **Step 9:** Components integrated and wired up
- [ ] **Step 10:** Validation & error handling added
- [ ] **Step 11:** Tests written

### Quality Checks
- [ ] All TypeScript types defined
- [ ] No TypeScript errors
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Components are reusable
- [ ] Props properly typed
- [ ] Tests passing
- [ ] Code follows patterns

---

## 🎯 Summary

**The Golden Rule:** Always work top-down, never bottom-up.

**Implementation Order:**
1. Folders & Structure
2. Types & Interfaces
3. Services & Hooks
4. Skeleton Pages & Components
5. Routes (using skeletons)
6. Implement Page Logic
7. Implement Component Logic
8. Integration & Wiring
9. Validation & Enhancement
10. Testing

**Key Benefits:**
- ✅ Clear architecture from the start
- ✅ Proper data flow (parent → child)
- ✅ Reusable components
- ✅ Maintainable codebase
- ✅ Easier testing
- ✅ Better collaboration

**Remember:** Pages orchestrate, components execute. Start with the orchestrator (page), then build the executors (components).
