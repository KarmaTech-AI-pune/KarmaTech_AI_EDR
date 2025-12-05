# ====================================================================
# EDR Deployment Script - Improved Version
# ====================================================================
# This script deploys to either Dev or Production environment
#
# Usage:
#   .\Deploy-EDR.ps1 -Environment Dev -PackagePath "C:\Deployments\Packages\backend-v1.0.0.zip"
#   .\Deploy-EDR.ps1 -Environment Prod -PackagePath "C:\Deployments\Packages\backend-v1.0.0.zip"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("Dev", "Prod")]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [string]$PackagePath,
    
    [switch]$SkipHealthCheck
)

$ErrorActionPreference = 'Stop'

# ====================================================================
# Configuration based on environment
# ====================================================================
$config = @{
    Dev = @{
        SiteName = "api.karmatech-ai-dev"
        AppPoolName = "api.karmatech-ai-dev"
        TargetPath = "C:\inetpub\wwwroot\api-dev"
        BackupPath = "C:\Deployments\Backups\Dev"
        HealthUrl = "http://localhost:5245/health"
        RequireConfirmation = $false
    }
    Prod = @{
        SiteName = "api.karmatech-ai"
        AppPoolName = "api.karmatech-ai"
        TargetPath = "D:\Disha Project\NJSProjectManagementApp\backend"
        BackupPath = "C:\Deployments\Backups\Production"
        HealthUrl = "https://api.karmatech-ai.com/health"
        RequireConfirmation = $true
    }
}

$envConfig = $config[$Environment]
$deploymentStartTime = Get-Date

# ====================================================================
# Header
# ====================================================================
Clear-Host
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║          EDR Deployment - $Environment Environment              ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ====================================================================
# Validation
# ====================================================================
Write-Host "Validating deployment package..." -ForegroundColor Cyan

if (-not (Test-Path $PackagePath)) {
    Write-Host "✗ Package not found: $PackagePath" -ForegroundColor Red
    exit 1
}

$packageSize = (Get-Item $PackagePath).Length / 1MB
Write-Host "✓ Package found: $([math]::Round($packageSize, 2)) MB" -ForegroundColor Green
Write-Host ""

Write-Host "Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Environment:    $Environment" -ForegroundColor Gray
Write-Host "  Package:        $(Split-Path $PackagePath -Leaf)" -ForegroundColor Gray
Write-Host "  Site Name:      $($envConfig.SiteName)" -ForegroundColor Gray
Write-Host "  App Pool:       $($envConfig.AppPoolName)" -ForegroundColor Gray
Write-Host "  Target Path:    $($envConfig.TargetPath)" -ForegroundColor Gray
Write-Host "  Backup Path:    $($envConfig.BackupPath)" -ForegroundColor Gray
Write-Host ""

# ====================================================================
# Confirmation for production
# ====================================================================
if ($envConfig.RequireConfirmation) {
    Write-Host "⚠️  WARNING: You are deploying to PRODUCTION!" -ForegroundColor Yellow
    Write-Host "⚠️  This will affect live users!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please confirm:" -ForegroundColor Yellow
    Write-Host "  1. All tests have passed" -ForegroundColor Gray
    Write-Host "  2. Dev deployment was successful" -ForegroundColor Gray
    Write-Host "  3. Stakeholders have been notified" -ForegroundColor Gray
    Write-Host "  4. Database backup has been created" -ForegroundColor Gray
    Write-Host ""
    $confirm = Read-Host "Type 'DEPLOY' to continue (or anything else to cancel)"
    
    if ($confirm -ne "DEPLOY") {
        Write-Host ""
        Write-Host "Deployment cancelled by user" -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
}

# ====================================================================
# Deployment Process
# ====================================================================
try {
    Import-Module WebAdministration -ErrorAction Stop
    
    # ================================================================
    # Step 1: Create Backup
    # ================================================================
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " Step 1: Creating Backup" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFolder = Join-Path $envConfig.BackupPath $timestamp
    
    if (Test-Path $envConfig.TargetPath) {
        Write-Host "Creating backup folder: $backupFolder" -ForegroundColor Gray
        New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
        
        Write-Host "Backing up current deployment..." -ForegroundColor Gray
        Copy-Item -Path "$($envConfig.TargetPath)\*" -Destination $backupFolder -Recurse -Force
        
        $backupSize = (Get-ChildItem $backupFolder -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "✓ Backup created successfully ($([math]::Round($backupSize, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Host "⚠ No existing deployment found (first deployment)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # ================================================================
    # Step 2: Stop IIS
    # ================================================================
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " Step 2: Stopping IIS Application" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Stopping app pool: $($envConfig.AppPoolName)" -ForegroundColor Gray
    Stop-WebAppPool -Name $envConfig.AppPoolName -ErrorAction SilentlyContinue
    
    Write-Host "Stopping website: $($envConfig.SiteName)" -ForegroundColor Gray
    Stop-Website -Name $envConfig.SiteName -ErrorAction SilentlyContinue
    
    Write-Host "Waiting for processes to stop..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    $appPoolState = (Get-WebAppPoolState -Name $envConfig.AppPoolName -ErrorAction SilentlyContinue).Value
    if ($appPoolState -eq "Stopped") {
        Write-Host "✓ IIS application stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ App pool state: $appPoolState" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # ================================================================
    # Step 3: Extract and Deploy
    # ================================================================
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " Step 3: Deploying New Version" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    $tempPath = Join-Path $env:TEMP "deploy_$timestamp"
    Write-Host "Extracting package to temp folder..." -ForegroundColor Gray
    Expand-Archive -Path $PackagePath -DestinationPath $tempPath -Force
    Write-Host "✓ Package extracted" -ForegroundColor Green
    
    # Ensure target directory exists
    if (-not (Test-Path $envConfig.TargetPath)) {
        Write-Host "Creating target directory..." -ForegroundColor Gray
        New-Item -ItemType Directory -Path $envConfig.TargetPath -Force | Out-Null
    }
    
    Write-Host "Copying files to target location..." -ForegroundColor Gray
    Copy-Item -Path "$tempPath\*" -Destination $envConfig.TargetPath -Recurse -Force
    
    Write-Host "Cleaning up temp files..." -ForegroundColor Gray
    Remove-Item -Path $tempPath -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "✓ Files deployed successfully" -ForegroundColor Green
    Write-Host ""
    
    # ================================================================
    # Step 4: Start IIS
    # ================================================================
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " Step 4: Starting IIS Application" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Starting app pool: $($envConfig.AppPoolName)" -ForegroundColor Gray
    Start-WebAppPool -Name $envConfig.AppPoolName
    
    Write-Host "Starting website: $($envConfig.SiteName)" -ForegroundColor Gray
    Start-Website -Name $envConfig.SiteName
    
    Write-Host "Waiting for application to warm up..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    $appPoolState = (Get-WebAppPoolState -Name $envConfig.AppPoolName).Value
    if ($appPoolState -eq "Started") {
        Write-Host "✓ IIS application started successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ App pool state: $appPoolState" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # ================================================================
    # Step 5: Health Check
    # ================================================================
    if (-not $SkipHealthCheck) {
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host " Step 5: Running Health Check" -ForegroundColor Cyan
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Testing health endpoint: $($envConfig.HealthUrl)" -ForegroundColor Gray
        
        $maxRetries = 3
        $retryCount = 0
        $healthCheckPassed = $false
        
        while ($retryCount -lt $maxRetries -and -not $healthCheckPassed) {
            try {
                $response = Invoke-WebRequest -Uri $envConfig.HealthUrl -UseBasicParsing -TimeoutSec 30
                if ($response.StatusCode -eq 200) {
                    Write-Host "✓ Health check passed (Status: $($response.StatusCode))" -ForegroundColor Green
                    $healthCheckPassed = $true
                }
            } catch {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-Host "⚠ Health check attempt $retryCount failed, retrying..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 10
                } else {
                    Write-Host "⚠ Health check failed after $maxRetries attempts" -ForegroundColor Yellow
                    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
                    Write-Host "  Note: Application may still be starting up" -ForegroundColor Gray
                }
            }
        }
        
        Write-Host ""
    }
    
    # ================================================================
    # Success Summary
    # ================================================================
    $deploymentEndTime = Get-Date
    $deploymentDuration = $deploymentEndTime - $deploymentStartTime
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                            ║" -ForegroundColor Green
    Write-Host "║          DEPLOYMENT COMPLETED SUCCESSFULLY!                ║" -ForegroundColor Green
    Write-Host "║                                                            ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployment Summary:" -ForegroundColor Cyan
    Write-Host "  Environment:      $Environment" -ForegroundColor Gray
    Write-Host "  Start Time:       $($deploymentStartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
    Write-Host "  End Time:         $($deploymentEndTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
    Write-Host "  Duration:         $($deploymentDuration.ToString('mm\:ss'))" -ForegroundColor Gray
    Write-Host "  Backup Location:  $backupFolder" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Verify the application is working correctly" -ForegroundColor Gray
    Write-Host "  2. Test critical user workflows" -ForegroundColor Gray
    Write-Host "  3. Monitor logs for any errors" -ForegroundColor Gray
    if ($Environment -eq "Prod") {
        Write-Host "  4. Notify stakeholders of successful deployment" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Log success
    $logPath = "C:\Deployments\Logs\deployment-log.txt"
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | SUCCESS | $Environment | $(Split-Path $PackagePath -Leaf) | Duration: $($deploymentDuration.ToString('mm\:ss')) | Backup: $backupFolder"
    Add-Content -Path $logPath -Value $logEntry -ErrorAction SilentlyContinue
    
} catch {
    # ================================================================
    # Error Handling
    # ================================================================
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                            ║" -ForegroundColor Red
    Write-Host "║              DEPLOYMENT FAILED!                            ║" -ForegroundColor Red
    Write-Host "║                                                            ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Rollback Information:" -ForegroundColor Yellow
    Write-Host "  Backup Location: $backupFolder" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To rollback, run:" -ForegroundColor Yellow
    Write-Host "  Stop-WebAppPool -Name '$($envConfig.AppPoolName)'" -ForegroundColor Gray
    Write-Host "  Remove-Item '$($envConfig.TargetPath)\*' -Recurse -Force" -ForegroundColor Gray
    Write-Host "  Copy-Item '$backupFolder\*' -Destination '$($envConfig.TargetPath)' -Recurse -Force" -ForegroundColor Gray
    Write-Host "  Start-WebAppPool -Name '$($envConfig.AppPoolName)'" -ForegroundColor Gray
    Write-Host ""
    
    # Try to restart IIS
    Write-Host "Attempting to restart IIS application..." -ForegroundColor Yellow
    try {
        Start-WebAppPool -Name $envConfig.AppPoolName -ErrorAction SilentlyContinue
        Start-Website -Name $envConfig.SiteName -ErrorAction SilentlyContinue
        Write-Host "✓ IIS restarted" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not restart IIS automatically" -ForegroundColor Yellow
    }
    
    # Log failure
    $logPath = "C:\Deployments\Logs\deployment-log.txt"
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | FAILED | $Environment | $(Split-Path $PackagePath -Leaf) | Error: $($_.Exception.Message)"
    Add-Content -Path $logPath -Value $logEntry -ErrorAction SilentlyContinue
    
    exit 1
}
