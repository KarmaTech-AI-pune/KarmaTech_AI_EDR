# EDR Complete Deployment Guide

## Table of Contents

1. [AWS Deployment (Recommended)](#aws-deployment)
2. [Windows IIS Deployment](#windows-iis-deployment)
3. [Database Setup](#database-setup)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Procedures](#rollback-procedures)

---

## AWS Deployment

### Overview

The AWS deployment uses a **fork-and-sync workflow** with GitHub Actions for automated CI/CD.

**Architecture:**
- **Frontend:** AWS S3 + CloudFront (CDN)
- **Backend:** AWS Elastic Beanstalk (.NET Core 8.0)
- **Database:** AWS RDS (SQL Server) + MongoDB Atlas
- **CI/CD:** GitHub Actions

### Prerequisites

1. **AWS Account** with the following services enabled:
   - S3 (for frontend hosting)
   - CloudFront (for CDN)
   - Elastic Beanstalk (for backend)
   - RDS (for SQL Server database)
   - IAM (for access management)

2. **GitHub Repository** (fork of EDR)

3. **Required Tools:**
   - Git
   - AWS CLI (optional, for manual operations)

### Step 1: Fork Repository

```bash
# Fork the EDR repository on GitHub
# Navigate to: https://github.com/[original-repo]/EDR
# Click "Fork" button
```

### Step 2: Configure GitHub Secrets

Navigate to your forked repository → Settings → Secrets and variables → Actions

Add the following secrets:

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=edr-frontend-bucket
AWS_CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id
AWS_EB_APPLICATION_NAME=edr-backend
AWS_EB_ENVIRONMENT_NAME=edr-backend-prod
DATABASE_CONNECTION_STRING=Server=your-rds-endpoint;Database=KarmaTechAI_SAAS;User Id=admin;Password=your_password;
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/edr
JWT_SECRET=your_jwt_secret_key
```

### Step 3: Set Up AWS Infrastructure

#### 3.1 Create S3 Bucket for Frontend

```bash
aws s3 mb s3://edr-frontend-bucket --region us-east-1
aws s3 website s3://edr-frontend-bucket --index-document index.html --error-document index.html
```

#### 3.2 Create CloudFront Distribution

```bash
# Via AWS Console:
# 1. Navigate to CloudFront
# 2. Create Distribution
# 3. Origin: S3 bucket (edr-frontend-bucket)
# 4. Enable HTTPS
# 5. Note the Distribution ID
```

#### 3.3 Create RDS SQL Server Instance

```bash
# Via AWS Console:
# 1. Navigate to RDS
# 2. Create Database
# 3. Engine: Microsoft SQL Server
# 4. Template: Production
# 5. DB Instance: db.t3.medium (or larger)
# 6. Storage: 100 GB (auto-scaling enabled)
# 7. Note the endpoint
```

#### 3.4 Create Elastic Beanstalk Application

```bash
# Via AWS Console:
# 1. Navigate to Elastic Beanstalk
# 2. Create Application
# 3. Platform: .NET Core on Linux
# 4. Application name: edr-backend
# 5. Environment name: edr-backend-prod
```

### Step 4: Deploy via GitHub Actions

```bash
# Push to main branch to trigger deployment
git add .
git commit -m "Deploy to AWS"
git push origin main

# GitHub Actions will automatically:
# 1. Build frontend (React + Vite)
# 2. Deploy frontend to S3
# 3. Invalidate CloudFront cache
# 4. Build backend (.NET Core 8.0)
# 5. Deploy backend to Elastic Beanstalk
# 6. Run database migrations
```

### Step 5: Monitor Deployment

```bash
# Check GitHub Actions
# Navigate to: Actions tab in your repository

# Check AWS CloudWatch Logs
aws logs tail /aws/elasticbeanstalk/edr-backend-prod/var/log/web.stdout.log --follow
```

### Step 6: Verify Deployment

```bash
# Test frontend
curl https://your-cloudfront-domain.cloudfront.net

# Test backend API
curl https://your-eb-environment.elasticbeanstalk.com/api/health

# Test database connection
# Login to application and verify data loads
```

---

## Windows IIS Deployment

### Overview

Traditional Windows Server deployment using IIS for hosting both frontend and backend.

**Architecture:**
- **Frontend:** IIS Static Website
- **Backend:** IIS Application Pool (.NET Core 8.0)
- **Database:** On-premise SQL Server

### Prerequisites

1. **Windows Server 2019+** with IIS installed
2. **SQL Server 2019+** (Express, Standard, or Enterprise)
3. **Node.js 18+** and **npm**
4. **.NET 8.0 SDK** and **Runtime**
5. **PowerShell 5.1+**
6. **Git** (optional, for cloning repository)

### Step 1: Prepare Server

```powershell
# Install IIS
Install-WindowsFeature -Name Web-Server -IncludeManagementTools

# Install .NET 8.0 Hosting Bundle
# Download from: https://dotnet.microsoft.com/download/dotnet/8.0
# Run installer: dotnet-hosting-8.0.x-win.exe

# Install Node.js
# Download from: https://nodejs.org/
# Run installer: node-v18.x.x-x64.msi

# Restart IIS
iisreset
```

### Step 2: Clone Repository

```powershell
# Clone repository
cd C:\inetpub
git clone https://github.com/your-org/EDR.git
cd EDR
```

### Step 3: Configure Database

```powershell
# Update connection strings in appsettings.json
cd backend\src\NJS.API

# Edit appsettings.Production.json
notepad appsettings.Production.json

# Update:
# - ConnectionStrings:DefaultConnection
# - ConnectionStrings:MongoDb
# - JwtSettings:SecretKey
```

### Step 4: Run Deployment Script

```powershell
# Navigate to deployment scripts
cd C:\inetpub\EDR\deployment\scripts

# Run deployment script
.\Deploy-EDR.ps1

# The script will:
# 1. Run pre-deployment checks
# 2. Backup existing database
# 3. Build frontend (npm run build)
# 4. Build backend (dotnet publish)
# 5. Deploy to IIS
# 6. Run database migrations
# 7. Configure IIS application pools
# 8. Start applications
```

### Step 5: Manual IIS Configuration (if needed)

```powershell
# Create IIS Application Pool for Backend
New-WebAppPool -Name "EDR-Backend" -Force
Set-ItemProperty IIS:\AppPools\EDR-Backend -Name managedRuntimeVersion -Value ""
Set-ItemProperty IIS:\AppPools\EDR-Backend -Name enable32BitAppOnWin64 -Value $false

# Create IIS Website for Backend
New-Website -Name "EDR-Backend" `
    -PhysicalPath "C:\inetpub\EDR\backend\src\NJS.API\bin\Release\net8.0\publish" `
    -ApplicationPool "EDR-Backend" `
    -Port 5245

# Create IIS Website for Frontend
New-Website -Name "EDR-Frontend" `
    -PhysicalPath "C:\inetpub\EDR\frontend\dist" `
    -Port 5173
```

### Step 6: Verify Deployment

```powershell
# Test backend
Invoke-WebRequest -Uri "http://localhost:5245/api/health"

# Test frontend
Invoke-WebRequest -Uri "http://localhost:5173"

# Check IIS logs
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*.log" -Tail 50
```

---

## Database Setup

### SQL Server Database

#### Option 1: Automated Migration (Recommended)

```bash
# Backend automatically runs migrations on startup
# Ensure connection string is correct in appsettings.json
```

#### Option 2: Manual Migration

```bash
# Navigate to backend project
cd backend/src/NJS.API

# Run migrations
dotnet ef database update --project ../NJS.Infrastructure

# Verify tables created
# Connect to SQL Server and check KarmaTechAI_SAAS database
```

### MongoDB Setup

```bash
# MongoDB Atlas (Cloud)
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create cluster
# 3. Create database user
# 4. Whitelist IP addresses
# 5. Get connection string
# 6. Update appsettings.json
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Backend health check
curl http://your-domain/api/health

# Expected response:
{
  "status": "Healthy",
  "timestamp": "2024-11-20T10:30:00Z",
  "services": {
    "database": "Connected",
    "mongodb": "Connected"
  }
}
```

### Functional Tests

1. **Login Test**
   ```bash
   curl -X POST http://your-domain/api/user/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"Admin123!"}'
   ```

2. **API Test**
   ```bash
   curl http://your-domain/api/projects \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Frontend Test**
   - Open browser: http://your-domain
   - Login with test credentials
   - Navigate through main features
   - Verify data loads correctly

### Performance Tests

```bash
# API response time (should be < 500ms)
curl -w "@curl-format.txt" -o /dev/null -s http://your-domain/api/projects

# Frontend load time (should be < 3s)
# Use browser DevTools → Network tab
```

---

## Troubleshooting

### AWS Deployment Issues

#### Issue: GitHub Actions Fails

```bash
# Check workflow logs
# Navigate to: GitHub → Actions → Failed workflow → View logs

# Common fixes:
# 1. Verify GitHub Secrets are correct
# 2. Check AWS credentials have proper permissions
# 3. Ensure S3 bucket exists and is accessible
# 4. Verify Elastic Beanstalk environment is running
```

#### Issue: Frontend Not Loading

```bash
# Check S3 bucket
aws s3 ls s3://edr-frontend-bucket

# Check CloudFront distribution
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### Issue: Backend API Errors

```bash
# Check Elastic Beanstalk logs
aws elasticbeanstalk retrieve-environment-info \
  --environment-name edr-backend-prod \
  --info-type tail

# Check application logs
aws logs tail /aws/elasticbeanstalk/edr-backend-prod/var/log/web.stdout.log
```

### Windows IIS Deployment Issues

#### Issue: IIS Application Won't Start

```powershell
# Check application pool status
Get-WebAppPoolState -Name "EDR-Backend"

# Start application pool
Start-WebAppPool -Name "EDR-Backend"

# Check event logs
Get-EventLog -LogName Application -Source "IIS*" -Newest 50
```

#### Issue: Database Connection Fails

```powershell
# Test SQL Server connection
Test-NetConnection -ComputerName localhost -Port 1433

# Verify connection string
# Check appsettings.Production.json

# Test connection from backend
cd C:\inetpub\EDR\backend\src\NJS.API
dotnet run --environment Production
```

#### Issue: Frontend Build Fails

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
cd C:\inetpub\EDR\frontend
Remove-Item -Recurse -Force node_modules
npm install

# Rebuild
npm run build
```

---

## Rollback Procedures

### AWS Rollback

```bash
# Option 1: Revert Git Commit
git revert HEAD
git push origin main
# GitHub Actions will auto-deploy previous version

# Option 2: Manual Elastic Beanstalk Rollback
aws elasticbeanstalk update-environment \
  --environment-name edr-backend-prod \
  --version-label previous-version

# Option 3: Restore Database Backup
# Via AWS RDS Console:
# 1. Navigate to RDS → Snapshots
# 2. Select snapshot before deployment
# 3. Restore to new instance
# 4. Update connection string
```

### Windows IIS Rollback

```powershell
# Stop IIS applications
Stop-Website -Name "EDR-Backend"
Stop-Website -Name "EDR-Frontend"

# Restore database backup
# Run backup script created during deployment
.\deployment\scripts\2-backup-database.ps1 -Restore

# Restore application files
# Copy from backup directory
Copy-Item -Path "C:\Backups\EDR\*" -Destination "C:\inetpub\EDR\" -Recurse -Force

# Start IIS applications
Start-Website -Name "EDR-Backend"
Start-Website -Name "EDR-Frontend"

# Verify rollback
Invoke-WebRequest -Uri "http://localhost:5245/api/health"
```

---

## Maintenance

### Regular Tasks

1. **Database Backups** (Daily)
   ```bash
   # AWS: Automated via RDS snapshots
   # Windows: Run backup script
   .\deployment\scripts\2-backup-database.ps1
   ```

2. **Log Rotation** (Weekly)
   ```bash
   # AWS: Automated via CloudWatch
   # Windows: Configure IIS log rotation
   ```

3. **Security Updates** (Monthly)
   ```bash
   # Update dependencies
   npm audit fix
   dotnet list package --outdated
   ```

4. **Performance Monitoring** (Continuous)
   ```bash
   # AWS: CloudWatch dashboards
   # Windows: Performance Monitor
   ```

---

## Support

For issues or questions:
1. Check this guide first
2. Review GitHub Actions logs (AWS) or IIS logs (Windows)
3. Contact DevOps team
4. Create GitHub issue with detailed error logs

---

**Last Updated:** 2024-11-20
**Version:** 1.0
