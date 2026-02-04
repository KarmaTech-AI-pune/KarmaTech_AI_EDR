# AWS Multi-Tenant Deployment Training Guide

## Overview

This is a comprehensive CI/CD (Continuous Integration/Continuous Deployment) pipeline that automates the deployment of a multi-tenant SaaS application to AWS. The system deploys both frontend and backend components with automatic versioning and multi-environment support.

---

## Architecture Overview

```
GitHub Repository
    ↓
GitHub Actions (CI/CD Pipeline)
    ├─→ Frontend Deployment
    │   ├─ Admin Application → CloudFormation → S3 + CloudFront
    │   └─ Tenant Application → CloudFormation → S3 + CloudFront
    │
    ├─→ Backend Deployment
    │   ├─ Docker Build → ECR (Container Registry)
    │   └─ ECS Fargate → Auto-scaling Containers
    │
    └─→ Auto-Tagging
        └─ Create Release Tags on PR Merge
```

---

## Part 1: Frontend Deployment Pipeline

### What Gets Deployed

The frontend consists of two separate applications:
- **Admin Application**: Administrative dashboard at `edr-admin.app.karmatech-ai.com`
- **Tenant Application**: Multi-tenant user portal at `app.karmatech-ai.com` and `*.app.karmatech-ai.com`

### Trigger Conditions

The frontend deployment runs automatically when:
- Changes are pushed to the `Saas/dev` branch
- Changes occur in the `frontend/` directory OR workflow files
- Manual trigger via workflow dispatch

### Step-by-Step Frontend Deployment

#### 1. **Infrastructure Deployment (CloudFormation)**

CloudFormation is an Infrastructure-as-Code service that automatically creates AWS resources:

```
Input: CloudFormation Templates
  ↓
Deploy Admin Stack (njs-admin-frontend-dev)
Deploy Tenant Stack (njs-tenant-frontend-dev)
  ↓
Output: S3 Buckets + CloudFront Distributions
```

**What gets created:**
- **S3 Buckets**: Static storage for the compiled frontend files
- **CloudFront Distributions**: Content Delivery Network (CDN) that caches and serves files globally
- **SSL Certificate**: ANOVA ACM certificate for HTTPS encryption (ARN: `arn:aws:acm:us-east-1:008971635132:certificate/20320ffc-0572-4e4e-9945-ef681c0a5937`)

#### 2. **Build Application**

The build process happens in Node.js:

```bash
# Install dependencies from package-lock.json
npm install

# Create environment configuration
cat > .env.production <<EOF
VITE_API_BASE_URL=https://api.app.karmatech-ai.com/
VITE_APP_ENV=production
VITE_MAIN_DOMAIN=edr-admin.app.karmatech-ai.com  # or app.karmatech-ai.com for tenant
VITE_APP_TYPE=admin  # or tenant
EOF

# Compile to static files
npm run build
# Creates: frontend/dist/ folder with HTML, CSS, JS files
```

#### 3. **Deploy to S3 and CloudFront**

```bash
# Sync build files to S3 bucket
aws s3 sync frontend/dist/ s3://[BUCKET_NAME] --delete

# Invalidate CloudFront cache to serve new files
aws cloudfront create-invalidation \
  --distribution-id [DIST_ID] \
  --paths "/*"
```

**Why both S3 and CloudFront?**
- **S3**: The origin storage (like a library)
- **CloudFront**: The distributed cache (like multiple library branches worldwide)

#### 4. **DNS Configuration Required**

After deployment, DNS records must be added to GoDaddy:

```
edr-admin.app → CloudFront distribution domain
app → CloudFront distribution domain
*.app → CloudFront distribution domain (wildcard for subdomains)
```

### Frontend Deployment Summary

| Component | Admin | Tenant |
|-----------|-------|--------|
| S3 Bucket | njs-admin-frontend-dev | njs-tenant-frontend-dev |
| URL | https://edr-admin.app.karmatech-ai.com | https://app.karmatech-ai.com, https://*.app.karmatech-ai.com |
| Environment | production | dev |
| App Type | admin | tenant |

---

## Part 2: Multi-Tenant Backend Deployment Pipeline

### What Gets Deployed

A single backend API that serves multiple tenants (organizations) via a shared infrastructure with logical data isolation.

### Trigger Conditions

The backend deployment runs when:
- Changes are pushed to the `Saas/dev` branch
- Changes occur in the `backend/`, `Dockerfile`, or task definition files
- Manual trigger with environment selection (development/staging/production)

### Step-by-Step Backend Deployment

#### 1. **Build Docker Image**

Docker containerizes the backend application:

```bash
# Build Docker image from Dockerfile.backend-only
docker build -f Dockerfile.backend-only \
  -t [ECR_REGISTRY]/njs-multitenant-backend:[COMMIT_HASH] .

# Tag with latest
docker tag [ECR_REGISTRY]/njs-multitenant-backend:[COMMIT_HASH] \
           [ECR_REGISTRY]/njs-multitenant-backend:latest

# Push to Amazon ECR (Elastic Container Registry)
docker push [ECR_REGISTRY]/njs-multitenant-backend:[COMMIT_HASH]
docker push [ECR_REGISTRY]/njs-multitenant-backend:latest
```

**Key Point**: Each deployment creates a unique image tagged with the Git commit SHA for version tracking and easy rollback.

#### 2. **Create ECS Task Definition**

The Task Definition is a blueprint for running the Docker container:

```json
{
  "family": "njs-multitenant-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "image": "[ECR_IMAGE_URI]",
      "containerPort": 8080,
      "environment": [
        {
          "name": "ASPNETCORE_ENVIRONMENT",
          "value": "Development"
        },
        {
          "name": "ConnectionStrings__AppDbConnection",
          "value": "Server=njs-database.cxe40c86capb.us-east-1.rds.amazonaws.com;Database=KarmaTechAI_EDR_SAAS;User Id=admin;Password=..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "awslogs-group": "/ecs/njs-multitenant-backend"
      }
    }
  ]
}
```

**Components:**
- **FARGATE**: Serverless container execution (AWS manages infrastructure)
- **CPU/Memory**: 512 CPU units and 1GB RAM per instance
- **Environment Variables**: Configuration for the .NET Core application
- **Database Connection**: Points to RDS PostgreSQL database
- **CloudWatch Logs**: Centralized logging

#### 3. **Create/Update ECS Service**

The Service runs and manages the containers:

```bash
aws ecs create-service \
  --cluster njs-multitenant-backend-cluster \
  --service-name njs-multitenant-backend-service \
  --task-definition njs-multitenant-backend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration awsvpcConfiguration={...} \
  --load-balancers targetGroupArn=njs-backend-tg,containerPort=8080 \
  --health-check-grace-period-seconds 300
```

**Key Features:**
- **Desired Count**: Number of container instances to run (1 initially, scales up with load)
- **Health Checks**: Waits 300 seconds before considering service ready
- **Load Balancer Integration**: ALB automatically distributes traffic

#### 4. **Traffic Routing via Load Balancer**

```
Internet
  ↓
ALB (njs-multitenant-alb)
  ↓
Target Group (njs-backend-tg)
  ↓
ECS Service (1+ container instances)
  ↓
Application on port 8080
```

#### 5. **Service Stabilization & Health Check**

```bash
# Wait for all tasks to reach steady state
aws ecs wait services-stable \
  --cluster njs-multitenant-backend-cluster \
  --services njs-multitenant-backend-service

# Test API health endpoint
curl http://[ALB_DNS]/health
```

### Multi-Tenant Architecture Benefits

| Feature | Benefit |
|---------|---------|
| Single Backend Instance | Cost-effective, easier maintenance |
| Shared Database | Simplified backup and recovery |
| Tenant Isolation | Data separation at application level |
| Single ALB | One entry point for all tenants |
| Shared CloudWatch Logs | Centralized monitoring |

---

## Part 3: Automatic Release Tagging

### Purpose

Automatically creates semantic version tags when pull requests merge, enabling release tracking and versioning.

### How It Works

```
PR Merge to Saas/dev
  ↓
Check PR Labels (major, minor, patch)
  ↓
Determine Next Version
  ↓
Create & Push Git Tag
```

### Versioning Logic

```
Current Version: v1.2.3

PR with "minor" label → v1.3.0
PR with "major" label → v2.0.0
PR with no label      → v1.2.4 (default patch)
```

---

## Part 4: Environment Variables & Configuration

### Critical AWS Secrets (Stored in GitHub)

```
AWS_ACCESS_KEY_ID          → AWS credentials for API calls
AWS_SECRET_ACCESS_KEY      → AWS credentials for API calls
AWS_ACCOUNT_ID             → Account number (008971635132)
SUBNET_IDS                 → VPC subnet IDs for ECS
NJS_API_ECS_SG            → Security group for containers
```

### Hardcoded Configuration

```
AWS_REGION: us-east-1
CERTIFICATE_ARN: arn:aws:acm:us-east-1:008971635132:certificate/...
API_BASE_URL: https://api.app.karmatech-ai.com/
RDS_DATABASE: KarmaTechAI_EDR_SAAS
RDS_ENDPOINT: njs-database.cxe40c86capb.us-east-1.rds.amazonaws.com
```

---

## Part 5: Complete Deployment Flow Diagram

```
Code Change Pushed to Saas/dev
  ↓
├─── IF frontend/** changed ──────────────────────────┐
│                                                      │
│  1. Checkout code                                    │
│  2. Deploy CloudFormation stacks                     │
│  3. Get S3 bucket names & CloudFront IDs            │
│  4. Build frontend (npm install → npm run build)    │
│  5. Upload to S3                                     │
│  6. Invalidate CloudFront cache                      │
│  7. Generate deployment summary                      │
│                                                      │
└──────────────→ Frontend Live ────────────────────────┘

├─── IF backend/** changed ──────────────────────────┐
│                                                     │
│  1. Checkout code                                   │
│  2. Build Docker image with commit hash            │
│  3. Push to ECR (latest + versioned)               │
│  4. Create ECS Task Definition                      │
│  5. Register task definition                        │
│  6. Create/Update ECS Service                       │
│  7. Wait for service stabilization                  │
│  8. Run health checks                               │
│  9. Generate deployment summary                     │
│                                                     │
└────────────→ Backend Live ──────────────────────────┘

├─── IF PR merged ─────────────────────────────────┐
│                                                  │
│  1. Fetch existing version tags                  │
│  2. Determine next version (based on labels)     │
│  3. Create and push git tag                      │
│                                                  │
└─────────────→ Release Tagged ────────────────────┘
```

---

## Key Concepts Summary

### Infrastructure as Code (IaC)
CloudFormation templates define infrastructure declaratively—changes go through version control.

### Containerization
Docker packages the backend with all dependencies, ensuring consistency across environments.

### Serverless Compute
AWS Fargate eliminates server management—you deploy containers, AWS handles the infrastructure.

### Multi-Tenancy
Single backend + database with application-level tenant isolation reduces costs while maintaining security.

### CI/CD Automation
GitHub Actions automates the entire deployment pipeline—no manual steps, consistent deployments.

### Blue-Green Deployment Pattern
ECS allows updating services without downtime by gradually replacing old containers with new ones.

---

## Troubleshooting Checklist

| Issue | Solution |
|-------|----------|
| Frontend not updating | Invalidate CloudFront cache, check S3 permissions |
| Backend not responding | Check ECS task definition, RDS connection, security groups |
| Deployment stuck | Review CloudWatch logs, check AWS service limits |
| DNS not resolving | Verify GoDaddy records point to CloudFront domain |
| Health check failing | Check application logs on port 8080, verify database connection |

---

## Security Best Practices Implemented

✅ **Secrets Management**: AWS credentials stored in GitHub Secrets, never in code  
✅ **Infrastructure as Code**: All AWS resources defined in CloudFormation/task definitions  
✅ **SSL/TLS**: ACM certificate for HTTPS encryption  
✅ **Network Isolation**: VPC, security groups, and subnets control traffic  
✅ **Logging**: CloudWatch logs capture all container output for audit trails  
✅ **Version Control**: Every deployment tagged with commit hash for easy rollback  

---

## Learning Outcomes

After studying this pipeline, you should understand:
- How GitHub Actions orchestrates multi-stage deployments
- Frontend deployment to S3 + CloudFront for static assets
- Backend containerization and ECS deployment for scalable services
- Multi-tenant architecture patterns
- Infrastructure as Code using CloudFormation
- Semantic versioning and release management
- AWS services integration (ECR, ECS, S3, CloudFront, RDS, ALB, CloudWatch)