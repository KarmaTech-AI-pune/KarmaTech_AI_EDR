# Multi-Tenant Backend AWS ECS Deployment
## Complete Training Documentation

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Prepared For:** DevOps and Development Teams  
**Classification:** Internal Training Material

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Workflow Overview](#2-workflow-overview)
3. [Workflow Triggers](#3-workflow-triggers)
4. [Environment Configuration](#4-environment-configuration)
5. [Job 1: Build and Push Docker Image](#5-job-1-build-and-push-docker-image)
6. [Job 2: Deploy to ECS](#6-job-2-deploy-to-ecs)
7. [Job 3: Deployment Summary](#7-job-3-deployment-summary)
8. [AWS Infrastructure Components](#8-aws-infrastructure-components)
9. [Security Considerations](#9-security-considerations)
10. [Best Practices and Recommendations](#10-best-practices-and-recommendations)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [Appendix](#12-appendix)

---

## 1. Introduction

### 1.1 Purpose
This document provides comprehensive training on the GitHub Actions workflow that automates the deployment of a multi-tenant backend application to Amazon Web Services (AWS) using Elastic Container Service (ECS). This workflow is designed to streamline the continuous integration and continuous deployment (CI/CD) process, reducing manual intervention and potential human error.

### 1.2 Scope
The workflow covers the complete deployment pipeline, including:
- Docker container image building and versioning
- Image storage in Amazon Elastic Container Registry (ECR)
- ECS infrastructure provisioning and management
- Application Load Balancer (ALB) integration
- Database connectivity configuration
- Logging and monitoring setup
- Deployment verification and health checks

### 1.3 Target Audience
This documentation is intended for:
- **DevOps Engineers** responsible for maintaining CI/CD pipelines
- **Backend Developers** who need to understand the deployment process
- **System Administrators** managing AWS infrastructure
- **Technical Leads** overseeing deployment strategies

### 1.4 Prerequisites
Before working with this workflow, you should have:
- Basic understanding of Docker and containerization concepts
- Familiarity with AWS services (ECS, ECR, RDS, ALB)
- Knowledge of GitHub Actions and YAML syntax
- Access to AWS console and GitHub repository settings
- Understanding of networking concepts (VPCs, subnets, security groups)

---

## 2. Workflow Overview

### 2.1 Workflow Purpose
The workflow file `deploy-multitenant-backend.yml` orchestrates the complete deployment lifecycle of a multi-tenant backend API. It automates tasks that would traditionally require multiple manual steps, terminal commands, and AWS console interactions.

### 2.2 Workflow Architecture
The workflow consists of three sequential jobs:
1. **Build and Push:** Compiles the Docker image and uploads it to Amazon ECR
2. **Deploy to ECS:** Creates or updates ECS infrastructure and deploys the new image
3. **Deployment Summary:** Generates a comprehensive deployment report

### 2.3 Execution Flow
`Trigger Event` → `Build Docker Image` → `Push to ECR` → `Register Task Definition` → `Create/Update ECS Service` → `Wait for Stability` → `Verify Deployment` → `Generate Summary`

---

## 3. Workflow Triggers

### 3.1 Automatic Push Triggers

**Trigger Configuration:**
```yaml
on:
  push:
    branches: [ Saas/dev ]
    paths:
      - 'backend/**'
      - 'Dockerfile.backend-only'
      - 'aws-ecs-task-definition-backend.json'
      - '.github/workflows/deploy-multitenant-backend.yml'
```

**Behavior:** The workflow executes automatically when code is pushed to the `Saas/dev` branch, but only if changes occur in specified paths.

**Monitored Paths:**
- `backend/**` - Any changes to backend application code
- `Dockerfile.backend-only` - Changes to the Docker build configuration
- `aws-ecs-task-definition-backend.json` - Updates to ECS task definitions
- `.github/workflows/deploy-multitenant-backend.yml` - Workflow file modifications

**Use Case:** This trigger ensures that every code change to the backend automatically deploys to the development environment, enabling rapid iteration and testing.

### 3.2 Pull Request Validation

**Trigger Configuration:**
```yaml
pull_request:
  branches: [ Saas/dev ]
  paths: [same as push]
```

**Behavior:** Executes on pull requests targeting the `Saas/dev` branch when the same file paths are modified.

**Use Case:** Validates that deployment configurations work correctly before merging code changes, catching deployment issues during code review.

### 3.3 Manual Workflow Dispatch

**Trigger Configuration:**
```yaml
workflow_dispatch:
  inputs:
    environment:
      description: 'Environment to deploy to'
      required: true
      default: 'development'
      type: choice
      options:
        - development
        - staging
        - production
```

**Behavior:** Allows manual triggering through the GitHub Actions interface with environment selection.

**Available Environments:**
- **Development:** Default environment for testing and development
- **Staging:** Pre-production environment for final testing
- **Production:** Live production environment

**Use Case:** Enables controlled deployments to specific environments, useful for production releases or hotfixes.

---

## 4. Environment Configuration

### 4.1 Environment Variables
The workflow defines several environment variables at the workflow level for consistency across all jobs.

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `AWS_REGION` | `us-east-1` | AWS region for all resources |
| `ECR_REPOSITORY_BACKEND` | `njs-multitenant-backend` | ECR repository name for Docker images |
| `ECS_CLUSTER_NAME` | `njs-multitenant-backend-cluster` | ECS cluster identifier |
| `ECS_SERVICE_NAME` | `njs-multitenant-backend-service` | ECS service name |
| `ECS_TASK_DEFINITION_NAME` | `njs-multitenant-backend-task` | Task definition family name |
| `ALB_TARGET_GROUP` | `njs-backend-tg` | Load balancer target group |
| `IMAGE_TAG` | `${{ github.sha }}` | Git commit SHA for version tracking |
| `IMAGE_TAG_LATEST` | `latest` | Latest tag for convenience |

### 4.2 Required GitHub Secrets
The following secrets must be configured in GitHub repository settings:

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_ACCOUNT_ID` | AWS account number | `123456789012` |
| `SUBNET_IDS` | Comma-separated subnet IDs | `subnet-12345,subnet-67890` |
| `NJS_API_ECS_SG` | Security group ID for ECS tasks | `sg-0123456789abcdef0` |

### 4.3 AWS Resource Naming Convention
All resources follow a consistent naming pattern: `njs-multitenant-[resource-type]`

This convention provides:
- Easy identification of related resources
- Clear purpose indication
- Simplified resource management and cost tracking

---

## 5. Job 1: Build and Push Docker Image

### 5.1 Job Configuration
```yaml
build-and-push:
  name: Build and Push Docker Image
  runs-on: ubuntu-latest
  outputs:
    image-uri: ${{ steps.image-uri.outputs.uri }}
```
**Runner:** Ubuntu latest version (GitHub-hosted)  
**Output:** Image URI for use in subsequent jobs

### 5.2 Step-by-Step Breakdown

#### Step 1: Checkout Code
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```
**Purpose:** Retrieves the complete repository codebase, including all files needed for the Docker build.  
**Action Used:** GitHub's official checkout action (version 4)  
**What Happens:**
- Clones the repository to the runner's workspace
- Checks out the specific commit that triggered the workflow
- Makes all files available for subsequent steps

#### Step 2: Configure AWS Credentials
```yaml
- name: Configure AWS credentials
  uses: actions/aws-configure-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
```
**Purpose:** Authenticates the GitHub Actions runner with AWS services.  
**Action Used:** AWS official credential configuration action  
**Security Notes:**
- Credentials are stored as encrypted GitHub secrets
- Never hardcode credentials in workflow files
- Use IAM users with minimal required permissions
- Rotate credentials regularly

#### Step 3: Login to Amazon ECR
```yaml
- name: Login to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2
```
**Purpose:** Authenticates Docker client with Amazon ECR to enable image pushing.  
**Output:** Registry URL (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com`)  
**Process:**
- Obtains authorization token from ECR
- Configures Docker client with token
- Token is valid for 12 hours

#### Step 4: Build, Tag, and Push Image
```yaml
- name: Build, tag, and push image to Amazon ECR
  id: build-image
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    ECR_REPOSITORY: ${{ env.ECR_REPOSITORY_BACKEND }}
    IMAGE_TAG: ${{ env.IMAGE_TAG }}
  run: |
    docker build -f Dockerfile.backend-only -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    echo "image-uri=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
```
**Build Process:**
1.  **Docker Build:** Constructs image using `Dockerfile.backend-only`
    *   `-f` flag specifies the Dockerfile location
    *   `-t` flag tags the image with full ECR path and commit SHA
    *   `.` indicates current directory as build context
2.  **Image Tagging:** Creates additional `latest` tag pointing to the same image
    *   Enables easy reference to most recent build
    *   Both tags point to identical image layers
3.  **Image Push:** Uploads both tagged versions to ECR
    *   SHA tag for version-specific deployments
    *   Latest tag for simplified development workflows
4.  **Output Generation:** Stores image URI for deployment job
    *   Image URI Format: `[account-id].dkr.ecr.[region].amazonaws.com/[repository]:[tag]`

#### Step 5: Output Image URI
```yaml
- name: Image URI
  id: image-uri
  run: echo "uri=${{ steps.build-image.outputs.image-uri }}" >> $GITHUB_OUTPUT
```
**Purpose:** Makes image URI available to dependent jobs through job outputs.

---

## 6. Job 2: Deploy to ECS

### 6.1 Job Configuration
```yaml
deploy-to-ecs:
  name: Deploy to ECS
  runs-on: ubuntu-latest
  needs: build-and-push
  environment: ${{ github.event.inputs.environment || 'development' }}
```
**Dependencies:** Requires successful completion of `build-and-push` job  
**Environment:** Uses GitHub environment feature for protection rules  
**Default Environment:** Development (when triggered automatically)

### 6.2 Deployment Steps

#### Step 1: Checkout Code
Same as Job 1 - ensures workflow has access to configuration files.

#### Step 2: Configure AWS Credentials
Same as Job 1 - authenticates with AWS for infrastructure operations.

#### Step 3: Get Existing RDS Endpoint
```yaml
- name: Get Existing RDS Endpoint
  id: get-rds-endpoint
  run: |
    RDS_ENDPOINT=$(aws rds describe-db-instances \
      --db-instance-identifier njs-database \
      --query 'DBInstances[0].Endpoint.Address' \
      --output text 2>/dev/null || echo "localhost")
    echo "endpoint=$RDS_ENDPOINT" >> $GITHUB_OUTPUT
```
**Purpose:** Retrieves the endpoint address of the RDS database instance.  
**Process:**
- Queries AWS RDS for instance named `njs-database`
- Extracts endpoint address using JMESPath query
- Falls back to `localhost` if database doesn't exist (should fail in production)

> **Note:** The fallback value would cause connection failures. In production, this step should fail explicitly if the database is missing.

#### Step 4: Create CloudWatch Log Group
```yaml
- name: Create CloudWatch Log Group
  run: |
    aws logs create-log-group \
      --log-group-name /ecs/njs-multitenant-backend \
      --region ${{ env.AWS_REGION }} || echo "Log group already exists"
```
**Purpose:** Ensures CloudWatch log group exists before containers attempt to write logs.  
**Behavior:**
- Creates log group if it doesn't exist
- Succeeds silently if log group already exists
- Log group name: `/ecs/njs-multitenant-backend`

#### Step 5: Create ECS Task Definition
```yaml
- name: Create ECS Task Definition
  id: task-def
  run: |
    cat > task-definition.json <<EOF
    [JSON content]
    EOF
```
**Purpose:** Dynamically generates a JSON task definition describing how to run the container.

**Task Definition Components:**

1.  **Task-Level Configuration:**
    ```json
    {
      "family": "njs-multitenant-backend-task",
      "networkMode": "awsvpc",
      "requiresCompatibilities": ["FARGATE"],
      "cpu": "512",
      "memory": "1024",
      "executionRoleArn": "arn:aws:iam::[account]:role/ecsTaskExecutionRole"
    }
    ```
    *   **Family:** Task definition name/grouping
    *   **Network Mode:** `awsvpc` gives each task its own elastic network interface
    *   **Compatibility:** Requires Fargate (serverless container execution)
    *   **CPU:** 512 units = 0.5 vCPU
    *   **Memory:** 1024 MB = 1 GB
    *   **Execution Role:** IAM role for ECS to pull images and write logs

2.  **Container Definition:**
    ```json
    {
      "name": "njs-multitenant-backend",
      "image": "[image-uri-from-build-job]",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ]
    }
    ```
    *   **Container Name:** Must match load balancer configuration
    *   **Image:** Uses output from build job
    *   **Port Mapping:** Exposes port 8080 for HTTP traffic

3.  **Environment Variables:**
    ```json
    "environment": [
      {
        "name": "ASPNETCORE_ENVIRONMENT",
        "value": "Development"
      },
      {
        "name": "ASPNETCORE_URLS",
        "value": "http://+:8080"
      },
      {
        "name": "ConnectionStrings__AppDbConnection",
        "value": "Server=njs-database...;Database=...;User Id=admin;Password=...;"
      }
    ]
    ```
    *   `ASPNETCORE_ENVIRONMENT`: Configures ASP.NET Core runtime mode
    *   `ASPNETCORE_URLS`: Binds application to port 8080
    *   `ConnectionStrings__AppDbConnection`: Database connection string

    > [!WARNING]
    > **CRITICAL SECURITY ISSUE:** Database credentials are hardcoded in plaintext. This should be replaced with AWS Secrets Manager references in production.

4.  **Logging Configuration:**
    ```json
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/njs-multitenant-backend",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
    ```
    *   **Log Driver:** AWS CloudWatch Logs
    *   **Log Group:** Centralized log location
    *   **Stream Prefix:** Helps organize log streams

#### Step 6: Register ECS Task Definition
```yaml
- name: Register ECS Task Definition
  id: register-task-definition
  run: |
    aws ecs register-task-definition --cli-input-json file://task-definition.json
    TASK_DEF_ARN=$(aws ecs describe-task-definition \
      --task-definition ${{ env.ECS_TASK_DEFINITION_NAME }} \
      --query 'taskDefinition.taskDefinitionArn' \
      --output text)
    echo "task_def_arn=$TASK_DEF_ARN" >> $GITHUB_OUTPUT
```
**Purpose:** Registers the task definition with ECS and captures its ARN.  
**Process:**
- Submits task definition JSON to ECS
- ECS assigns a revision number (increments with each registration)
- Queries for the complete ARN of the registered definition
- Stores ARN for use in service operations

**Task Definition Versioning:**
- Format: `njs-multitenant-backend-task:1`, `njs-multitenant-backend-task:2`, etc.
- Allows rollback to previous versions if needed
- Maintains history of configuration changes

#### Step 7: Create ECS Cluster
```yaml
- name: Create ECS Cluster (if not exists)
  run: |
    if aws ecs describe-clusters --clusters ${{ env.ECS_CLUSTER_NAME }} \
       --region ${{ env.AWS_REGION }} \
       --query 'clusters[0].status' \
       --output text 2>/dev/null | grep -q "ACTIVE"; then
      echo "ECS cluster already exists and is active"
    else
      echo "Creating ECS cluster..."
      aws ecs create-cluster \
        --cluster-name ${{ env.ECS_CLUSTER_NAME }} \
        --region ${{ env.AWS_REGION }}
      echo "ECS cluster created successfully"
    fi
```
**Purpose:** Ensures the ECS cluster exists before creating services.  
**Cluster Function:**
- Logical grouping of ECS services and tasks
- Provides organizational structure
- Enables resource management and capacity planning
- No additional cost (you pay only for running tasks)

**Process:**
- Checks if cluster exists and is active
- Creates cluster if it doesn't exist
- Succeeds silently if cluster already exists

#### Step 8: Get Subnet IDs
```yaml
- name: Get Subnet IDs
  id: get-subnets
  run: |
    echo "subnet-ids=${{ secrets.SUBNET_IDS }}" >> $GITHUB_OUTPUT
```
**Purpose:** Retrieves subnet IDs from GitHub secrets for network configuration.  
**Subnet Requirements:**
- Should span multiple Availability Zones for high availability
- Must have appropriate route tables (internet gateway for public subnets)
- Must be in the same VPC as the load balancer and RDS instance
- Format: Comma-separated list (e.g., `subnet-abc123,subnet-def456`)

#### Step 9: Get ALB Target Group ARN
```yaml
- name: Get ALB Target Group ARN
  id: get-target-group
  run: |
    TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
      --names ${{ env.ALB_TARGET_GROUP }} \
      --query 'TargetGroups[0].TargetGroupArn' \
      --output text \
      --region ${{ env.AWS_REGION }})
    echo "target-group-arn=$TARGET_GROUP_ARN" >> $GITHUB_OUTPUT
```
**Purpose:** Retrieves the ARN of the target group for load balancer integration.  
**Target Group Function:**
- Receives traffic from the Application Load Balancer
- Performs health checks on registered targets
- Routes traffic only to healthy targets
- Must exist before creating the ECS service

> **Prerequisites:** The target group must be created manually or through infrastructure-as-code before running this workflow.

#### Step 10: Create ECS Service
```yaml
- name: Create ECS Service (if not exists)
  run: |
    if ! aws ecs describe-services \
         --cluster ${{ env.ECS_CLUSTER_NAME }} \
         --services ${{ env.ECS_SERVICE_NAME }} \
         --query 'services[0].status' \
         --output text 2>/dev/null | grep -q "ACTIVE"; then
      echo "Creating ECS service..."
      aws ecs create-service \
        --cluster ${{ env.ECS_CLUSTER_NAME }} \
        --service-name ${{ env.ECS_SERVICE_NAME }} \
        --task-definition ${{ env.ECS_TASK_DEFINITION_NAME }} \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${{ steps.get-subnets.outputs.subnet-ids }}],securityGroups=[${{ secrets.NJS_API_ECS_SG }}],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=${{ steps.get-target-group.outputs.target-group-arn }},containerName=njs-multitenant-backend,containerPort=8080" \
        --health-check-grace-period-seconds 300 \
        --region ${{ env.AWS_REGION }}
    else
      echo "ECS service already exists, updating..."
    fi
```
**Purpose:** Creates a new ECS service if it doesn't exist.

**Service Configuration Parameters:**
*   **Desired Count (1):**
    *   Number of task instances to maintain
    *   ECS automatically replaces failed tasks
    *   Can be increased for higher availability and load distribution
*   **Launch Type (FARGATE):**
    *   Serverless container execution
    *   No EC2 instance management required
    *   AWS handles infrastructure provisioning and scaling
*   **Network Configuration:**
    *   Subnets: Where tasks run (should span multiple AZs)
    *   Security Groups: Firewall rules for task network interfaces
    *   Assign Public IP: Enabled to allow internet connectivity
*   **Load Balancer Configuration:**
    *   Target Group ARN: Connects service to load balancer
    *   Container Name: Must match name in task definition
    *   Container Port: Must match port mapping in task definition
*   **Health Check Grace Period (300 seconds):**
    *   Time before load balancer starts health checks
    *   Allows application startup time
    *   Prevents premature unhealthy status

**Service vs. Task:**
- **Task:** Single running container instance
- **Service:** Maintains desired number of tasks, handles load balancing, performs health checks

#### Step 11: Update ECS Service
```yaml
- name: Update ECS Service
  run: |
    aws ecs update-service \
      --cluster ${{ env.ECS_CLUSTER_NAME }} \
      --service ${{ env.ECS_SERVICE_NAME }} \
      --task-definition ${{ env.ECS_TASK_DEFINITION_NAME }} \
      --region ${{ env.AWS_REGION }}
```
**Purpose:** Updates the service to use the newly registered task definition.  
**Update Process:**
- ECS begins rolling deployment
- Starts new task with updated definition
- Waits for new task to pass health checks
- Drains connections from old task
- Stops old task
- Repeats until all tasks are updated

**Deployment Strategy:**
- Rolling update (default)
- Zero-downtime deployment
- Gradual traffic shift from old to new tasks
- Automatic rollback if new tasks fail health checks

#### Step 12: Wait for Service Stability
```yaml
- name: Wait for service to stabilize
  run: |
    aws ecs wait services-stable \
      --cluster ${{ env.ECS_CLUSTER_NAME }} \
      --services ${{ env.ECS_SERVICE_NAME }} \
      --region ${{ env.AWS_REGION }}
```
**Purpose:** Blocks workflow execution until service reaches stable state.  
**Stability Criteria:**
- All desired tasks are running
- All tasks pass health checks
- No tasks in pending or stopping state
- Service meets deployment requirements

**Timeout:** Default 10 minutes (configurable)  
**Failure Scenarios:**
- Tasks fail to start
- Tasks fail health checks
- Resource constraints prevent task placement
- Network configuration issues

#### Step 13: Get ALB DNS Name
```yaml
- name: Get ALB DNS Name
  id: get-alb-dns
  run: |
    ALB_DNS=$(aws elbv2 describe-load-balancers \
      --names njs-multitenant-alb \
      --query 'LoadBalancers[0].DNSName' \
      --output text \
      --region ${{ env.AWS_REGION }})
    echo "alb-dns=$ALB_DNS" >> $GITHUB_OUTPUT
```
**Purpose:** Retrieves the public DNS endpoint for accessing the deployed application.  
**DNS Format:** `njs-multitenant-alb-1234567890.us-east-1.elb.amazonaws.com`  
**Usage:**
- This is the public endpoint for API access
- Should be configured in DNS for custom domain
- Used for health check verification

#### Step 14: Test API Health Check
```yaml
- name: Test API Health Check
  run: |
    echo "Testing API health check..."
    sleep 30
    curl -f http://${{ steps.get-alb-dns.outputs.alb-dns }}/health || echo "Health check failed, but deployment completed"
```
**Purpose:** Verifies the deployed application is responding to requests.  
**Process:**
- Waits 30 seconds for service to be fully operational
- Makes HTTP request to `/health` endpoint
- `-f` flag causes curl to fail on HTTP errors
- Continues even if health check fails

> **Note:** This is a soft verification. The deployment is considered successful even if the health check fails, as the ECS service has stabilized.

---

## 7. Job 3: Deployment Summary

### 7.1 Purpose
Generates a human-readable markdown summary displayed in the GitHub Actions interface, providing at-a-glance deployment information and next steps.

### 7.2 Summary Generation
```yaml
deployment-summary:
  name: Deployment Summary
  runs-on: ubuntu-latest
  needs: [build-and-push, deploy-to-ecs]
  if: always()
```
**Execution Condition:** `if: always()` ensures the summary runs even if previous jobs fail.

### 7.3 Summary Content
The summary includes multiple sections:
1.  **Deployment Status:**
    *   Success indicator (🟢) or failure indicator (🔴)
    *   Clear success/failure message
    *   Based on `deploy-to-ecs` job result
2.  **Deployment Details:**
    *   Environment deployed to
    *   Git branch
    *   Commit SHA
    *   Container image URI
    *   ECS cluster and service names
3.  **Testing Information:**
    *   Health check endpoint
    *   Swagger UI URL
    *   API base URL
    *   Example curl commands
4.  **Next Steps:**
    *   Test API endpoints
    *   Verify multi-tenant functionality
    *   Set up custom domain (optional)
    *   Configure SSL certificate (optional)

### 7.4 Summary Location
The summary appears in three places:
1.  GitHub Actions workflow run page
2.  Pull request checks (if triggered by PR)
3.  GitHub Actions dashboard

---

## 8. AWS Infrastructure Components

### 8.1 Amazon ECS (Elastic Container Service)
**Function:** Container orchestration service that manages running Docker containers.  
**Key Features:**
- Automated container placement and scaling
- Integration with AWS services (ALB, CloudWatch, ECR)
- Support for Fargate (serverless) and EC2 launch types
- Service discovery and load balancing
- Rolling updates and blue/green deployments

**Cost Model:** No charge for ECS itself. Pay for underlying resources (Fargate tasks, EC2 instances, data transfer).

### 8.2 AWS Fargate
**Function:** Serverless compute engine for containers.  
**Benefits:**
- No server management required
- Automatic scaling
- Pay only for resources used (per second billing)
- Built-in security isolation
- Eliminates capacity planning

**Pricing:** Based on vCPU and memory allocated to tasks.  
**Use Cases:**
- Variable or unpredictable workloads
- Small to medium applications
- Development and testing environments
- When operational simplicity is priority

### 8.3 Amazon ECR (Elastic Container Registry)
**Function:** Private Docker container registry integrated with AWS.  
**Features:**
- Secure, encrypted image storage
- Image vulnerability scanning
- Lifecycle policies for image management
- Cross-region replication
- Integration with CI/CD pipelines

**Image Management:**
- Supports multiple image tags per repository
- Immutable tags prevent overwriting
- Automatic cleanup of old images

### 8.4 Application Load Balancer (ALB)
**Function:** Layer 7 (HTTP/HTTPS) load balancer that distributes traffic across multiple targets.  
**Capabilities:**
- Path-based routing (e.g., `/api/*` to one service, `/admin/*` to another)
- Host-based routing (multiple domains)
- SSL/TLS termination
- WebSocket support
- Health checks with custom endpoints
- Integration with AWS WAF for security

**Target Groups:**
- Group of targets (ECS tasks, EC2 instances, IP addresses)
- Perform health checks
- Route traffic only to healthy targets
- Support multiple target groups per load balancer

### 8.5 Amazon RDS (Relational Database Service)
**Function:** Managed relational database service.  
**Benefits:**
- Automated backups
- Automated patching
- Multi-AZ deployments for high availability
- Read replicas for scaling
- Point-in-time recovery

**Database Connection:**
- Tasks connect using endpoint address
- Should use RDS security group to restrict access
- Connection string includes credentials (should be in Secrets Manager)

### 8.6 Amazon CloudWatch Logs
**Function:** Centralized logging service for AWS resources.  
**Log Organization:**
- **Log Groups:** High-level container (e.g., `/ecs/njs-multitenant-backend`)
- **Log Streams:** Individual task logs within a group
- **Log Events:** Individual log entries with timestamp

**Features:**
- Real-time log streaming
- Log retention policies
- Metric filters and alarms
- Export to S3 for long-term storage
- Integration with CloudWatch Insights for querying

### 8.7 Amazon VPC (Virtual Private Cloud)
**Function:** Isolated virtual network for AWS resources.  
**Components Used:**
- **Subnets:** Network segments where tasks run
- **Security Groups:** Stateful firewalls for network interfaces
- **Route Tables:** Control traffic routing
- **Internet Gateway:** Enables internet connectivity

**Network Architecture:**
Internet → ALB (Public Subnet) → ECS Tasks (Private/Public Subnet) → RDS (Private Subnet)

---

## 9. Security Considerations

### 9.1 Critical Security Issues

**Issue 1: Hardcoded Database Credentials**
*   **Current Implementation:**
    ```yaml
    "ConnectionStrings__AppDbConnection": "Server=...;Password=NJS-Backend-2025!;..."
    ```
*   **Risk:** Credentials exposed in workflow file, Git history, and CloudWatch logs.
*   **Recommended Solution:**
    ```json
    "secrets": [
      {
        "name": "ConnectionStrings__AppDbConnection",
        "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:db-credentials"
      }
    ]
    ```
*   **Implementation Steps:**
    1.  Store connection string in AWS Secrets Manager
    2.  Grant `ecsTaskExecutionRole` permission to read the secret
    3.  Reference secret ARN in task definition
    4.  ECS injects secret as environment variable at runtime

### 9.2 IAM Role Security
**`ecsTaskExecutionRole` Requirements:**
Minimum permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/ecs/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:db-credentials-*"
    }
  ]
}
```

### 9.3 Security Group Configuration
*   **ECS Task Security Group:**
    *   Inbound: Port 8080 from ALB security group only
    *   Outbound: Port 443 (HTTPS) for AWS API calls
    *   Outbound: Database port (3306/5432) to RDS security group
*   **RDS Security Group:**
    *   Inbound: Database port from ECS task security group only
    *   Outbound: None required
*   **ALB Security Group:**
    *   Inbound: Ports 80 and 443 from 0.0.0.0/0 (public internet)
    *   Outbound: Port 8080 to ECS task security group

### 9.4 Network Security
**Best Practices:**
- Place RDS in private subnets (no internet access)
- Use private subnets for ECS tasks when possible
- Enable VPC Flow Logs for network monitoring
- Use Network ACLs for additional subnet-level security
- Implement AWS WAF rules on ALB for application-level protection

### 9.5 Container Security
*   **Image Scanning:**
    *   Enable ECR image scanning for vulnerabilities
    *   Set up policies to block deployment of images with critical vulnerabilities
    *   Regularly update base images
*   **Runtime Security:**
    *   Run containers as non-root user
    *   Use read-only root filesystems where possible
    *   Minimize attack surface by including only necessary dependencies
    *   Implement resource limits to prevent resource exhaustion

### 9.6 Secrets Management
*   **Current Issues:**
    *   AWS credentials in GitHub secrets (necessary but manage carefully)
    *   Database password in workflow file (critical security risk)
*   **Recommendations:**
    *   Use AWS Secrets Manager or Systems Manager Parameter Store
    *   Implement automatic secret rotation
    *   Use IAM roles for service-to-service authentication when possible
    *   Audit secret access through CloudTrail
    *   Implement least-privilege access to secrets

### 9.7 Logging and Monitoring
*   **Security Logging:**
    *   Enable CloudTrail for API call auditing
    *   Enable VPC Flow Logs for network traffic analysis
    *   Enable ALB access logs
    *   Enable ECS Container Insights
    *   Set up CloudWatch alarms for suspicious activity
*   **Log Retention:**
    *   Define appropriate retention policies
    *   Export sensitive logs to S3 with encryption
    *   Implement log analysis for security events

---

## 10. Best Practices and Recommendations

### 10.1 Infrastructure as Code
**Current State:** Infrastructure is created manually or through workflow commands.  
**Recommendation:** Use infrastructure-as-code tools for better management.

**Terraform Example:**
```hcl
resource "aws_ecs_cluster" "main" {
  name = "njs-multitenant-backend-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_service" "backend" {
  name            = "njs-multitenant-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"
  
  # Additional configuration...
}
```
**Benefits:**
- Version-controlled infrastructure
- Reproducible environments
- Easier disaster recovery
- Clear documentation of infrastructure state

### 10.2 Environment Management
**Current State:** Single workflow with conditional logic for environments.  
**Recommendation:** Separate workflows or use environment-specific configuration files.

**Approach 1: Separate Workflows**
- `deploy-dev.yml` for development
- `deploy-staging.yml` for staging
- `deploy-prod.yml` for production

**Approach 2: Environment Configuration Files**
```
config/
  ├── development.json
  ├── staging.json
  └── production.json
```
Load appropriate config based on environment input.

### 10.3 Deployment Strategies
**Current Strategy:** Rolling update with single task.  
**Recommendations for Production:**

*   **Blue/Green Deployment:**
    *   Deploy to new task set (green)
    *   Test thoroughly
    *   Switch traffic from old (blue) to new (green)
    *   Keep blue running for quick rollback
*   **Canary Deployment:**
    *   Deploy to small percentage of traffic (10%)
    *   Monitor metrics and errors
    *   Gradually increase traffic to new version
    *   Rollback if issues detected

**Implementation with ECS:**
```yaml
deployment_configuration {
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
  
  deployment_controller {
    type = "CODE_DEPLOY"  # Enables blue/green deployments
  }
}
```

### 10.4 Monitoring and Observability
**Essential Metrics:**
- Container CPU and memory utilization
- Task count and health status
- ALB request count and latency
- ALB 4xx and 5xx error rates
- Database connection pool metrics
- Application-specific business metrics

**Recommended Tools:**
- CloudWatch Container Insights
- CloudWatch Application Insights
- AWS X-Ray for distributed tracing
- Third-party APM tools (New Relic, Datadog, Dynatrace)

**Alerting:**
```yaml
# Example CloudWatch alarm
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "ecs-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "80"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

### 10.5 Testing Strategy
**Pre-Deployment Testing:**
- Unit tests in CI pipeline
- Integration tests against test database
- Container vulnerability scanning
- Security scanning (SAST/DAST)

**Post-Deployment Testing:**
```yaml
- name: Integration Tests
  run: |
    # Wait for deployment
    sleep 60
    
    # Run API tests
    npm run test:integration -- --baseUrl=http://${{ steps.get-alb-dns.outputs.alb-dns }}
    
    # Run smoke tests
    ./scripts/smoke-tests.sh ${{ steps.get-alb-dns.outputs.alb-dns }}
```

**Automated Rollback:**
```yaml
- name: Check Deployment Health
  run: |
    # Check CloudWatch metrics
    ERROR_RATE=$(aws cloudwatch get-metric-statistics \
      --namespace AWS/ApplicationELB \
      --metric-name HTTPCode_Target_5XX_Count \
      --dimensions Name=LoadBalancer,Value=app/njs-multitenant-alb/... \
      --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \
      --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
      --period 300 \
      --statistics Sum \
      --query 'Datapoints[0].Sum' \
      --output text)
    
    if [ "$ERROR_RATE" -gt "10" ]; then
      echo "High error rate detected, rolling back..."
      aws ecs update-service \
        --cluster ${{ env.ECS_CLUSTER_NAME }} \
        --service ${{ env.ECS_SERVICE_NAME }} \
        --task-definition ${{ env.PREVIOUS_TASK_DEFINITION }}
      exit 1
    fi
```

### 10.6 Scaling Configuration
**Auto Scaling for ECS:**
```yaml
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

### 10.7 Cost Optimization
**Recommendations:**

1.  **Right-size Tasks:**
    *   Monitor actual CPU/memory usage
    *   Adjust task definition resources accordingly
    *   Use Fargate Spot for non-critical workloads
2.  **Optimize Container Images:**
    *   Use multi-stage builds
    *   Minimize image layers
    *   Remove unnecessary dependencies
3.  **Implement Lifecycle Policies:**
    ```json
    {
      "rules": [{
        "rulePriority": 1,
        "description": "Expire old images",
        "selection": {
          "tagStatus": "untagged",
          "countType": "sinceImagePushed",
          "countUnit": "days",
          "countNumber": 14
        },
        "action": {
          "type": "expire"
        }
      }]
    }
    ```
4.  **Use Reserved Capacity:**
    *   Purchase Savings Plans for predictable workloads
    *   Consider EC2 launch type with Reserved Instances for stable loads
5.  **Monitor Costs:**
    *   Enable AWS Cost Explorer
    *   Set up billing alerts
    *   Tag resources for cost allocation

### 10.8 Disaster Recovery
**Backup Strategy:**
- Automated RDS snapshots (daily)
- Cross-region snapshot copies
- ECR cross-region replication
- Infrastructure-as-code in version control

**Recovery Procedures:**
- Document manual recovery steps
- Test recovery procedures regularly
- Implement multi-region deployment for critical systems
- Define RTO (Recovery Time Objective) and RPO (Recovery Point Objective)

**Multi-Region Deployment:**
```yaml
# Deploy to multiple regions
regions:
  - us-east-1
  - us-west-2

# Use Route 53 for failover
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"

  failover_routing_policy {
    type = "PRIMARY"
  }

  alias {
    name                   = aws_lb.us_east_1.dns_name
    zone_id                = aws_lb.us_east_1.zone_id
    evaluate_target_health = true
  }
}
```

---

## 11. Troubleshooting Guide

### 11.1 Common Issues and Solutions

**Issue: Docker Build Fails**
*   **Symptoms:** Build step fails, Dockerfile syntax errors, missing dependencies.
*   **Diagnosis:**
    ```bash
    # Test build locally
    docker build -f Dockerfile.backend-only -t test .

    # Check build logs
    docker build --no-cache -f Dockerfile.backend-only -t test .
    ```
*   **Solutions:**
    *   Verify Dockerfile syntax
    *   Check that all referenced files exist
    *   Ensure base image is accessible
    *   Clear Docker cache if using outdated layers

**Issue: ECR Push Fails**
*   **Symptoms:** Authentication errors, permission denied, image too large.
*   **Diagnosis:**
    ```bash
    # Check ECR login
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account].dkr.ecr.us-east-1.amazonaws.com

    # Verify repository exists
    aws ecr describe-repositories --repository-names njs-multitenant-backend
    ```
*   **Solutions:**
    *   Verify AWS credentials are correct
    *   Check IAM permissions for ECR operations
    *   Ensure repository exists in correct region
    *   Check image size (Fargate has limits)

**Issue: Task Fails to Start**
*   **Symptoms:** Tasks in PENDING state, tasks immediately transition to STOPPED, "CannotPullContainerError".
*   **Diagnosis:**
    ```bash
    # Check task stopped reason
    aws ecs describe-tasks --cluster njs-multitenant-backend-cluster --tasks [task-id] --query 'tasks[0].stoppedReason'

    # Check CloudWatch logs
    aws logs get-log-events --log-group-name /ecs/njs-multitenant-backend --log-stream-name [stream-name]
    ```
*   **Common Causes & Solutions:**
    *   **Image Pull Errors:** Verify task execution role has ECR permissions, check image exists in ECR, verify image tag.
    *   **Resource Constraints:** Check subnet IPs, verify CPU/memory allocation, ensure security group rules.
    *   **Application Errors:** Check environment variables, verify database connection string, check app logs.

**Issue: Tasks Start but Fail Health Checks**
*   **Symptoms:** Tasks running but marked unhealthy, load balancer removes tasks, 503 errors.
*   **Diagnosis:**
    ```bash
    # Check target health
    aws elbv2 describe-target-health --target-group-arn [arn]

    # Check application logs
    aws logs tail /ecs/njs-multitenant-backend --follow

    # Test health endpoint directly
    curl -v http://[task-ip]:8080/health
    ```
*   **Solutions:**
    *   Verify health check endpoint exists and returns 200
    *   Increase health check grace period
    *   Check application startup time
    *   Verify port mapping is correct
    *   Ensure security group allows ALB to reach tasks

**Issue: Database Connection Fails**
*   **Symptoms:** "Cannot connect to database" errors, timeout errors, authentication failures.
*   **Diagnosis:**
    ```bash
    # Test database connectivity from task
    aws ecs execute-command --cluster njs-multitenant-backend-cluster \
      --task [task-id] \
      --container njs-multitenant-backend \
      --interactive \
      --command "/bin/sh"

    # Inside container:
    telnet njs-database.cxe40c86capb.us-east-1.rds.amazonaws.com 3306
    ```
*   **Solutions:**
    *   Verify RDS security group allows traffic from ECS security group
    *   Check connection string format
    *   Verify database credentials
    *   Ensure database is in same VPC as ECS tasks
    *   Check RDS is in available state

**Issue: Service Won't Stabilize**
*   **Symptoms:** "Wait for service stability" step times out, tasks keep restarting, rolling deployment never completes.
*   **Diagnosis:**
    ```bash
    # Check service events
    aws ecs describe-services --cluster njs-multitenant-backend-cluster \
      --services njs-multitenant-backend-service \
      --query 'services[0].events[0:10]'

    # Check deployment status
    aws ecs describe-services --cluster njs-multitenant-backend-cluster \
      --services njs-multitenant-backend-service \
      --query 'services[0].deployments'
    ```
*   **Solutions:**
    *   Check CloudWatch logs for application errors
    *   Verify new task definition is valid
    *   Ensure resource allocation is sufficient
    *   Check for circular deployment issues
    *   Manually force new deployment if stuck

### 11.2 Debugging Workflow Failures

**Enable Debug Logging**
Add to workflow file:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

**Check GitHub Actions Logs**
1.  Navigate to Actions tab in repository
2.  Select failed workflow run
3.  Click on failed job
4.  Expand failed step
5.  Review detailed logs

**Test AWS Commands Locally**
```bash
# Configure AWS CLI
aws configure

# Test commands from workflow
aws ecs describe-clusters --clusters njs-multitenant-backend-cluster

# Use --debug flag for detailed output
aws ecs describe-services --cluster njs-multitenant-backend-cluster \
  --services njs-multitenant-backend-service --debug
```

### 11.3 Monitoring and Alerts

**Essential CloudWatch Alarms:**
```yaml
# High CPU utilization
CPUUtilizationAlarm:
  Threshold: 80%
  EvaluationPeriods: 2
  Actions: [SNS notification]

# High memory utilization
MemoryUtilizationAlarm:
  Threshold: 80%
  EvaluationPeriods: 2
  Actions: [SNS notification]

# Unhealthy targets
UnhealthyTargetAlarm:
  Threshold: 1
  EvaluationPeriods: 1
  Actions: [SNS notification, Lambda auto-remediation]

# 5xx errors
High5xxErrorsAlarm:
  Threshold: 10 errors in 5 minutes
  EvaluationPeriods: 1
  Actions: [SNS notification]
```

**Log Insights Queries:**
```sql
-- Find errors in logs
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20

-- Analyze response times
fields @timestamp, @message
| filter @message like /Request completed/
| parse @message "completed in * ms" as duration
| stats avg(duration), max(duration), min(duration) by bin(5m)

-- Count requests by endpoint
fields @timestamp, @message
| filter @message like /Request starting/
| parse @message "Request starting * * *" as method, path, protocol
| stats count() by path
```

---

## 12. Appendix

### 12.1 Glossary
*   **ALB (Application Load Balancer):** Layer 7 load balancer that routes HTTP/HTTPS traffic based on content.
*   **ARN (Amazon Resource Name):** Unique identifier for resources.
*   **Cluster:** Logical grouping of ECS services and tasks.
*   **Container:** Lightweight, standalone executable package that includes application code and dependencies.
*   **ECR (Elastic Container Registry):** AWS Docker container registry service.
*   **ECS (Elastic Container Service):** AWS container orchestration service.
*   **Fargate:** Serverless compute engine for containers that eliminates server management.
*   **Health Check:** Automated test to verify service availability and functionality.
*   **IAM (Identity and Access Management):** AWS service for managing access to resources.
*   **RDS (Relational Database Service):** Managed database service supporting multiple database engines.
*   **Security Group:** Virtual firewall that controls inbound and outbound traffic.
*   **Service:** ECS configuration that maintains a specified number of running tasks.
*   **Subnet:** Segment of a VPC's IP address range where resources are placed.
*   **Target Group:** Group of targets (tasks, instances) that receive load balancer traffic.
*   **Task:** Single running instance of a task definition.
*   **Task Definition:** Blueprint describing how to run a Docker container.
*   **VPC (Virtual Private Cloud):** Isolated virtual network within AWS.

### 12.2 Required IAM Permissions
**GitHub Actions User/Role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:RegisterTaskDefinition",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeClusters",
        "ecs:CreateCluster",
        "ecs:DescribeServices",
        "ecs:CreateService",
        "ecs:UpdateService"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::*:role/ecsTaskExecutionRole"
    },
    {
      "Effect": "Allow",
      "Action": [
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeTargetHealth"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DescribeLogGroups"
      ],
      "Resource": "*"
    }
  ]
}
```

### 12.3 Network Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      VPC                                  │   │
│  │                                                           │   │
│  │  ┌──────────────┐         ┌──────────────┐             │   │
│  │  │ Public Subnet│         │ Public Subnet│             │   │
│  │  │   (AZ-1)     │         │   (AZ-2)     │             │   │
│  │  │              │         │              │             │   │
│  │  │    ┌─────┐   │         │   ┌─────┐    │             │   │
│  │  │    │ ALB │◄──┼─────────┼───┤ ALB │    │             │   │
│  │  │    └──┬──┘   │         │   └──┬──┘    │             │   │
│  │  └───────┼──────┘         └──────┼───────┘             │   │
│  │          │                       │                       │   │
│  │          ▼                       ▼                       │   │
│  │  ┌──────────────┐         ┌──────────────┐             │   │
│  │  │Private Subnet│         │Private Subnet│             │   │
│  │  │   (AZ-1)     │         │   (AZ-2)     │             │   │
│  │  │              │         │              │             │   │
│  │  │  ┌────────┐  │         │  ┌────────┐  │             │   │
│  │  │  │ECS Task│  │         │  │ECS Task│  │             │   │
│  │  │  └───┬────┘  │         │  └───┬────┘  │             │   │
│  │  └──────┼───────┘         └──────┼───────┘             │   │
│  │         │                        │                       │   │
│  │         └────────┬───────────────┘                       │   │
│  │                  │                                       │   │
│  │                  ▼                                       │   │
│  │          ┌──────────────┐                               │   │
│  │          │Private Subnet│                               │   │
│  │          │  (Database)  │                               │   │
│  │          │              │                               │   │
│  │          │  ┌────────┐  │                               │   │
│  │          │  │  RDS   │  │                               │   │
│  │          │  └────────┘  │                               │   │
│  │          └──────────────┘                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                         Internet Users
```

### 12.4 Resource Tagging Strategy
**Recommended Tags:**
```yaml
tags:
  Environment: development|staging|production
  Project: njs-multitenant-backend
  ManagedBy: terraform|github-actions
  CostCenter: engineering
  Owner: platform-team
  Application: backend-api
  Version: v1.0.0
```

**Implementation in Task Definition:**
```json
{
  "tags": [
    {"key": "Environment", "value": "development"},
    {"key": "Project", "value": "njs-multitenant-backend"},
    {"key": "ManagedBy", "value": "github-actions"}
  ]
}
```

### 12.5 Useful AWS CLI Commands

**ECS Operations:**
```bash
# List clusters
aws ecs list-clusters

# Describe service
aws ecs describe-services --cluster [cluster] --services [service]

# List tasks
aws ecs list-tasks --cluster [cluster] --service-name [service]

# View task logs
aws logs tail /ecs/njs-multitenant-backend --follow

# Execute command in running task
aws ecs execute-command --cluster [cluster] --task [task-id] \
  --container [container-name] --interactive --command "/bin/sh"

# Stop task (force restart)
aws ecs stop-task --cluster [cluster] --task [task-id]

# Update service (force new deployment)
aws ecs update-service --cluster [cluster] --service [service] --force-new-deployment
```

**ECR Operations:**
```bash
# List repositories
aws ecr describe-repositories

# List images
aws ecr list-images --repository-name njs-multitenant-backend

# Get image details
aws ecr describe-images --repository-name njs-multitenant-backend

# Delete image
aws ecr batch-delete-image --repository-name njs-multitenant-backend \
  --image-ids imageTag=old-tag
```

**Load Balancer Operations:**
```bash
# Describe load balancer
aws elbv2 describe-load-balancers --names njs-multitenant-alb

# List target groups
aws elbv2 describe-target-groups

# Check target health
aws elbv2 describe-target-health --target-group-arn [arn]
```

**RDS Operations:**
```bash
# Describe database
aws rds describe-db-instances --db-instance-identifier njs-database

# Get endpoint
aws rds describe-db-instances --db-instance-identifier njs-database \
  --query 'DBInstances[0].Endpoint.Address' --output text
```

### 12.6 Additional Resources
*   **AWS Documentation:**
    *   [ECS Documentation](https://docs.aws.amazon.com/ecs/)
    *   [Fargate Documentation](https://docs.aws.amazon.com/AmazonECS/latest/userguide/what-is-fargate.html)
    *   [ECR Documentation](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html)
    *   [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
*   **GitHub Actions:**
    *   [GitHub Actions Documentation](https://docs.github.com/en/actions)
    *   [AWS Actions](https://github.com/aws-actions)
*   **Best Practices:**
    *   [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
    *   [ECS Best Practice](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
    *   Container Security Best Practices

### 12.7 Change Log
| Version | Date | Changes | Author |
| :--- | :--- | :--- | :--- |
| **1.0** | Jan 2026 | Initial documentation creation | DevOps Team |

### 12.8 Document Review Schedule
This document should be reviewed and updated:
- After any significant workflow changes
- Quarterly for general updates
- When AWS service features change
- Based on feedback from users

---
**END OF DOCUMENT**
