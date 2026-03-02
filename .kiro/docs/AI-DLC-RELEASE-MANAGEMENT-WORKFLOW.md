# Release Management Workflow (AI-DLC)

## 1. Automated Testing Phase (Quality Gates)
Before initiating any release, the following suites must achieve a **100% success rate** on the `Kiro/dev` branch:
- **Frontend & Backend Tests** (Unit/Integration)
- **Regression Tests**
- **Integration Tests**
- **Smoke Tests**

## 2. Build & Artifact Generation
Once the test suites pass successfully, proceed to generate the production build:
```powershell
# Run the publish script from the project root
.\PublishProject.ps1
```

## 3. Release Branch Strategy
Create a dedicated release branch starting from the verified `Kiro/dev` branch:
- **Naming Convention**: `release/vX.X.X` (e.g., `release/v1.1.0`)
- **Base Branch**: `Kiro/dev`

## 4. E2E Validation & Deployment
1.  Execute **End-to-End (E2E) Testing** on the newly created release branch.
2.  **Deploy to AWS** only after E2E testing confirms 100% stability.

## 5. Promotion & Pull Request (PR) Flow
Two specific PRs must be opened to complete the release cycle:

### PR 1: External Deployment (To SaaS)
Promote the release to the external deployment repository:
- **Base Repository**: `RamyaSuvarapu/EDR_Project_Deploy`
- **Base Branch**: `Saas/dev`
- **Head Repository**: `makshintre/KarmaTech_AI_EDR`
- **Compare Branch**: `release/vX.X.X`

### PR 2: Internal Sync (To Master)
Merge the release changes back into the internal main branch:
- **Base Repository**: `origin` (makshintre)
- **Base Branch**: `master`
- **Compare Branch**: `release/vX.X.X`

## 6. Safety & Traceability Rules
- **No Failures Allowed**: Any test failure in Stage 1 or 4 blocks the entire pipeline.
- **Traceability**: Every AWS deployment must have a corresponding version tag and release branch history.

---
*Updated: February 2026 | Status: Enhanced Release Workflow*
