# React Component Reusability & Data Flow Guide

**Last Updated:** January 21, 2025  
**Purpose:** Guidelines for creating reusable components and choosing the right data flow pattern

**📚 Part of the React Implementation Workflow:**
- **Main Workflow:** `.kiro/steering/react-implementation-workflow.md` - 11-step implementation process
- **Visual Guide:** `.kiro/steering/REACT_WORKFLOW_VISUAL_GUIDE.md` - Flowcharts and diagrams
- **This Guide:** Detailed reusability patterns and data flow decisions

---

## 🎯 Component Reusability Principles

### 1. Design for Reusability from the Start

**Key Questions to Ask:**
- Can this component be used in other pages?
- Is the component tightly coupled to specific data?
- Can I make the props more generic?
- Is the component doing too much?

### 2. The Reusability Spectrum

```
┌─────────────────────────────────────────────────────────────┐
│  HIGHLY SPECIFIC                    HIGHLY REUSABLE         │
│  (Page-specific)                    (Generic)               │
│                                                              │
│  UserProfileCard ──────────────────> DataCard               │
│  ProjectBudgetChart ───────────────> Chart                  │
│  TeamMemberList ───────────────────> List                   │
│                                                              │
│  ❌ Hard to reuse                   ✅ Easy to reuse        │
└─────────────────────────────────────────────────────────────┘
```

### 3. Levels of Reusability

#### Level 1: Page-Specific Components (Low Reusability)
```typescript
// ❌ Only works for UserProfile page
const UserProfileHeader: React.FC = () => {
  const { user } = useUserProfile(); // Fetches data internally
  
  return (
    <Box>
      <Avatar src={user.avatar} />
      <Typography>{user.name}</Typography>
      <Typography>{user.email}</Typography>
    </Box>
  );
};
```

#### Level 2: Feature-Specific Components (Medium Reusability)
```typescript
// ✅ Works for any user, but still user-specific
interface UserHeaderProps {
  user: User;
  onEdit?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, onEdit }) => {
  return (
    <Box>
      <Avatar src={user.avatar} />
      <Typography>{user.name}</Typography>
      <Typography>{user.email}</Typography>
      {onEdit && <Button onClick={onEdit}>Edit</Button>}
    </Box>
  );
};
```

#### Level 3: Generic Components (High Reusability)
```typescript
// ✅ Works for any entity (user, project, team, etc.)
interface EntityHeaderProps {
  avatar?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const EntityHeader: React.FC<EntityHeaderProps> = ({ 
  avatar, 
  title, 
  subtitle, 
  actions 
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {avatar && <Avatar src={avatar} />}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5">{title}</Typography>
        {subtitle && <Typography variant="body2">{subtitle}</Typography>}
      </Box>
      {actions}
    </Box>
  );
};

// Can be used for users, projects, teams, etc.
<EntityHeader 
  avatar={user.avatar} 
  title={user.name} 
  subtitle={user.email}
  actions={<Button>Edit</Button>}
/>

<EntityHeader 
  title={project.name} 
  subtitle={`Budget: $${project.budget}`}
  actions={<Button>View Details</Button>}
/>
```

---

## 🔄 Data Flow Patterns

### Pattern 1: Prop Drilling (Simple & Direct)

**When to Use:**
- ✅ Component tree is 1-3 levels deep
- ✅ Data is simple (primitives, single objects)
- ✅ Components are tightly related (parent-child)
- ✅ Performance is critical (no context overhead)

**Example:**
```typescript
// Page (Level 0)
const UserProfile: React.FC = () => {
  const { user, isLoading } = useUserProfile();
  
  if (isLoading) return <LoadingSpinner loading={true} />;
  
  return (
    <Container>
      {/* Level 1: Direct props */}
      <ProfileHeader user={user} onEdit={handleEdit} />
      <ProfileDetails user={user} />
      <ProfileSettings user={user} onSave={handleSave} />
    </Container>
  );
};

// Component (Level 1)
const ProfileDetails: React.FC<{ user: User }> = ({ user }) => (
  <Box>
    {/* Level 2: Props passed down */}
    <InfoSection user={user} />
    <ContactSection user={user} />
  </Box>
);

// Component (Level 2)
const InfoSection: React.FC<{ user: User }> = ({ user }) => (
  <Box>
    <Typography>{user.name}</Typography>
    <Typography>{user.email}</Typography>
  </Box>
);
```

**Pros:**
- ✅ Simple and explicit
- ✅ Easy to trace data flow
- ✅ Better performance (no context)
- ✅ Easier to test (just pass props)

**Cons:**
- ❌ Becomes verbose with deep trees
- ❌ Intermediate components must pass props they don't use
- ❌ Refactoring is harder (change all levels)

---

### Pattern 2: Context API (Complex & Shared)

**When to Use:**
- ✅ Component tree is 4+ levels deep
- ✅ Data is complex (multiple related objects)
- ✅ Data is shared across many unrelated components
- ✅ Avoiding "prop drilling hell"
- ✅ Global state (theme, auth, settings)

**Example:**
```typescript
// 1. Define Context Type
interface ProjectContextType {
  project: Project;
  budget: Budget;
  team: TeamMember[];
  permissions: Permissions;
  updateProject: (data: Partial<Project>) => Promise<void>;
  refreshData: () => Promise<void>;
}

// 2. Create Context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 3. Create Custom Hook
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};

// 4. Create Provider Component (Optional but Recommended)
export const ProjectProvider: React.FC<{ 
  projectId: string; 
  children: React.ReactNode 
}> = ({ projectId, children }) => {
  const { project, budget, team, permissions, isLoading } = useProject(projectId);
  
  const updateProject = async (data: Partial<Project>) => {
    await projectService.update(projectId, data);
    await refreshData();
  };
  
  const refreshData = async () => {
    // Refresh logic
  };
  
  if (isLoading) return <LoadingSpinner loading={true} />;
  
  const value = {
    project,
    budget,
    team,
    permissions,
    updateProject,
    refreshData
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// 5. Use Provider at Page Level
const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  
  return (
    <ProjectProvider projectId={projectId!}>
      <Container>
        <ProjectHeader />           {/* Level 1 */}
        <ProjectTabs>              {/* Level 2 */}
          <ProjectOverview />      {/* Level 3 */}
          <ProjectBudget />        {/* Level 3 */}
          <ProjectTeam />          {/* Level 3 */}
        </ProjectTabs>
      </Container>
    </ProjectProvider>
  );
};

// 6. Consume Context in Any Component (No Props Needed!)
const ProjectBudgetChart: React.FC = () => {
  const { budget, permissions } = useProjectContext();
  
  if (!permissions.canViewBudget) {
    return <Typography>No permission to view budget</Typography>;
  }
  
  return (
    <Box>
      <Typography variant="h6">Budget: ${budget.total}</Typography>
      <Chart data={budget.breakdown} />
    </Box>
  );
};

// Another component at different level
const ProjectTeamList: React.FC = () => {
  const { team, permissions } = useProjectContext();
  
  if (!permissions.canViewTeam) return null;
  
  return (
    <List>
      {team.map(member => (
        <ListItem key={member.id}>
          <ListItemText primary={member.name} secondary={member.role} />
        </ListItem>
      ))}
    </List>
  );
};
```

**Pros:**
- ✅ No prop drilling through intermediate components
- ✅ Easy to add new consumers
- ✅ Centralized data management
- ✅ Clean component interfaces

**Cons:**
- ❌ Harder to trace data flow
- ❌ Can cause unnecessary re-renders (if not optimized)
- ❌ More complex to test (need to mock context)
- ❌ Can be overused (not everything needs context)

---

### Pattern 3: Hybrid Approach (Best of Both Worlds)

**Combine props and context based on needs:**

```typescript
const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <ProjectProvider projectId={projectId!}>
      <Container>
        {/* Props for component-specific data */}
        <ProjectHeader 
          activeTab={activeTab}              {/* Prop: UI state */}
          onTabChange={setActiveTab}         {/* Prop: callback */}
        />
        
        {/* Context for shared data (used internally) */}
        <ProjectTabs activeTab={activeTab}>
          <ProjectOverview />                {/* Uses context */}
          <ProjectBudget />                  {/* Uses context */}
          <ProjectTeam />                    {/* Uses context */}
        </ProjectTabs>
      </Container>
    </ProjectProvider>
  );
};

// Component uses both props and context
const ProjectHeader: React.FC<{ 
  activeTab: number; 
  onTabChange: (tab: number) => void 
}> = ({ activeTab, onTabChange }) => {
  const { project, permissions } = useProjectContext(); // Context for shared data
  
  return (
    <Box>
      <Typography variant="h4">{project.name}</Typography>
      <Tabs value={activeTab} onChange={(_, tab) => onTabChange(tab)}>
        <Tab label="Overview" />
        {permissions.canViewBudget && <Tab label="Budget" />}
        {permissions.canViewTeam && <Tab label="Team" />}
      </Tabs>
    </Box>
  );
};
```

---

## 📊 Decision Matrix

### When to Use Props vs Context

| Criteria | Use Props | Use Context |
|----------|-----------|-------------|
| **Tree Depth** | 1-3 levels | 4+ levels |
| **Data Complexity** | Simple (1-2 objects) | Complex (3+ objects) |
| **Number of Consumers** | 1-3 components | 4+ components |
| **Data Relationship** | Parent-child | Unrelated components |
| **Update Frequency** | Frequent | Infrequent |
| **Performance Priority** | High | Medium |
| **Testability Priority** | High | Medium |
| **Example Use Cases** | Form data, UI state | Auth, theme, global settings |

### Visual Decision Tree

```
Is the data needed by multiple unrelated components?
├─ YES → Use Context API
└─ NO → Is the component tree deep (4+ levels)?
    ├─ YES → Use Context API
    └─ NO → Is the data complex (3+ objects)?
        ├─ YES → Consider Context API
        └─ NO → Use Props (Prop Drilling)
```

---

## 🎯 Real-World Examples

### Example 1: User Profile (Props - Simple)

```typescript
// ✅ Props: Shallow tree, simple data
const UserProfile: React.FC = () => {
  const { user } = useUserProfile();
  
  return (
    <Container>
      <ProfileHeader user={user} />        {/* 1 level */}
      <ProfileDetails user={user} />       {/* 1 level */}
      <ProfileSettings user={user} />      {/* 1 level */}
    </Container>
  );
};
```

### Example 2: Project Dashboard (Context - Complex)

```typescript
// ✅ Context: Deep tree, complex data, many consumers
const ProjectDashboard: React.FC = () => {
  return (
    <ProjectProvider projectId={projectId}>
      <Container>
        <ProjectHeader />                  {/* Level 1 */}
        <ProjectTabs>                      {/* Level 2 */}
          <ProjectOverview>                {/* Level 3 */}
            <ProjectMetrics>               {/* Level 4 */}
              <BudgetChart />              {/* Level 5 - uses context */}
              <TimelineChart />            {/* Level 5 - uses context */}
              <TeamChart />                {/* Level 5 - uses context */}
            </ProjectMetrics>
          </ProjectOverview>
        </ProjectTabs>
      </Container>
    </ProjectProvider>
  );
};
```

### Example 3: Form with Validation (Props - Controlled)

```typescript
// ✅ Props: Form state should be explicit
const UserEditForm: React.FC = () => {
  const { control, handleSubmit } = useForm<User>();
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Props make data flow explicit */}
      <FormTextField 
        name="name" 
        control={control} 
        label="Name" 
      />
      <FormTextField 
        name="email" 
        control={control} 
        label="Email" 
      />
      <Button type="submit">Save</Button>
    </Box>
  );
};
```

---

## ✅ Best Practices Checklist

### Component Reusability:
- [ ] Component accepts data via props (not internal fetching)
- [ ] Props use generic names (`data`, `items`, `value`)
- [ ] Component is small and focused (single responsibility)
- [ ] Component can be used in multiple pages
- [ ] Component is configurable (variants, sizes, colors)
- [ ] Common patterns extracted into shared components
- [ ] Composition used over inheritance

### Data Flow:
- [ ] Started with props (simplest approach)
- [ ] Context used only when necessary (4+ levels or complex data)
- [ ] Context values are stable (useMemo used)
- [ ] Context split by concern (separate contexts for different domains)
- [ ] Props and context combined appropriately
- [ ] Data flow is documented and clear

### Performance:
- [ ] Context providers don't re-render unnecessarily
- [ ] Context values memoized with useMemo
- [ ] Components using context are optimized (React.memo if needed)
- [ ] Prop drilling used for frequently changing data

---

## 🚫 Anti-Patterns to Avoid

### 1. Fetching Data Inside Reusable Components
```typescript
// ❌ BAD: Component fetches its own data
const UserCard: React.FC = () => {
  const { user } = useUserProfile(); // ❌ Not reusable!
  return <Card>{user.name}</Card>;
};

// ✅ GOOD: Component receives data via props
const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return <Card>{user.name}</Card>;
};
```

### 2. Using Context for Everything
```typescript
// ❌ BAD: Context for simple UI state
const ButtonColorContext = createContext<string>('primary');

// ✅ GOOD: Props for simple UI state
<Button color="primary">Click Me</Button>
```

### 3. Prop Drilling Through 5+ Levels
```typescript
// ❌ BAD: Passing props through many levels
<Level1 user={user}>
  <Level2 user={user}>
    <Level3 user={user}>
      <Level4 user={user}>
        <Level5 user={user} />  {/* Finally used here */}
      </Level4>
    </Level3>
  </Level2>
</Level1>

// ✅ GOOD: Use context for deep trees
<UserProvider user={user}>
  <Level1>
    <Level2>
      <Level3>
        <Level4>
          <Level5 />  {/* Uses useUserContext() */}
        </Level4>
      </Level3>
    </Level2>
  </Level1>
</UserProvider>
```

### 4. Tightly Coupling Components to Pages
```typescript
// ❌ BAD: Component knows about page structure
const ProfileCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserProfile();
  
  return (
    <Card onClick={() => navigate('/profile')}>
      {user.name}
    </Card>
  );
};

// ✅ GOOD: Component is generic
interface ProfileCardProps {
  user: User;
  onClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onClick }) => {
  return (
    <Card onClick={onClick}>
      {user.name}
    </Card>
  );
};
```

---

## 📚 Summary

### Key Takeaways:

1. **Design for Reusability:**
   - Make components generic and configurable
   - Accept data via props, not internal fetching
   - Extract common patterns into shared components

2. **Choose the Right Data Flow:**
   - Start with props (simplest)
   - Use context for deep trees (4+ levels) or complex data
   - Combine props and context for optimal solution

3. **Follow Best Practices:**
   - Keep components small and focused
   - Use composition over inheritance
   - Document data flow patterns
   - Optimize context for performance

4. **Avoid Anti-Patterns:**
   - Don't fetch data inside reusable components
   - Don't use context for everything
   - Don't prop drill through 5+ levels
   - Don't tightly couple components to pages

**Remember:** The goal is to create components that are **reusable, maintainable, and performant**. Choose the data flow pattern that best fits your specific use case.

---

**Last Updated:** January 21, 2025  
**Related Documents:**
- `.kiro/steering/react-implementation-workflow.md` - Main workflow (Steps 7-8 reference this guide)
- `.kiro/steering/react-component-patterns.md` - Component architecture patterns
- `.kiro/steering/react-state-api-integration.md` - Context API implementation details
