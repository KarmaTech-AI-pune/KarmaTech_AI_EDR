# EDR Autonomous Development Agent - Usage Guide

## Overview
The EDR Autonomous Development Agent is designed to implement EDR features end-to-end following the AI-DLC 7-step process autonomously.

## Quick Start

### 1. Basic Feature Implementation
```bash
# Implement a specific EDR feature
python edr_agent.py implement EDR-1 "Multiple WBS per Project" "Enable a single project to have multiple Work Breakdown Structures"

# With business context
python edr_agent.py implement EDR-2 "Program Management" "Create program entity for multiple projects" "Large initiatives need coordinated project management"
```

### 2. Get Feature Estimates
```bash
# Get effort estimate without implementing
python edr_agent.py estimate "New Dashboard Widget" "Add a new KPI widget to the dashboard"
```

### 3. View Roadmap
```bash
# See all roadmap features with estimates
python edr_agent.py roadmap
```

## How It Works

### AI-DLC 7-Step Process
The agent follows this mandatory workflow for every feature:

```
1. REQUIREMENT ANALYSIS (Internal, Autonomous)
   ├─ Parse requirements into acceptance criteria
   ├─ Identify affected modules
   ├─ Document assumptions and business rules
   └─ OUTPUT: REQUIREMENT_ANALYSIS_[FeatureID].md

2. CODEBASE IMPACT ANALYSIS (Internal, Autonomous)
   ├─ Scan entire codebase for affected files
   ├─ Identify integration points
   ├─ Assess breaking change risks
   └─ OUTPUT: IMPACT_ANALYSIS_[FeatureID].md

3. TECHNICAL DESIGN (Internal, Autonomous)
   ├─ Design database schema changes
   ├─ Design API endpoints
   ├─ Design frontend components
   └─ OUTPUT: TECHNICAL_DESIGN_[FeatureID].md

   ┌─────────────────────────────────┐
   │   HUMAN REVIEW GATE #1          │
   │   Review Steps 1-3 and Approve  │
   └─────────────────────────────────┘

4. IMPLEMENTATION (Internal, Autonomous)
   ├─ 4A: Database Layer (migrations + rollback)
   ├─ 4B: Backend/API Layer (CQRS + validation)
   ├─ 4C: Frontend Layer (React components)
   └─ 4D: Integration (connect all layers)

5. TESTING (Internal, Autonomous)
   ├─ Unit Tests (80%+ coverage)
   ├─ Integration Tests
   ├─ E2E Tests
   └─ Performance Tests

6. CODE QUALITY AUDIT (Internal, Autonomous)
   ├─ Standards compliance check
   ├─ Performance validation
   └─ Documentation updates

   ┌─────────────────────────────────┐
   │   HUMAN REVIEW GATE #2          │
   │   Code Review & Approve         │
   └─────────────────────────────────┘

7. DEPLOYMENT PACKAGE (Internal, Autonomous)
   ├─ Create deployment checklist
   ├─ Prepare migration scripts
   ├─ Create rollback plan
   └─ Prepare monitoring queries

   ┌─────────────────────────────────┐
   │   HUMAN REVIEW GATE #3          │
   │   Approve Production Deployment │
   └─────────────────────────────────┘
```

## Integration with Kiro

### Using as Kiro Agent
The EDR Agent can be integrated with Kiro for seamless development:

```python
# In Kiro context
from edr_autonomous_agent.edr_agent import EDRAgent

agent = EDRAgent()

# Developer request through Kiro
result = await agent.implement_feature(
    feature_id="EDR-1",
    title="Multiple WBS per Project", 
    description="Enable multiple WBS structures per project",
    business_context="Different project phases need different WBS views",
    requested_by="Harshal"
)
```

### Kiro Hook Integration
Create Kiro hooks for automatic feature implementation:

```yaml
# .kiro/hooks/edr-feature-request.yaml
name: "EDR Feature Implementation"
trigger: "manual"
description: "Implement EDR feature autonomously"
script: |
  python edr-autonomous-agent/edr_agent.py implement $FEATURE_ID "$TITLE" "$DESCRIPTION"
```

## Example Workflows

### Implementing EDR-1: Multiple WBS per Project

```bash
python edr_agent.py implement EDR-1 "Multiple WBS per Project" "A single project should be able to have multiple Work Breakdown Structures. Each WBS plan should have a unique name and only one can be active at a time."
```

**What the agent will do:**
1. ✅ Analyze requirement and create acceptance criteria
2. ✅ Scan codebase for WBS-related files
3. ✅ Design new WBSPlan table and relationships
4. ✅ Design API endpoints for WBS plan management
5. ✅ Design frontend components for WBS plan selection
6. ⏸️ **HUMAN REVIEW GATE #1** - Review technical design
7. ✅ Create database migration for WBSPlan table
8. ✅ Implement WBSPlan entity and repository
9. ✅ Implement CQRS commands/queries
10. ✅ Implement WBSPlanController with CRUD endpoints
11. ✅ Update WBS APIs to support WBSPlanId
12. ✅ Create WBSPlanSelector React component
13. ✅ Create WBS Plan Management page
14. ✅ Write comprehensive tests (unit, integration, E2E)
15. ✅ Run performance tests
16. ✅ Update documentation
17. ⏸️ **HUMAN REVIEW GATE #2** - Code review
18. ✅ Create deployment package with migration scripts
19. ⏸️ **HUMAN REVIEW GATE #3** - Production deployment approval

**Deliverables:**
- ✅ Database migrations (forward + rollback)
- ✅ Complete backend implementation
- ✅ Complete frontend implementation  
- ✅ 80%+ test coverage
- ✅ Updated documentation
- ✅ Deployment package
- ✅ Zero breaking changes

### Getting Feature Estimates

```bash
python edr_agent.py estimate "Sprint Burndown Chart" "Add burndown chart visualization to sprint management"
```

**Output:**
```json
{
  "title": "Sprint Burndown Chart",
  "feature_type": "Enhancement",
  "affected_modules": ["Sprint Management", "Dashboard"],
  "estimated_effort_hours": 24,
  "estimated_effort_days": 3,
  "breaking_change_risk": "Low",
  "database_changes_needed": false,
  "api_changes_needed": true,
  "frontend_changes_needed": true,
  "complexity": "Medium"
}
```

## Configuration

### Environment Configuration
```python
# config.py
DEVELOPMENT_CONFIG = EDRAgentConfig(
    require_human_approval=True,
    auto_deploy_to_staging=False,
    minimum_test_coverage=0.80,
    maximum_api_response_time_ms=500
)
```

### Quality Gates
- **Test Coverage**: Minimum 80%
- **API Response Time**: Maximum 500ms
- **Code Quality**: Must pass all standards checks
- **Breaking Changes**: None allowed without explicit approval

## Output Files

Each implementation creates structured output:

```
edr-autonomous-agent/
├── outputs/
│   └── EDR-1/
│       ├── REQUIREMENT_ANALYSIS_EDR-1.md
│       ├── IMPACT_ANALYSIS_EDR-1.md
│       ├── TECHNICAL_DESIGN_EDR-1.md
│       ├── TEST_REPORT_EDR-1.md
│       ├── CODE_QUALITY_REPORT_EDR-1.md
│       └── DEPLOYMENT_PACKAGE_EDR-1.md
└── sessions/
    └── 20241103_143022.json  # Complete session log
```

## Human Review Gates

### Gate #1: Technical Design Review
- Review requirement analysis
- Approve technical design
- Validate database schema changes
- Approve API endpoint design

### Gate #2: Code Review
- Review implemented code
- Validate test coverage
- Check performance metrics
- Approve for staging deployment

### Gate #3: Production Deployment
- Review deployment package
- Approve migration scripts
- Validate rollback procedures
- Approve production deployment

## Best Practices

### For Developers
1. **Be Specific**: Provide clear, detailed requirements
2. **Include Context**: Add business justification
3. **Review Gates**: Participate in human review gates
4. **Test Thoroughly**: Validate agent output in staging

### For the Agent
1. **No Step Skipping**: Complete all 7 AI-DLC steps
2. **Quality First**: Never compromise on test coverage
3. **Documentation**: Always update technical docs
4. **Performance**: Meet all performance benchmarks

## Troubleshooting

### Common Issues
1. **Agent Fails at Step 2**: Usually codebase scanning issues
   - Check file permissions
   - Ensure project structure is correct

2. **Tests Fail**: Usually integration issues
   - Check database connection
   - Verify API endpoints are accessible

3. **Performance Issues**: Usually query optimization needed
   - Review database indexes
   - Check N+1 query problems

### Getting Help
- Check session logs in `sessions/` directory
- Review output files in `outputs/[FeatureID]/`
- Contact development team for human review gates

## Roadmap Integration

The agent knows about all EDR roadmap features:
- **Phase 1**: 14 EDR core enhancements
- **Phase 2**: 8 EAR core agent enhancements  
- **Phase 3**: EAR extension agents
- **Phase 4**: DevOps optimization

Use `python edr_agent.py roadmap` to see all features with estimates.