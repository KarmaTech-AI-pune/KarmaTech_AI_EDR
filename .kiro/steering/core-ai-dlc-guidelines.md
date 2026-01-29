---
inclusion: manual
---

# Core AI-DLC Guidelines (Always Active)

## 🚨 MANDATORY: Git Branch Setup (FIRST STEP ALWAYS)

**Before ANY spec creation or development work, execute these 4 commands:**

```powershell
git branch --show-current          # 1. Check current branch
git checkout Kiro/dev              # 2. Switch to base branch  
git pull origin Kiro/dev           # 3. Get latest changes
git checkout -b feature/[name]     # 4. Create clean feature branch
```

**🚫 NEVER skip this step. ALWAYS start here.**

---

## 🚨 MANDATORY: 7-Step AI-DLC Process

**CRITICAL**: Every feature implementation MUST follow the exact 7-step process. No exceptions, no shortcuts, no skipping steps.

### STEP 1: REQUIREMENT ANALYSIS (MANDATORY)
✅ **Required Actions:**
1. Parse business requirement completely
2. Scan ALL existing documentation files (DATABASE_SCHEMA.md, ARCHITECTURE.md, CODING_STANDARDS.md, API_DOCUMENTATION.md)
3. Identify ALL affected components (Database, Backend, Frontend)
4. Define clear, testable acceptance criteria using EARS format
5. Document assumptions and constraints

✅ **Required Output:** Create `REQUIREMENT_ANALYSIS_[FEATURE-ID].md`
✅ **Quality Gates:** Requirements clear, acceptance criteria testable, dependencies identified
🚫 **STOP RULE**: If any quality gate fails, STOP and request clarification

### STEP 2: CODEBASE IMPACT ANALYSIS (MANDATORY)
✅ **Required Actions:**
1. Scan existing codebase for similar patterns
2. Identify ALL files that need modification
3. Map database schema changes required
4. Assess API endpoint changes needed
5. Evaluate frontend component impacts

✅ **Required Output:** Create `IMPACT_ANALYSIS_[FEATURE-ID].md`
🚫 **STOP RULE**: If breaking changes identified without mitigation strategy, STOP and escalate

### STEP 3: TECHNICAL DESIGN (MANDATORY)
✅ **Required Actions:**
1. Design database schema following EDR patterns
2. Design API endpoints following RESTful standards
3. Design frontend components following React patterns
4. Plan comprehensive testing strategy (unit, integration, E2E, performance, security)
5. Define performance requirements and security measures

✅ **Required Output:** Create `TECHNICAL_DESIGN_[FEATURE-ID].md`
🚫 **STOP RULE**: If design conflicts with existing patterns, STOP and redesign

### STEP 4: IMPLEMENTATION (MANDATORY)
**Backend Implementation Order:**
1. Create/update database entities following BaseEntity pattern
2. Generate EF Core migrations with proper naming
3. Implement repositories following Repository pattern
4. Create CQRS commands and queries using MediatR
5. Implement API controllers following RESTful standards
6. Add proper error handling and logging

**Frontend Implementation Order:**
1. Create TypeScript interfaces for API contracts
2. Implement API service layer using Axios
3. Create React components following established patterns
4. Implement proper state management
5. Add form validation using Formik/Yup

🚫 **STOP RULE**: If code doesn't compile or violates standards, STOP and fix

### STEP 5: COMPREHENSIVE TESTING (MANDATORY)
✅ **Required Test Categories:**
1. **Unit Tests** (≥80% coverage) - Backend business logic + Frontend components
2. **Integration Tests** - API endpoints + Database integration
3. **End-to-End Tests** - Complete user workflow tests
4. **Performance Tests** - API response time (<500ms) + Load testing
5. **Security Tests** - Authentication + Authorization + Input validation
6. **Accessibility Tests** - WCAG 2.1 AA compliance

✅ **Testing Resilience Rules:**
- **NEVER abandon testing** due to technical issues
- **Level 1 (0-2 failures):** Retry with variations
- **Level 2 (3-5 failures):** Switch strategies (E2E→Integration→Unit)
- **Level 3 (6-8 failures):** Diagnostic mode with health checks
- **Level 4 (9+ failures):** Structured escalation with detailed diagnostics

🚫 **STOP RULE**: If ALL tests fail or coverage <80%, STOP and fix

### STEP 6: CODE QUALITY & OPTIMIZATION (MANDATORY)
✅ **Required Actions:**
1. Code review against established standards
2. Performance optimization where needed
3. Security vulnerability scanning
4. Code duplication analysis and refactoring
5. Documentation updates

🚫 **STOP RULE**: If critical security vulnerabilities found, STOP and fix immediately

### STEP 7: DEPLOYMENT PACKAGE (MANDATORY)
✅ **Required Actions:**
1. Create database migration scripts
2. Create rollback procedures
3. Update environment configurations
4. Create deployment checklist
5. Prepare monitoring and alerting

🚫 **STOP RULE**: If rollback procedures not tested, STOP and test before deployment

## 🌿 GitHub Automation Workflow

### Automatic Branch Creation
When spec is created, automatically:
- Create feature branch from `Kiro/dev`
- Name: `feature/[spec-name]`
- Push to GitHub and switch workspace

### Workflow Sequence
```
1. User provides requirement
   ↓
2. Kiro creates spec (Step 1: Requirements Analysis)
   ↓
3. 🤖 AUTOMATIC: Feature branch created from Kiro/dev
   ↓
4. Kiro analyzes impact (Step 2: Impact Analysis)
   ↓
5. Kiro creates design (Step 3: Technical Design)
   ↓
6. Kiro implements feature (Step 4: Implementation)
   ↓
7. 🤖 AUTOMATIC: Tests run (Step 5: Testing)
   ↓
8. Kiro validates code (Step 6: Validation)
   ↓
9. 🤖 AUTOMATIC: PR created with test results
   ↓
10. 👤 MANUAL: Human reviews & approves PR (ONLY MANUAL STEP)
    ↓
11. 🤖 AUTOMATIC: Merge & deploy (Step 7)
```

## 🔧 Core Coding Standards

### C# Backend
```csharp
// ✅ GOOD - Classes and Methods (PascalCase)
public class ProjectManagementService { }
public async Task<Project> GetProjectByIdAsync(int id) { }

// ✅ GOOD - Variables and Parameters (camelCase)
var projectRepository = new ProjectRepository();

// ✅ GOOD - Private Fields (underscore prefix)
private readonly IProjectRepository _projectRepository;
```

### TypeScript Frontend
```typescript
// ✅ GOOD - Components (PascalCase)
export const ProjectList: React.FC<ProjectListProps> = ({ status }) => { }

// ✅ GOOD - Interfaces (PascalCase, no 'I' prefix)
export interface ProjectDto {
    projectId: number;
    projectName: string;
}

// ✅ GOOD - Variables and Functions (camelCase)
const projectName = "Airport Terminal";
```

### Database
```sql
-- ✅ GOOD - Tables (PascalCase, singular)
CREATE TABLE Project ( ... )
CREATE TABLE MonthlyProgress ( ... )

-- ✅ GOOD - Columns (PascalCase)
ProjectId INT PRIMARY KEY,
ProjectName NVARCHAR(255) NOT NULL
```

## 🏗️ Core Architecture Patterns

### Backend: Clean Architecture + CQRS
```csharp
// Command Pattern
public class CreateProjectCommand : IRequest<ProjectDto> { }
public class CreateProjectHandler : IRequestHandler<CreateProjectCommand, ProjectDto> { }

// Repository Pattern
public interface IProjectRepository : IRepository<Project> { }
```

### Frontend: Component-Based
```typescript
// API Service Pattern
export const projectApi = {
    getAll: async (): Promise<Project[]> => { },
    create: async (project: CreateProjectDto): Promise<Project> => { }
};

// Custom Hooks Pattern
export const useProjects = (status?: string) => {
    const [projects, setProjects] = useState<Project[]>([]);
    // ... implementation
};
```

## 📊 Quality Gates (MANDATORY)

### Code Quality
- ✅ Follows SOLID principles
- ✅ No code duplication (DRY)
- ✅ Proper error handling and logging
- ✅ Input validation and output sanitization

### Performance
- ✅ API response times <500ms
- ✅ Frontend load times <3s
- ✅ Database queries optimized
- ✅ No N+1 query problems

### Security
- ✅ Authentication implemented
- ✅ Authorization enforced
- ✅ SQL injection prevention
- ✅ XSS protection

### Testing
- ✅ Unit test coverage ≥80%
- ✅ Integration tests pass
- ✅ E2E tests pass
- ✅ Performance tests pass

## 🚨 Critical Rules

### Process Compliance
- **NEVER skip any of the 7 steps**
- **NEVER proceed without quality gate approval**
- **ALWAYS create feature branch from Kiro/dev**
- **ALWAYS follow GitHub automation workflow**

### Testing Resilience
- **NEVER abandon testing** - adapt approach instead
- **ALWAYS try multiple testing strategies** before escalation
- **ALWAYS provide manual test plan** as fallback
- **ALWAYS achieve minimum 80% coverage**

### Code Standards
- **ALWAYS follow naming conventions** (PascalCase/camelCase)
- **ALWAYS use established patterns** (CQRS, Repository, etc.)
- **ALWAYS include proper error handling**
- **ALWAYS validate inputs and sanitize outputs**

## 🎯 Success Criteria

A feature is NOT complete until:
- ✅ All 7 steps completed in order
- ✅ All quality gates passed
- ✅ All tests passing (≥80% coverage)
- ✅ Performance requirements met
- ✅ Security requirements met
- ✅ Documentation complete
- ✅ Deployment package ready

**This ensures every AI-DLC implementation follows the exact same rigorous process with no exceptions.**