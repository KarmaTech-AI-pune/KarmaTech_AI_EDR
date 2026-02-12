# ====================================================================
# Backend Deployment Script
# ====================================================================
# This script deploys the .NET Core backend API to IIS

param(
    [Parameter(Mandatory=$true)]
    [string]$PackagePath,  # Path to the published backend ZIP file
    
    [string]$SiteName = "api.karmatech-ai",
    [string]$AppPoolName = "api.karmatech-ai",
    [string]$TargetPath = "D:\Disha Project\NJSProjectManagementApp\backend",
    [string]$BackupPath = "C:\Deployments\Backups"
)

$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validate package exists
if (-not (Test-Path $PackagePath)) {
    Write-Host "✗ Package not found: $PackagePath" -ForegroundColor Red
    exit 1
}

Write-Host "Package: $PackagePath" -ForegroundColor Gray
Write-Host "Site: $SiteName" -ForegroundColor Gray
Write-Host "App Pool: $AppPoolName" -ForegroundColor Gray
Write-Host "Target: $TargetPath" -ForegroundColor Gray
Write-Host ""

try {
    Import-Module WebAdministration -ErrorAction Stop
    
    # ================================================================
    # Step 1: Create backup of current version
    # ================================================================
    Write-Host "Step 1: Creating backup..." -ForegroundColor Cyan
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFolder = Join-Path $BackupPath "backend_$timestamp"
    
    if (Test-Path $TargetPath) {
        Write-Host "  Backing up current version to: $backupFolder" -ForegroundColor Gray
        Copy-Item -Path $TargetPath -Destination $backupFolder -Recurse -Force
        Write-Host "  ✓ Backup created" -ForegroundColor Green
    } else {
        Write-Host "  No existing deployment found (first deployment)" -ForegroundColor Yellow
    }
    
    # ================================================================
    # Step 2: Stop IIS App Pool
    # ================================================================
    Write-Host "`nStep 2: Stopping IIS App Pool..." -ForegroundColor Cyan
    
    $appPool = Get-WebAppPoolState -Name $AppPoolName -ErrorAction SilentlyContinue
    if ($appPool) {
        if ($appPool.Value -ne "Stopped") {
            Write-Host "  Stopping app pool: $AppPoolName" -ForegroundColor Gray
            Stop-WebAppPool -Name $AppPoolName
            
            # Wait for app pool to stop (max 30 seconds)
            $timeout = 30
            $elapsed = 0
            while ((Get-WebAppPoolState -Name $AppPoolName).Value -ne "Stopped" -and $elapsed -lt $timeout) {
                Start-Sleep -Seconds 1
                $elapsed++
                Write-Host "  Waiting for app pool to stop... ($elapsed/$timeout)" -ForegroundColor Gray
            }
            
            if ((Get-WebAppPoolState -Name $AppPoolName).Value -eq "Stopped") {
                Write-Host "  ✓ App pool stopped" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ App pool did not stop within timeout, forcing..." -ForegroundColor Yellow
                Stop-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
            }
        } else {
            Write-Host "  App pool already stopped" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠ App pool not found: $AppPoolName" -ForegroundColor Yellow
    }
    
    # ================================================================
    # Step 3: Extract new version
    # ================================================================
    Write-Host "`nStep 3: Extracting new version..." -ForegroundColor Cyan
    
    $tempExtractPath = Join-Path $env:TEMP "backend_deploy_$timestamp"
    Write-Host "  Extracting to temp folder: $tempExtractPath" -ForegroundColor Gray
    Expand-Archive -Path $PackagePath -DestinationPath $tempExtractPath -Force
    Write-Host "  ✓ Package extracted" -ForegroundColor Green
    
    # ================================================================
    # Step 4: Deploy files
    # ================================================================
    Write-Host "`nStep 4: Deploying files..." -ForegroundColor Cyan
    
    # Ensure target directory exists
    if (-not (Test-Path $TargetPath)) {
        New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
    }
    
    # Copy files from temp to target
    Write-Host "  Copying files to: $TargetPath" -ForegroundColor Gray
    Copy-Item -Path "$tempExtractPath\*" -Destination $TargetPath -Recurse -Force
    Write-Host "  ✓ Files deployed" -ForegroundColor Green
    
    # Clean up temp folder
    Remove-Item -Path $tempExtractPath -Recurse -Force -ErrorAction SilentlyContinue
    
    # ================================================================
    # Step 5: Start IIS App Pool
    # ================================================================
    Write-Host "`nStep 5: Starting IIS App Pool..." -ForegroundColor Cyan
    
    Write-Host "  Starting app pool: $AppPoolName" -ForegroundColor Gray
    Start-WebAppPool -Name $AppPoolName
    
    # Wait for app pool to start
    Start-Sleep -Seconds 5
    
    $appPoolState = (Get-WebAppPoolState -Name $AppPoolName).Value
    if ($appPoolState -eq "Started") {
        Write-Host "  ✓ App pool started" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ App pool state: $appPoolState" -ForegroundColor Yellow
    }
    
    # ================================================================
    # Step 6: Health Check
    # ================================================================
    Write-Host "`nStep 6: Running health check..." -ForegroundColor Cyan
    
    # Wait a bit for the application to warm up
    Write-Host "  Waiting for application to warm up..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    # Try to hit the health endpoint
    try {
        $healthUrl = "http://localhost:5245/health"
        Write-Host "  Testing: $healthUrl" -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ Health check passed (Status: $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠ Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  Note: Application may still be starting up" -ForegroundColor Gray
    }
    
    # ================================================================
    # Success Summary
    # ================================================================
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Backend Deployment Completed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployment Details:" -ForegroundColor Gray
    Write-Host "  - Backup Location: $backupFolder" -ForegroundColor Gray
    Write-Host "  - Deployment Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "  - Site: $SiteName" -ForegroundColor Gray
    Write-Host ""
    
    # Log success
    $logPath = "C:\Deployments\Logs\deployment-log.txt"
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | SUCCESS | Backend | $SiteName | Backup: $backupFolder"
    Add-Content -Path $logPath -Value $logEntry
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ Backend Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Rollback Information:" -ForegroundColor Yellow
    Write-Host "  To rollback, restore from: $backupFolder" -ForegroundColor Yellow
    Write-Host ""
    
    # Log failure
    $logPath = "C:\Deployments\Logs\deployment-log.txt"
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | FAILED | Backend | $SiteName | Error: $($_.Exception.Message)"
    Add-Content -Path $logPath -Value $logEntry
    
    # Try to restart app pool if it's stopped
    try {
        $appPoolState = (Get-WebAppPoolState -Name $AppPoolName -ErrorAction SilentlyContinue).Value
        if ($appPoolState -eq "Stopped") {
            Write-Host "Attempting to restart app pool..." -ForegroundColor Yellow
            Start-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore errors during cleanup
    }
    
    exit 1
}
