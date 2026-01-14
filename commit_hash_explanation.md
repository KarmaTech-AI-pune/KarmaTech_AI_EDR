# COMMIT_HASH in Docker Image Tagging - Detailed Explanation

## What is a COMMIT_HASH?

A **commit hash** (or commit SHA) is a unique 40-character identifier that Git automatically generates for every code commit. It's like a fingerprint for your code.

### Example Commit Hashes

```
Full Hash (40 characters):
a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7

Short Hash (7 characters - commonly used):
a3f5e8b

Branch: Saas/dev
Author: John Smith
Date: 2025-01-14 10:30:00
Message: "Fix multi-tenant tenant isolation bug"
```

### How Git Generates It

```
Git takes ALL the code in your commit + metadata
    ↓
Runs it through SHA-1 hash algorithm
    ↓
Produces unique 40-character identifier
```

---

## Why Use COMMIT_HASH for Docker Images?

### The Problem Without COMMIT_HASH

```
Build 1: docker build -t njs-multitenant-backend:latest .
Build 2: docker build -t njs-multitenant-backend:latest .
Build 3: docker build -t njs-multitenant-backend:latest .

Result: All builds have the SAME tag!
You can't tell them apart or rollback!
```

### The Solution: COMMIT_HASH Tagging

```
Build 1 (commit a3f5e8b): njs-multitenant-backend:a3f5e8b ✓ Unique
Build 2 (commit f4a7e8b): njs-multitenant-backend:f4a7e8b ✓ Unique
Build 3 (commit c2d1f4a): njs-multitenant-backend:c2d1f4a ✓ Unique

Result: Each build is uniquely identified!
```

---

## In Your Workflow: How It Works

### Step 1: GitHub Actions Captures the COMMIT_HASH

```yaml
env:
  IMAGE_TAG: ${{ github.sha }}
  IMAGE_TAG_LATEST: latest
```

**What is `${{ github.sha }}`?**
- A GitHub Actions variable that contains the commit hash
- Automatically populated when workflow runs
- Example value: `a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7`

### Step 2: Docker Image Gets Two Tags

```bash
# Build with unique commit hash tag
docker build -f Dockerfile.backend-only \
  -t $ECR_REGISTRY/njs-multitenant-backend:a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7 .

# Also tag as 'latest'
docker tag njs-multitenant-backend:a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7 \
           njs-multitenant-backend:latest
```

**Result: Same image, two tags**

```
ECR Registry
│
├─ njs-multitenant-backend:a3f5e8b9c2d1f4a7... → Points to Image ID: sha256:xyz...
│
├─ njs-multitenant-backend:latest → Points to Image ID: sha256:xyz...
│
├─ njs-multitenant-backend:f4a7e8b9c2d1f4a7... → Points to Image ID: sha256:abc...
│
└─ (previous builds with their own hashes)
```

### Step 3: Both Tags Get Pushed to ECR

```bash
docker push $ECR_REGISTRY/njs-multitenant-backend:a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7
docker push $ECR_REGISTRY/njs-multitenant-backend:latest
```

---

## Real-World Example Timeline

### Scenario: Three Deployments

```
═══════════════════════════════════════════════════════════════

DEPLOYMENT 1 - Monday 10:00 AM
├─ Commit Hash: a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7
├─ Change: "Add user authentication"
├─ Image Tags: 
│  ├─ njs-multitenant-backend:a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7
│  └─ njs-multitenant-backend:latest (first time)
├─ Deployed to ECS
└─ Status: Running in production ✓

═══════════════════════════════════════════════════════════════

DEPLOYMENT 2 - Monday 02:00 PM
├─ Commit Hash: f4a7e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7
├─ Change: "Fix bug in tenant isolation"
├─ Image Tags:
│  ├─ njs-multitenant-backend:f4a7e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7
│  └─ njs-multitenant-backend:latest (updated to point here)
├─ Deployed to ECS
└─ Status: Running in production ✓

═══════════════════════════════════════════════════════════════

DEPLOYMENT 3 - Monday 04:00 PM
├─ Commit Hash: c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1
├─ Change: "Add new API endpoint"
├─ Image Tags:
│  ├─ njs-multitenant-backend:c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f
│  └─ njs-multitenant-backend:latest (updated to point here)
├─ Deployed to ECS
└─ Status: Running in production ✓

⚠️  BUG DISCOVERED - New endpoint crashes on certain requests!

═══════════════════════════════════════════════════════════════
```

---

## The Power: Easy Rollback

### Without COMMIT_HASH
```
Oh no! Production is broken!

Which version was working?
njs-multitenant-backend:latest (current - broken)
njs-multitenant-backend:latest (previous - ?)
njs-multitenant-backend:latest (older - ?)

You can't tell them apart! No way to rollback! 😱
```

### With COMMIT_HASH
```
Oh no! Production is broken!

Current version (broken):
njs-multitenant-backend:c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f

Previous version (was working):
njs-multitenant-backend:f4a7e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7

Action: Update ECS service to use the previous image tag ✓

Rollback complete! 😊
```

---

## Task Definition: Where COMMIT_HASH is Used

In your deployment workflow, the Task Definition includes:

```json
{
  "containerDefinitions": [
    {
      "image": "008971635132.dkr.ecr.us-east-1.amazonaws.com/njs-multitenant-backend:a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7",
      "name": "njs-multitenant-backend",
      "portMappings": [
        {
          "containerPort": 8080
        }
      ]
    }
  ]
}
```

**The image field points to:**
- Registry: `008971635132.dkr.ecr.us-east-1.amazonaws.com`
- Repository: `njs-multitenant-backend`
- Tag: `a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7` ← **COMMIT_HASH**

When ECS deploys this task, it pulls the exact container image built from that specific commit.

---

## Workflow Step-by-Step with COMMIT_HASH

```yaml
jobs:
  build-and-push:
    steps:
      - name: Build, tag, and push image
        env:
          IMAGE_TAG: ${{ github.sha }}  # e.g., "a3f5e8b9c2d1f4a7..."
        run: |
          # Step 1: Build with commit hash
          docker build -f Dockerfile.backend-only \
            -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          
          # Step 2: Tag as 'latest' too
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                     $ECR_REGISTRY/$ECR_REPOSITORY:latest
          
          # Step 3: Push both tags
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          
          # Step 4: Save the image URI for later use
          echo "image-uri=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

  deploy-to-ecs:
    needs: build-and-push
    steps:
      - name: Create ECS Task Definition
        run: |
          # Use the image from the previous job (identified by COMMIT_HASH)
          IMAGE_URI="${{ needs.build-and-push.outputs.image-uri }}"
          # IMAGE_URI = "008971635132.dkr.ecr.us-east-1.amazonaws.com/njs-multitenant-backend:a3f5e8b9c2d1f4a7..."
```

---

## Key Benefits of COMMIT_HASH Tagging

| Benefit | Explanation |
|---------|-------------|
| **Version Control** | Each image is tied to a specific code commit |
| **Traceability** | Know exactly which code version is running |
| **Easy Rollback** | Simply redeploy an older image tag |
| **Audit Trail** | Track deployment history with commit messages |
| **Parallel Versions** | Multiple versions can coexist in ECR |
| **CI/CD Integration** | Automatic linking between code and containers |
| **Debugging** | Correlate bugs to specific code versions |

---

## How to Find a COMMIT_HASH

### In GitHub UI
```
GitHub → Your Repository → Commits
│
└─ Each commit shows its hash
   "Fix bug abc1234def"  ← First 7 characters shown
   
Click on commit:
Full hash: abc1234def5678f90g1h2i3j4k5l6m7n8o9
```

### In Command Line
```bash
git log --oneline

# Output:
a3f5e8b Fix multi-tenant bug
f4a7e8b Add user authentication
c2d1f4a Initial setup

# Full hash:
git log -1 --format=%H

# Output:
a3f5e8b9c2d1f4a7e8b9c2d1f4a7e8b9c2d1f4a7
```

---

## Summary

**COMMIT_HASH** = A unique identifier for your code at a specific moment in time

**In your workflow:**
```
Code pushed → GitHub captures commit hash → Docker builds image with that hash as tag 
→ Image stored in ECR with unique identifier → ECS deploys container with that specific version
```

**Why it matters:**
- You always know which exact code is running
- You can instantly rollback if something breaks
- Multiple versions can coexist for testing/comparison
- Complete audit trail from code to production