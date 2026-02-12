---
inclusion: manual
keywords: react, frontend, component, ui, page, routing, workflow, visual
---

# React Implementation Workflow - Visual Guide

**Last Updated:** January 21, 2025

**📚 Part of the React Implementation Workflow:**
- **Main Workflow:** `.kiro/steering/react-implementation-workflow.md` - Complete 11-step implementation guide
- **This Guide:** Visual flowchart and skeleton-first approach explanation
- **Reusability Guide:** `.kiro/steering/REACT_COMPONENT_REUSABILITY_GUIDE.md` - Component patterns and data flow

---

## 🎯 The Correct Top-Down Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: CREATE FOLDER STRUCTURE                            │
│  ✅ Create all folders and files first                      │
│                                                              │
│  frontend/src/                                              │
│  ├── types/[feature].ts                                     │
│  ├── services/[feature]Service.ts                           │
│  ├── hooks/use[Feature].ts                                  │
│  ├── pages/[Feature].tsx                                    │
│  └── components/[feature]/                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: DEFINE TYPESCRIPT TYPES                            │
│  ✅ Create interfaces BEFORE components                     │
│                                                              │
│  export interface User { ... }                              │
│  export interface UserProfileProps { ... }                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: CREATE API SERVICE LAYER                           │
│  ✅ Implement services BEFORE components                    │
│                                                              │
│  export const userService = {                               │
│    getUserById: async (id) => { ... }                       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: CREATE CUSTOM HOOKS (if needed)                    │
│  ✅ Data-fetching logic BEFORE pages                        │
│                                                              │
│  export const useUserProfile = (userId) => {                │
│    // Fetch data, handle loading/errors                     │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: CREATE SKELETON PAGES & COMPONENTS                 │
│  ✅ Basic structure with placeholders                       │
│                                                              │
│  const UserProfile = () => {                                │
│    // TODO: Add route params                                │
│    // TODO: Add data fetching                               │
│    return <Container>Skeleton</Container>                   │
│  }                                                           │
│                                                              │
│  const ProfileHeader = ({ user }) => {                      │
│    // TODO: Implement full UI                               │
│    return <Box>Skeleton</Box>                               │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: CONFIGURE ROUTING                                  │
│  ✅ Add routes using skeleton pages (NO IMPORT ERRORS!)     │
│                                                              │
│  import UserProfile from '../pages/UserProfile'             │
│  // ✅ Component already exists!                            │
│                                                              │
│  <Route path="/users/:id" element={<UserProfile />} />     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: IMPLEMENT PAGE STRUCTURE                           │
│  ✅ Set up page with data fetching (NO components yet)      │
│                                                              │
│  const UserProfile = () => {                                │
│    const { userId } = useParams()                           │
│    const { user, isLoading } = useUserProfile(userId)       │
│                                                              │
│    if (isLoading) return <LoadingSpinner />                 │
│                                                              │
│    return (                                                  │
│      <Container>                                            │
│        {/* TODO: Add ProfileHeader after Step 8 */}         │
│        {/* TODO: Add ProfileDetails after Step 8 */}        │
│      </Container>                                           │
│    )                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: IMPLEMENT ALL COMPONENTS (BOTTOM-UP)               │
│  ✅ Build all components from smallest to largest           │
│                                                              │
│  1. Leaf components first (InfoRow, Avatar, Button)         │
│  2. Parent components next (InfoSection, ContactSection)    │
│  3. Top-level components last (ProfileHeader, ProfileDetails)│
│                                                              │
│  const ProfileHeader = ({ user, onEdit }) => {              │
│    return (                                                  │
│      <Box sx={{ display: 'flex', gap: 3 }}>                │
│        <Avatar src={user.avatar} />                         │
│        <Typography>{user.name}</Typography>                 │
│        <Button onClick={onEdit}>Edit</Button>               │
│      </Box>                                                  │
│    )                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: INTEGRATE COMPONENTS INTO PAGE (ONE BY ONE)        │
│  ✅ Add components to page after all are implemented        │
│                                                              │
│  const UserProfile = () => {                                │
│    const { userId } = useParams()                           │
│    const { user, isLoading } = useUserProfile(userId)       │
│                                                              │
│    if (isLoading) return <LoadingSpinner />                 │
│                                                              │
│    return (                                                  │
│      <Container>                                            │
│        <ProfileHeader user={user} onEdit={handleEdit} />   │
│        <ProfileDetails user={user} />                       │
│      </Container>                                           │
│    )                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 10: VALIDATION & ERROR HANDLING                       │
│  ✅ Add form validation, error boundaries, user feedback    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 11: CREATE TESTS                                      │
│  ✅ Write tests for pages and components                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Principle: Skeleton-First Approach

### ❌ OLD WAY (Routes First - WRONG):

```
1. Create folders
2. Define types
3. Create services
4. Create hooks
5. Configure routes ← ❌ Import error! Page doesn't exist yet
6. Create page      ← Created AFTER route
7. Create components
```

**Problem:** Routes try to import pages that don't exist yet!

### ✅ NEW WAY (Skeleton First - CORRECT):

```
1. Create folders
2. Define types
3. Create services
4. Create hooks
5. Create SKELETON pages & components ← ✅ Basic structure exists
6. Configure routes                   ← ✅ Can import skeleton (no errors!)
7. Implement page STRUCTURE           ← ✅ Data fetching only, NO components
8. Implement ALL components           ← ✅ Bottom-up: smallest to largest
9. Integrate components into page     ← ✅ Add components one by one
```

**Solution:** Skeleton pages exist BEFORE routes are configured!

## 📊 Side-by-Side Comparison

| Step | OLD (Wrong) | NEW (Correct) |
|------|-------------|---------------|
| 1 | Folders | Folders |
| 2 | Types | Types |
| 3 | Services | Services |
| 4 | Hooks | Hooks |
| 5 | **Routes** ❌ | **Skeletons** ✅ |
| 6 | **Pages** | **Routes** ✅ |
| 7 | **Page Structure** | **Implement Pages** |
| 8 | **Components** | **Implement Components** |
| 9 | **Integration** | **Integration** |
| 10 | **Validation** | **Validation** |
| 11 | - | **Tests** |

## 🎯 What is a "Skeleton"?

A skeleton is a **minimal component structure** with:
- ✅ Basic imports
- ✅ Component definition
- ✅ Prop interfaces
- ✅ Basic JSX structure
- ✅ TODO comments for implementation

### Example Skeleton Page:

```typescript
// pages/UserProfile.tsx (SKELETON)
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const UserProfile: React.FC = () => {
  // TODO: Add useParams to extract userId
  // TODO: Add useUserProfile hook for data fetching
  // TODO: Add loading and error handling
  
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

### Example Skeleton Component:

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
  // TODO: Add avatar display
  // TODO: Add user name and email
  // TODO: Add edit button
  
  return (
    <Box>
      <Typography>Profile Header (Skeleton)</Typography>
      {/* TODO: Implement full UI */}
    </Box>
  );
};

export default ProfileHeader;
```

## 💡 Benefits of Skeleton-First Approach

### 1. No Import Errors
```typescript
// routes/index.tsx
import UserProfile from '../pages/UserProfile'; // ✅ Already exists!
<Route path="/users/:id" element={<UserProfile />} />
```

### 2. Clear Structure
```typescript
// You can see exactly what needs to be built:
// TODO: Add useParams to extract userId
// TODO: Add useUserProfile hook for data fetching
// TODO: Add loading and error handling
```

### 3. Parallel Development
```
Developer 1: Implements page logic (Step 7)
Developer 2: Implements component logic (Step 8)
Both can work simultaneously!
```

### 4. Easy Progress Tracking
```
✅ Skeleton created
⏳ Implementation in progress (replacing TODOs)
✅ Implementation complete
```

## 🚀 Quick Reference

### When creating a new page feature:

```
1. Create folders ✅
2. Define types ✅
3. Create services ✅
4. Create hooks ✅
5. Create SKELETON page + components ✅
6. Configure routes (using skeleton) ✅
7. Implement page STRUCTURE (data only, NO components) ✅
8. Implement ALL components (bottom-up: smallest to largest) ✅
9. Integrate components into page (one by one) ✅
10. Add validation ✅
11. Write tests ✅
```

### Remember:
- 🎯 **Skeleton BEFORE routes**
- 🎯 **Routes use skeletons (no errors)**
- 🎯 **Page structure BEFORE components**
- 🎯 **ALL components BEFORE integration**
- 🎯 **Build bottom-up, integrate top-down**

---

**This is the correct React implementation workflow!** 🎉
