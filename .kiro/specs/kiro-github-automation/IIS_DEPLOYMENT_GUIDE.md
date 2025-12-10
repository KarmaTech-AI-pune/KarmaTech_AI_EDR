# Local IIS Deployment Guide

**Purpose:** Deploy to local IIS before AWS for final verification  
**When:** After PR merge, before AWS deployment (Step 7.5)  
**Status:** Optional but Recommended

---

## 🎯 **Why Deploy to IIS First?**

### **Benefits:**
1. ✅ **Production-like testing** - IIS mimics production environment
2. ✅ **Catch deployment issues** - Find problems before AWS
3. ✅ **Database migration verification** - Test migrations locally
4. ✅ **Quick rollback** - Easy to revert if issues found
5. ✅ **Cost savings** - No AWS costs for testing
6. ✅ **Faster iteration** - Local deployment is faster

### **When to Use:**
- ✅ Backend changes (API, database)
- ✅ Major features
- ✅ Database migrations
- ✅ Configuration changes
- ✅ First deployment of the day

### **When to Skip:**
- ⏭️ Frontend-only changes
- ⏭️ Minor bug fixes
- ⏭️ Already tested thoroughly
- ⏭️ Urgent hotfixes

---

## 📋 **IIS Deployment Process**

### **Step 1: Build the Project**

```powershell
# Navigate to backend
cd D:\KSmartBiz\KarmaTech_AI_EDR\backend

# Build in Release mode
dotnet publish -c Release -o ./publish

# Output:
# ✅ Build succeeded
# ✅ Published to ./publish
```

---

### **Step 2: Create Deployment ZIP**

```powershell
# Create ZIP from publish folder
Compress-Archive -Path ./publish/* -DestinationPath ../deployment.zip -Force

# Output:
# ✅ deployment.zip created
```

---

### **Step 3: Configure Deployment Script**

Edit `Final_Deploy_.ps1` with your settings:

```powershell
# Configuration
$siteName = "KarmaTechAPI"                          # Your IIS site name
$appPoolName = "KarmaTechAppPool"                   # Your app pool name
$wwwrootPath = "C:\inetpub\wwwroot"                # IIS root path
$mainProjectPath = "C:\inetpub\wwwroot\KarmaTechAPI"  # Live project folder
$zipFilePath = "D:\KSmartBiz\KarmaTech_AI_EDR\deployment.zip"  # ZIP file
$backupBasePath = "C:\inetpub\wwwroot\Backups"     # Backup location
```

---

### **Step 4: Run Deployment Script**

```powershell
# Execute deployment
& "D:\KSmartBiz\KarmaTech_AI_EDR\Final_Deploy_.ps1"

# Output:
# Creating backup folder: C:\inetpub\wwwroot\Backups\2024-12-04_15-30-00
# Backing up current live project...
# ✅ Full backup completed successfully!
# Creating new deployment folder: C:\inetpub\wwwroot\KarmaTechAPI_2024-12-04_15-30-00
# Stopping IIS site and app pool...
# Extracting ZIP contents...
# ✅ Files extracted successfully!
# Copying files to live folder...
# ✅ Files copied to live folder successfully!
# Starting IIS site and app pool...
# ✅ Deployment completed successfully!
# 📁 New Deployment Folder: C:\inetpub\wwwroot\KarmaTechAPI_2024-12-04_15-30-00
# 📁 Backup stored at: C:\inetpub\wwwroot\Backups\2024-12-04_15-30-00
```

---

### **Step 5: Verify Deployment**

```powershell
# Test API endpoint
Invoke-RestMethod -Uri "http://localhost/api/health" -Method Get

# Expected output:
# {
#   "status": "healthy",
#   "version": "1.2.3",
#   "timestamp": "2024-12-04T15:30:00Z"
# }

# Check IIS site status
Get-Website -Name "KarmaTechAPI"

# Expected output:
# Name           State   Physical Path
# ----           -----   -------------
# KarmaTechAPI   Started C:\inetpub\wwwroot\KarmaTechAPI
```

---

## 🔄 **Rollback Procedure**

If deployment fails or issues are found:

### **Option 1: Automatic Rollback (Recommended)**

```powershell
# List available backups
Get-ChildItem "C:\inetpub\wwwroot\Backups" | Sort-Object Name -Descending

# Output:
# 2024-12-04_15-30-00  ← Latest (current broken deployment)
# 2024-12-04_14-00-00  ← Previous working version
# 2024-12-04_10-00-00

# Restore previous version
$backupFolder = "C:\inetpub\wwwroot\Backups\2024-12-04_14-00-00"
$mainProjectPath = "C:\inetpub\wwwroot\KarmaTechAPI"

# Stop IIS
Stop-WebAppPool -Name "KarmaTechAppPool"
Stop-Website -Name "KarmaTechAPI"

# Restore backup
Remove-Item "$mainProjectPath\*" -Recurse -Force
Copy-Item "$backupFolder\*" -Destination $mainProjectPath -Recurse -Force

# Start IIS
Start-WebAppPool -Name "KarmaTechAppPool"
Start-Website -Name "KarmaTechAPI"

# Output:
# ✅ Rollback complete
```

### **Option 2: Manual Rollback**

1. Open IIS Manager
2. Stop the site and app pool
3. Navigate to backup folder
4. Copy files back to live folder
5. Start the site and app pool

---

## 🤖 **Kiro Automation Integration**

### **How Kiro Uses This:**

```powershell
# After PR merge, Kiro can automatically:

# 1. Build project
cd backend
dotnet publish -c Release -o ./publish

# 2. Create ZIP
Compress-Archive -Path ./publish/* -DestinationPath ../deployment.zip -Force

# 3. Deploy to IIS
& "D:\KSmartBiz\KarmaTech_AI_EDR\Final_Deploy_.ps1"

# 4. Verify deployment
$response = Invoke-RestMethod -Uri "http://localhost/api/health"
if ($response.status -eq "healthy") {
    Write-Host "✅ IIS deployment successful"
    Write-Host "✅ Ready for AWS deployment"
} else {
    Write-Host "❌ IIS deployment failed"
    Write-Host "⚠️ Skipping AWS deployment"
}
```

---

## 📊 **Deployment Checklist**

### **Pre-Deployment:**
- [ ] PR merged to Saas/dev
- [ ] All tests passing
- [ ] Database migrations ready (if any)
- [ ] IIS site and app pool configured

### **During Deployment:**
- [ ] Backup created successfully
- [ ] IIS stopped without errors
- [ ] Files extracted and copied
- [ ] IIS started successfully

### **Post-Deployment:**
- [ ] Health endpoint responds
- [ ] API endpoints working
- [ ] Database connection working
- [ ] No errors in IIS logs

### **If Issues Found:**
- [ ] Rollback to previous version
- [ ] Investigate issue
- [ ] Fix and redeploy
- [ ] Do NOT proceed to AWS

---

## 🔧 **Troubleshooting**

### **Issue: IIS Won't Stop**

```powershell
# Force stop app pool
Stop-WebAppPool -Name "KarmaTechAppPool" -ErrorAction Stop

# If still running, kill process
Get-Process -Name "w3wp" | Stop-Process -Force
```

### **Issue: Files Locked**

```powershell
# Check what's locking files
Get-Process | Where-Object {$_.Path -like "*inetpub*"}

# Stop all IIS processes
iisreset /stop

# Deploy files

# Start IIS
iisreset /start
```

### **Issue: Deployment ZIP Not Found**

```powershell
# Verify ZIP exists
Test-Path "D:\KSmartBiz\KarmaTech_AI_EDR\deployment.zip"

# Check file size
(Get-Item "D:\KSmartBiz\KarmaTech_AI_EDR\deployment.zip").Length / 1MB
# Should be > 0 MB
```

### **Issue: Permission Denied**

```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → Run as Administrator

# Or grant permissions
$acl = Get-Acl "C:\inetpub\wwwroot\KarmaTechAPI"
$permission = "IIS_IUSRS","FullControl","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl "C:\inetpub\wwwroot\KarmaTechAPI" $acl
```

---

## 📈 **Success Metrics**

Track these for IIS deployments:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Deployment Time** | <2 minutes | Script execution time |
| **Downtime** | <30 seconds | IIS stop to start time |
| **Success Rate** | >95% | Successful deployments / total |
| **Rollback Time** | <1 minute | Time to restore backup |
| **Issues Caught** | Track | Issues found before AWS |

---

## 🎯 **Best Practices**

### **Do's:**
✅ Always create backup before deployment  
✅ Test health endpoint after deployment  
✅ Keep last 5 backups (delete older ones)  
✅ Deploy during low-traffic hours  
✅ Monitor IIS logs after deployment  
✅ Verify database migrations worked  

### **Don'ts:**
❌ Don't skip backup creation  
❌ Don't deploy without testing locally first  
❌ Don't delete backups immediately  
❌ Don't proceed to AWS if IIS deployment fails  
❌ Don't ignore warnings in deployment script  

---

## 🔗 **Integration with AI-DLC Workflow**

### **Where This Fits:**

```
Step 7: Merge PR
   ↓
Step 7.5: IIS Deployment (THIS STEP)
   ├─ Build project
   ├─ Create ZIP
   ├─ Deploy to IIS
   ├─ Verify deployment
   └─ ✅ If successful → Proceed to AWS
   └─ ❌ If failed → Rollback & fix
   ↓
Step 7.6: AWS Deployment
   └─ Only if IIS deployment successful
```

---

## 📝 **Configuration Template**

Save this as `.kiro/scripts/deploy-iis.ps1`:

```powershell
# IIS Deployment Configuration
param(
    [string]$siteName = "KarmaTechAPI",
    [string]$appPoolName = "KarmaTechAppPool",
    [string]$projectPath = "D:\KSmartBiz\KarmaTech_AI_EDR\backend",
    [string]$zipPath = "D:\KSmartBiz\KarmaTech_AI_EDR\deployment.zip",
    [string]$iisPath = "C:\inetpub\wwwroot\KarmaTechAPI"
)

# Build
Write-Host "🔨 Building project..."
cd $projectPath
dotnet publish -c Release -o ./publish

# Create ZIP
Write-Host "📦 Creating deployment package..."
Compress-Archive -Path ./publish/* -DestinationPath $zipPath -Force

# Deploy
Write-Host "🚀 Deploying to IIS..."
& "D:\KSmartBiz\KarmaTech_AI_EDR\Final_Deploy_.ps1"

# Verify
Write-Host "✅ Verifying deployment..."
$response = Invoke-RestMethod -Uri "http://localhost/api/health"
if ($response.status -eq "healthy") {
    Write-Host "✅ IIS deployment successful!"
    exit 0
} else {
    Write-Host "❌ IIS deployment failed!"
    exit 1
}
```

---

**Last Updated:** December 4, 2024  
**Status:** Ready for Use
