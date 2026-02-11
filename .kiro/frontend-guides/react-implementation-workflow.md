---
inclusion: manual
keywords: react, frontend, component, ui, page, routing, typescript, material-ui, mui
---

# React Implementation Workflow - Top-Down Approach

## 🚨 ACTIVATION TRIGGER

**CRITICAL RULE:** This workflow and all related frontend steering files are **INACTIVE BY DEFAULT**.

**Activation Phrase:** "Use Frontend Steering Files in the Implementation"

**When user says this phrase:**
1. ✅ Read this file (`react-implementation-workflow.md`) completely
2. ✅ Analyze the user's requirement
3. ✅ Determine which specialized guides are needed based on requirement
4. ✅ Read only the relevant specialized guides (not all)
5. ✅ Generate design and tasks following the workflow

**Until activation phrase is used:**
- ❌ Do NOT apply this workflow
- ❌ Do NOT read other frontend steering files
- ❌ Do NOT enforce frontend implementation rules
- ❌ Work flexibly based on user's direct instructions

---

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
7. **Implement Page Structure** → Set up page with data fetching (NO components yet)
8. **Implement ALL Components** → Build all components bottom-up (smallest to largest)
9. **Integrate Components into Page** → Add components to page one by one
10. **Validation & Error Handling** → Add validation, loading states, error handling
11. **Testing** → Write comprehensive tests

**Key Rule:** For any implementation requiring a page:
- ✅ Create skeleton pages and components FIRST (basic structure)
- ✅ Configure routes SECOND (using the skeleton pages)
- ✅ Implement page structure THIRD (data fetching, state management, NO components)
- ✅ Implement ALL components FOURTH (bottom-up: smallest to largest)
- ✅ Integrate components into page LAST (one by one)

**🚨 CRITICAL:** Build components from smallest to largest (bottom-up), THEN integrate into page (top-down).

This ensures proper component hierarchy and prevents dependency issues.

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

## 📚 Related Guides

For detailed information on specific topics, refer to these specialized guides:
- **Component Reusability & Data Flow:** `.kiro/steering/REACT_COMPONENT_REUSABILITY_GUIDE.md`
- **State Management & API Integration:** `.kiro/steering/react-state-api-integration.md`
- **Routing & Navigation:** `.kiro/steering/react-routing-navigation.md`
- **Forms & Validation:** `.kiro/steering/react-forms-validation.md`
- **Material-UI Styling:** `.kiro/steering/material-ui-styling-guide.md`
- **Visual Workflow Flowchart:** `.kiro/steering/REACT_WORKFLOW_VISUAL_GUIDE.md`
- **Component Best Practices:** `.kiro/steering/react-component-patterns.md`

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

### Step 7: Implement Page Component Structure

**Set up the page component skeleton with data fetching and state management, but WITHOUT calling child components yet.**

#### Required Actions:
1. Add route parameter extraction
2. Import and use hooks/services
3. Implement data fetching and state management
4. Add loading and error handling
5. **Decide on data flow pattern** (prop drilling vs Context API)
6. Create page structure with placeholders for components (don't call them yet)
7. Replace TODO comments related to data fetching only

**🚨 CRITICAL:** At this step, focus ONLY on:
- ✅ Route parameters
- ✅ Data fetching
- ✅ State management
- ✅ Loading/error states
- ❌ DO NOT call child components yet (they're not implemented)

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

**📚 For detailed data flow patterns and Context API implementation:**
- See `.kiro/steering/REACT_COMPONENT_REUSABILITY_GUIDE.md` - Complete data flow guide with examples
- See `.kiro/steering/react-state-api-integration.md` - Context API implementation patterns

#### Example:
```typescript
// pages/UserProfile.tsx (STEP 7: PAGE STRUCTURE ONLY)
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { useUserProfile } from '../hooks/useUserProfile';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserProfile: React.FC = () => {
  // ✅ Extract route parameters
  const { userId } = useParams<{ userId: string }>();
  
  // ✅ Fetch data using custom hook
  const { user, isLoading, error } = useUserProfile(userId!);
  
  // ✅ Local state for interactions
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ Event handlers
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = async (updatedUser: Partial<User>) => {
    await userService.updateUser(userId!, updatedUser);
    setIsEditing(false);
  };
  
  // ✅ Handle loading state
  if (isLoading) return <LoadingSpinner loading={true} />;
  
  // ✅ Handle error state
  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  
  // ✅ Handle no data
  if (!user) return null;
  
  // ✅ Page structure with placeholders
  // ❌ DO NOT call components yet - they're not implemented!
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* TODO: Add ProfileHeader component after Step 8 */}
        {/* TODO: Add ProfileDetails component after Step 8 */}
        {/* TODO: Add ProfileSettings component after Step 8 */}
        <Typography variant="h4">User Profile: {user.name}</Typography>
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

**📚 For complete Context API patterns and advanced examples:**
- See `.kiro/steering/react-state-api-integration.md` - Full Context implementation guide
- See `.kiro/steering/REACT_COMPONENT_REUSABILITY_GUIDE.md` - Context vs Props decision guide

#### Page Component Responsibilities (Step 7):
- ✅ Route parameter extraction
- ✅ Data fetching via hooks/services
- ✅ State management
- ✅ Loading/error handling
- ✅ Event handler definitions
- ✅ Page structure/layout
- ❌ DO NOT call child components yet (Step 8 first)

#### Page Component Should NOT (at Step 7):
- ❌ Call child components (they're not implemented yet)
- ❌ Contain detailed UI elements (that's for components)
- ❌ Have complex styling (keep it simple)
- ❌ Implement business logic directly (use services/hooks)

---

### Step 8: Implement ALL Child Components (Bottom-Up)

**Implement full functionality for ALL child components BEFORE integrating them into the page.**

**🚨 CRITICAL RULE:** Complete ALL component implementations (including nested component hierarchies) BEFORE moving to Step 9.

#### Component Implementation Order (Bottom-Up):
1. **Smallest/Leaf components first** (components with no child components)
2. **Parent components second** (components that use the leaf components)
3. **Top-level feature components last** (components called directly by page)

#### Example Component Hierarchy:
```
Page (UserProfile)
├── ProfileHeader (top-level)
│   ├── Avatar (leaf)
│   └── EditButton (leaf)
├── ProfileDetails (top-level)
│   ├── InfoSection (parent)
│   │   ├── InfoRow (leaf)
│   │   └── InfoRow (leaf)
│   └── ContactSection (parent)
│       ├── InfoRow (leaf)
│       └── InfoRow (leaf)
└── ProfileSettings (top-level)
    └── SettingsForm (leaf)

Implementation Order:
1. InfoRow (leaf - used by InfoSection and ContactSection)
2. Avatar, EditButton (leaf - used by ProfileHeader)
3. SettingsForm (leaf - used by ProfileSettings)
4. InfoSection, ContactSection (parent - use InfoRow)
5. ProfileHeader (top-level - uses Avatar, EditButton)
6. ProfileDetails (top-level - uses InfoSection, ContactSection)
7. ProfileSettings (top-level - uses SettingsForm)
```

#### Required Actions:
1. **Identify component hierarchy** - Map out which components use which
2. **Start with leaf components** - Implement components with no dependencies first
3. **Move up the hierarchy** - Implement parent components that use leaf components
4. **Complete all components** - Finish ALL implementations before Step 9
5. **Ensure reusability** - Make components generic and prop-driven
6. **Use appropriate data access** - Props for simple data, Context for complex/deep trees
7. **Keep components focused** - Single responsibility principle

#### 🎯 Component Reusability Guidelines:

**Make components reusable by:**
- ✅ Accepting data via props (not hardcoding)
- ✅ Using generic prop names (e.g., `data` instead of `userData`)
- ✅ Avoiding page-specific logic
- ✅ Keeping components small and focused
- ✅ Using composition over inheritance
- ✅ Exporting components for use in other pages

**📚 For detailed reusability patterns, levels, and comprehensive examples:**
- See `.kiro/steering/REACT_COMPONENT_REUSABILITY_GUIDE.md` - Complete reusability guide

**Quick Example: Reusable Component**
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

**📚 For more reusability examples and anti-patterns:**
- See `.kiro/steering/REACT_COMPONENT_REUSABILITY_GUIDE.md` - Levels of reusability, composition patterns

#### Example Implementation (Bottom-Up):

**Step 8.1: Implement Leaf Components First**
```typescript
// components/common/InfoRow.tsx (LEAF COMPONENT - No dependencies)
import React from 'react';
import { Box, Typography } from '@mui/material';

interface InfoRowProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      {icon}
      <Typography variant="body2" color="text.secondary">{label}:</Typography>
      <Typography variant="body1" fontWeight="medium">{value}</Typography>
    </Box>
  );
};

export default InfoRow;
```

**Step 8.2: Implement Parent Components (Use Leaf Components)**
```typescript
// components/profile/InfoSection.tsx (PARENT - Uses InfoRow)
import React from 'react';
import { Box, Typography } from '@mui/material';
import { User } from '../../types/user';
import InfoRow from '../common/InfoRow';
import { Email, Phone, LocationOn } from '@mui/icons-material';

interface InfoSectionProps {
  user: User;
}

const InfoSection: React.FC<InfoSectionProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
      <InfoRow label="Email" value={user.email} icon={<Email />} />
      <InfoRow label="Phone" value={user.phone} icon={<Phone />} />
      <InfoRow label="Location" value={user.location} icon={<LocationOn />} />
    </Box>
  );
};

export default InfoSection;
```

**Step 8.3: Implement Top-Level Components (Use Parent Components)**
```typescript
// components/profile/ProfileDetails.tsx (TOP-LEVEL - Uses InfoSection, ContactSection)
import React from 'react';
import { Box, Card, CardContent } from '@mui/material';
import { User } from '../../types/user';
import InfoSection from './InfoSection';
import ContactSection from './ContactSection';

interface ProfileDetailsProps {
  user: User;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <InfoSection user={user} />
          <ContactSection user={user} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileDetails;
```

**Step 8.4: Complete ALL Other Top-Level Components**
```typescript
// components/profile/ProfileHeader.tsx (TOP-LEVEL - Complete implementation)
import React from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { User } from '../../types/user';

interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
}

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

**✅ After Step 8:** ALL components are fully implemented and tested individually. Ready for integration in Step 9.

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

#### Component Best Practices (Step 8):
- ✅ Single responsibility
- ✅ Prop-driven (receive data from parent)
- ✅ Reusable across pages
- ✅ Minimal state (prefer props)
- ✅ Clear prop interfaces
- ✅ Proper TypeScript types
- ✅ **Implement bottom-up** (smallest to largest)
- ✅ **Complete ALL components before Step 9**
- ✅ **Choose appropriate data flow pattern** (props vs context)
- ✅ **Design for reusability** (generic, composable)
- ✅ **NEVER write redundant code** (DRY principle - Don't Repeat Yourself)

**🚨 STOP RULE:** Do NOT proceed to Step 9 until ALL components (including nested hierarchies) are fully implemented and tested individually.

---

### Step 9: Integrate Components into Page (One by One)

**Now that ALL components are implemented, integrate them into the page component ONE BY ONE.**

**🚨 CRITICAL:** This step happens AFTER Step 8 is complete. All components must exist and be fully functional before integration.

#### Required Actions:
1. **Import components** - Add imports for all implemented components
2. **Replace placeholders** - Remove TODO comments from Step 7
3. **Add components one by one** - Start with first component, test, then add next
4. **Pass props correctly** - Ensure data flows from page state to components
5. **Wire up event handlers** - Connect component callbacks to page handlers
6. **Establish data flow** - Verify parent → child data flow works correctly
7. **Test integration** - Verify each component works in the page context

#### Integration Order:
1. Add first top-level component (e.g., ProfileHeader)
2. Test that it renders and works correctly
3. Add second top-level component (e.g., ProfileDetails)
4. Test that it renders and works correctly
5. Add remaining components one by one
6. Test complete page integration

#### Example:
```typescript
// pages/UserProfile.tsx (STEP 9: FULL INTEGRATION)
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { useUserProfile } from '../hooks/useUserProfile';
import LoadingSpinner from '../components/common/LoadingSpinner';
// ✅ Import all implemented components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import ProfileSettings from '../components/profile/ProfileSettings';

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
  
  if (isLoading) return <LoadingSpinner loading={true} />;
  
  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  
  if (!user) return null;
  
  // ✅ All components integrated with proper props and handlers
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ✅ Component 1: Integrated with props and handlers */}
        <ProfileHeader 
          user={user} 
          onEdit={handleEdit} 
        />
        
        {/* ✅ Component 2: Integrated with props and handlers */}
        <ProfileDetails 
          user={user} 
          isEditing={isEditing}
          onSave={handleSave}
        />
        
        {/* ✅ Component 3: Integrated with props and handlers */}
        <ProfileSettings 
          userId={user.id}
          onUpdate={() => {/* refresh data */}}
        />
      </Box>
    </Container>
  );
};

export default UserProfile;
```

---

## 📋 Component Reusability & Data Flow Patterns

**📚 IMPORTANT:** For comprehensive guides on these topics, see:
- `.kiro/steering/REACT_COMPONENT_REUSABILITY_GUIDE.md` - Complete reusability and data flow guide
- `.kiro/steering/react-state-api-integration.md` - Context API and state management patterns

### Quick Reference: Component Reusability

**Design components to be generic:**
- ✅ Accept data via props (not internal fetching)
- ✅ Use generic prop names (`data`, `items`, `value`)
- ✅ Keep components small and focused
- ✅ Extract common patterns into shared components

### Quick Reference: Data Flow Patterns

**Use Props (Prop Drilling) when:**
- Component tree is 1-3 levels deep
- Data is simple (primitives, single objects)
- Components are tightly related

**Use Context API when:**
- Component tree is 4+ levels deep
- Data is complex (multiple related objects)
- Data is shared across many unrelated components

**For detailed examples, decision matrices, and implementation patterns, see the guides above.**

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
- [ ] All placeholders replaced
- [ ] Props passed correctly from page state
- [ ] Event handlers connected
- [ ] Data flow established (parent → child)
- [ ] Each component tested in page context
- [ ] No prop drilling issues (or Context used appropriately)
- [ ] Page renders correctly with all components

**Why Integration Happens Last:**
- ✅ All components are complete and tested
- ✅ No dependency issues
- ✅ Clear what props each component needs
- ✅ Easy to debug (components work individually)
- ✅ Can integrate one at a time safely

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

**The Golden Rule:** Build components bottom-up (smallest to largest), then integrate top-down (into page).

**Implementation Order:**
1. Folders & Structure
2. Types & Interfaces
3. Services & Hooks
4. Skeleton Pages & Components
5. Routes (using skeletons)
6. Implement Page Structure (data fetching only, NO components)
7. Implement ALL Components (bottom-up: leaf → parent → top-level)
8. Integrate Components into Page (one by one)
9. Validation & Enhancement
10. Testing

**Key Benefits:**
- ✅ Clear architecture from the start
- ✅ Components built independently (easier to test)
- ✅ No dependency issues (smallest components first)
- ✅ Proper component hierarchy (bottom-up)
- ✅ Safe integration (components already work)
- ✅ Reusable components
- ✅ Maintainable codebase
- ✅ Better collaboration

**Remember:** Build the pieces first (components), then assemble them (page integration). Never start with the whole and try to break it down.

---

## 📚 Related Documentation

### Detailed Guides (Deep Dives)
- **`.kiro/steering/REACT_COMPONENT_REUSABILITY_GUIDE.md`** - Complete guide on component reusability, data flow patterns (props vs Context), decision matrices, and comprehensive examples
- **`.kiro/steering/react-state-api-integration.md`** - State management, API integration, Context API patterns, custom hooks, and data fetching
- **`.kiro/steering/react-routing-navigation.md`** - React Router patterns, navigation hooks, protected routes, and URL state management
- **`.kiro/steering/react-forms-validation.md`** - Form handling with React Hook Form, Zod validation, Material-UI integration
- **`.kiro/steering/material-ui-styling-guide.md`** - Material-UI theming, sx prop patterns, responsive design, and styling best practices
- **`.kiro/steering/react-component-patterns.md`** - Component architecture patterns, TypeScript interfaces, and best practices

### Quick References
- **`.kiro/steering/REACT_WORKFLOW_VISUAL_GUIDE.md`** - Visual flowchart of the 11-step workflow with diagrams and comparisons
- **`.kiro/steering/DEVELOPER_WORKFLOW_GUIDE.md`** - Decision tree for choosing which workflow to follow (backend, frontend, full-stack)
- **`.kiro/steering/REACT_WORKFLOW_CHANGELOG.md`** - Complete history of workflow updates and improvements

### Enforcement & Standards
- **`.kiro/steering/workflow-enforcement-rules.md`** - AI-DLC enforcement rules, quality gates, and mandatory process steps

---

**Last Updated:** January 21, 2025  
**Version:** 2.0 (Consolidated with cross-references)
