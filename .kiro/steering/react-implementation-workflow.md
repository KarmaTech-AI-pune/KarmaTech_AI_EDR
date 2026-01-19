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
2. **Routing Configuration** → Define routes before creating pages
3. **Page Component Creation** → Create page containers that orchestrate
4. **Component Breakdown** → Build small, reusable UI components
5. **Component Integration** → Assemble components inside pages
6. **Props & Data Flow** → Pass data from parent (page) to children (components)
7. **Iterative Enhancement** → Add validation, loading states, error handling

**Key Rule:** For any implementation requiring a page:
- ✅ Create the route FIRST
- ✅ Create the page component SECOND (which calls child components)
- ✅ Create child components LAST (called by the page)

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

### Step 5: Configure Routing

**Add route configuration BEFORE creating page component.**

#### Required Actions:
1. Open routing configuration file
2. Add new route entry
3. Import page component (will be created next)
4. Configure route parameters if needed

#### Example:
```typescript
// routes/index.tsx or App.tsx
import { Routes, Route } from 'react-router-dom';
import UserProfile from '../pages/UserProfile';

<Routes>
  <Route path="/" element={<Layout />}>
    {/* Existing routes */}
    
    {/* New route */}
    <Route path="/users/:userId" element={<UserProfile />} />
  </Route>
</Routes>
```

#### Route Configuration Checklist:
- [ ] Route path defined
- [ ] Route parameters identified
- [ ] Page component imported
- [ ] Protected route wrapper added (if needed)
- [ ] Parent layout specified

---

### Step 6: Create Page Component

**Create the page component as a container that orchestrates everything.**

#### Required Actions:
1. Create page file in `pages/` folder
2. Import required hooks and services
3. Fetch data and manage state
4. Define layout structure
5. Prepare props for child components
6. Handle loading and error states

#### Example:
```typescript
// pages/UserProfile.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { useUserProfile } from '../hooks/useUserProfile';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import ProfileSettings from '../components/profile/ProfileSettings';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, isLoading, error } = useUserProfile(userId!);
  
  if (isLoading) return <LoadingSpinner loading={true} />;
  
  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }
  
  if (!user) return null;
  
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

### Step 7: Create Child Components

**Create small, reusable components AFTER page structure is defined.**

#### Required Actions:
1. Create component files in `components/[feature]/` folder
2. Define prop interfaces
3. Implement UI logic
4. Keep components focused and single-purpose
5. Make components reusable

#### Example:
```typescript
// components/profile/ProfileHeader.tsx
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

#### Component Creation Order:
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

---

### Step 8: Integrate Components into Page

**Assemble child components inside the page component.**

#### Required Actions:
1. Import all child components
2. Pass required props from page state
3. Handle component interactions
4. Manage data flow (parent → child)
5. Coordinate component communication

#### Example:
```typescript
// pages/UserProfile.tsx (integration)
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
        {/* Components integrated with proper props */}
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
- [ ] Data flow established
- [ ] Component communication handled

---

### Step 9: Add Validation & Error Handling

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

### Step 10: Create Tests

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
- [ ] **Step 5:** Route configured
- [ ] **Step 6:** Page component created
- [ ] **Step 7:** Child components created
- [ ] **Step 8:** Components integrated into page
- [ ] **Step 9:** Validation & error handling added
- [ ] **Step 10:** Tests written

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
4. Routes
5. Pages
6. Components
7. Integration
8. Enhancement
9. Testing

**Key Benefits:**
- ✅ Clear architecture from the start
- ✅ Proper data flow (parent → child)
- ✅ Reusable components
- ✅ Maintainable codebase
- ✅ Easier testing
- ✅ Better collaboration

**Remember:** Pages orchestrate, components execute. Start with the orchestrator (page), then build the executors (components).
