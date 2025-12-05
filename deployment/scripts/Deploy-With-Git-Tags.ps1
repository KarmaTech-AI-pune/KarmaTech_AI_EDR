# ====================================================================
# Local Deployment Script with Git Release Tagging
# ====================================================================
# This script deploys to local IIS and creates Git release tags
# Usage: .\Deploy-With-Git-Tags.ps1 -Environment "dev" -Component "backend"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "staging", "production")]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("frontend", "backend", "full")]
    [string]$Component,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("patch", "minor", "major")]
    [string]$VersionBump = "patch",
    
    [Parameter(Mandatory=$false)]
    [string]$SiteName = "api.karmatech-ai",
    
    [Parameter(Mandatory=$false)]
    [string]$AppPoolName = "api.karmatech-ai",
    
    [Parameter(Mandatory=$false)]
    [string]$BackupPath = "C:\Deployments\Backups"
)

$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment with Git Release Tagging" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Gray
Write-Host "Component: $Component" -ForegroundColor Gray
Write-Host "Version Bump: $VersionBump" -ForegroundColor Gray
Write-Host ""

# ====================================================================
# Function: Get-NextVersion
# ====================================================================
function Get-NextVersion {
    param(
        [string]$Environment,
        [string]$VersionBump
    )
    
    try {
        # Fetch all tags
        git fetch --tags 2>$null
        
        # Get latest production tag (semantic version only)
        $latestProdTag = git tag --list "v[0-9]*.[0-9]*.[0-9]*" --sort=-v:refname | 
            Where-Object { $_ -notmatch "-" } | 
            Select-Object -First 1
        
        if ([string]::IsNullOrEmpty($latestProdTag)) {
            # No production tags exist, start with v1.0.0
            $major = 1
            $minor = 0
            $patch = 0
        }
        else {
            # Parse existing version
            $version = $latestProdTag -replace '^v', ''
            $parts = $version -split '\.'
            $major = [int]$parts[0]
            $minor = [int]$parts[1]
            $patch = [int]$parts[2]
            
            # Bump version based on input
            switch ($VersionBump) {
                "major" {
                    $major++
                    $minor = 0
                    $patch = 0
                }
                "minor" {
                    $minor++
                    $patch = 0
                }
                "patch" {
                    $patch++
                }
            }
        }
        
        $baseVersion = "$major.$minor.$patch"
        Write-Host "Base Version: v$baseVersion" -ForegroundColor Gray
        
        # Create environment-specific tag
        if ($Environment -eq "production") {
            $newTag = "v$baseVersion"
        }
        else {
            $date = Get-Date -Format "yyyyMMdd"
            
            # Find existing tags for this version and environment today
            $pattern = "v$baseVersion-$Environment.$date.*"
            $existingTags = git tag --list $pattern --sort=-v:refname
            
            if ($existingTags) {
                # Get the highest build number for today
                $latestBuild = ($existingTags[0] -split '\.')[-1]
                $buildNum = [int]$latestBuild + 1
            }
            else {
                $buildNum = 1
            }
            
            $newTag = "v$baseVersion-$Environment.$date.$buildNum"
        }
        
        return @{
            Tag = $newTag
            Version = $baseVersion
        }
    }
    catch {
        Write-Host "Error determining version: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# ====================================================================
# Function: Create-GitTag
# ====================================================================
function Create-GitTag {
    param(
        [string]$Tag,
        [string]$Environment,
        [string]$Component
    )
    
    try {
        # Check if tag already exists
        $tagExists = git rev-parse $Tag 2>$null
        if ($tagExists) {
            Write-Host "⚠️ Tag $Tag already exists!" -ForegroundColor Yellow
            
            # For dev/staging, auto-increment
            if ($Environment -ne "production") {
                $parts = $Tag -split '\.'
                $buildNum = [int]$parts[-1] + 1
                $parts[-1] = $buildNum
                $Tag = $parts -join '.'
                Write-Host "Using incremented tag: $Tag" -ForegroundColor Yellow
            }
            else {
                throw "Production tag already exists. Manual intervention required."
            }
        }
        
        # Get current commit
        $commitSha = git rev-parse HEAD
        $commitShort = $commitSha.Substring(0, 7)
        
        # Get current user
        $currentUser = $env:USERNAME
        
        # Create annotated tag
        $tagMessage = @"
Release $Tag

Environment: $Environment
Component: $Component
Commit: $commitShort
Deployed by: $currentUser
Deployed at: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC")
"@
        
        git tag -a $Tag -m $tagMessage
        Write-Host "✅ Created tag: $Tag" -ForegroundColor Green
        
        # Push tag to remote
        Write-Host "Pushing tag to remote..." -ForegroundColor Gray
        git push origin $Tag 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Tag pushed to remote" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Failed to push tag to remote (continuing anyway)" -ForegroundColor Yellow
        }
        
        return $Tag
    }
    catch {
        Write-Host "Error creating Git tag: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# ====================================================================
# Function: Create-DeploymentManifest
# ====================================================================
function Create-DeploymentManifest {
    param(
        [string]$Tag,
        [string]$Version,
        [string]$Environment,
        [string]$Component,
        [string]$DeploymentPath
    )
    
    $commitSha = git rev-parse HEAD
    $branch = git rev-parse --abbrev-ref HEAD
    
    $manifest = @{
        version = $Tag
        semanticVersion = $Version
        environment = $Environment
        component = $Component
        buildDate = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        commitSha = $commitSha
        branch = $branch
        deployedBy = $env:USERNAME
        deploymentPath = $DeploymentPath
    }
    
    $manifestPath = Join-Path $DeploymentPath "deployment-manifest.json"
    $manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestPath -Encoding UTF8
    
    Write-Host "✅ Created deployment manifest: $manifestPath" -ForegroundColor Green
}

# ====================================================================
# Main Deployment Logic
# ====================================================================

try {
    # Step 1: Determine version and create tag
    Write-Host "`nStep 1: Creating release tag..." -ForegroundColor Cyan
    $versionInfo = Get-NextVersion -Environment $Environment -VersionBump $VersionBump
    $releaseTag = Create-GitTag -Tag $versionInfo.Tag -Environment $Environment -Component $Component
    
    Write-Host "Release Tag: $releaseTag" -ForegroundColor Green
    Write-Host "Version: $versionInfo.Version" -ForegroundColor Green
    
    # Step 2: Create backup
    Write-Host "`nStep 2: Creating backup..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFolder = Join-Path $BackupPath "${Component}_${Environment}_${timestamp}_${releaseTag}"
    
    if (-not (Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    }
    
    New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
    Write-Host "Backup folder: $backupFolder" -ForegroundColor Gray
    
    # Step 3: Deploy based on component
    if ($Component -eq "backend" -or $Component -eq "full") {
        Write-Host "`nStep 3: Deploying backend..." -ForegroundColor Cyan
        
        # Stop IIS
        Import-Module WebAdministration
        Write-Host "Stopping IIS App Pool: $AppPoolName" -ForegroundColor Gray
        Stop-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
        
        # Build backend
        Write-Host "Building backend..." -ForegroundColor Gray
        $backendPath = Join-Path $PSScriptRoot "..\..\backend"
        Push-Location $backendPath
        
        dotnet publish -c Release -o "bin\Release\publish"
        
        if ($LASTEXITCODE -ne 0) {
            throw "Backend build failed"
        }
        
        Pop-Location
        
        # Create deployment manifest
        $publishPath = Join-Path $backendPath "bin\Release\publish"
        Create-DeploymentManifest -Tag $releaseTag -Version $versionInfo.Version `
            -Environment $Environment -Component "backend" -DeploymentPath $publishPath
        
        # Copy to IIS
        $targetPath = "D:\Disha Project\NJSProjectManagementApp\backend"
        
        # Backup current version
        if (Test-Path $targetPath) {
            Copy-Item -Path "$targetPath\*" -Destination $backupFolder -Recurse -Force
            Write-Host "✅ Backed up current version" -ForegroundColor Green
        }
        
        # Deploy new version
        Copy-Item -Path "$publishPath\*" -Destination $targetPath -Recurse -Force
        Write-Host "✅ Backend deployed" -ForegroundColor Green
        
        # Start IIS
        Write-Host "Starting IIS App Pool: $AppPoolName" -ForegroundColor Gray
        Start-WebAppPool -Name $AppPoolName
        Write-Host "✅ IIS App Pool started" -ForegroundColor Green
    }
    
    if ($Component -eq "frontend" -or $Component -eq "full") {
        Write-Host "`nStep 4: Deploying frontend..." -ForegroundColor Cyan
        
        $frontendPath = Join-Path $PSScriptRoot "..\..\frontend"
        Push-Location $frontendPath
        
        # Create environment file with version
        $envContent = @"
VITE_API_BASE_URL=https://api.app.karmatech-ai.com/
VITE_APP_ENV=$Environment
VITE_MAIN_DOMAIN=app.karmatech-ai.com
VITE_APP_TYPE=tenant
VITE_APP_VERSION=$releaseTag
VITE_BUILD_DATE=$(Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC")
VITE_COMMIT_SHA=$(git rev-parse HEAD)
"@
        $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
        
        # Build frontend
        Write-Host "Building frontend..." -ForegroundColor Gray
        npm install
        npm run build
        
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend build failed"
        }
        
        # Create deployment manifest
        $distPath = Join-Path $frontendPath "dist"
        Create-DeploymentManifest -Tag $releaseTag -Version $versionInfo.Version `
            -Environment $Environment -Component "frontend" -DeploymentPath $distPath
        
        Pop-Location
        
        Write-Host "✅ Frontend built successfully" -ForegroundColor Green
        Write-Host "Frontend dist folder: $distPath" -ForegroundColor Gray
    }
    
    # Step 5: Summary
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Deployment Completed Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployment Details:" -ForegroundColor Gray
    Write-Host "  - Release Tag: $releaseTag" -ForegroundColor Gray
    Write-Host "  - Version: $versionInfo.Version" -ForegroundColor Gray
    Write-Host "  - Environment: $Environment" -ForegroundColor Gray
    Write-Host "  - Component: $Component" -ForegroundColor Gray
    Write-Host "  - Backup Location: $backupFolder" -ForegroundColor Gray
    Write-Host "  - Deployed By: $env:USERNAME" -ForegroundColor Gray
    Write-Host "  - Deployed At: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
    
    # Log deployment
    $logPath = "C:\Deployments\Logs\deployment-log.txt"
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | SUCCESS | $Component | $Environment | $releaseTag | Backup: $backupFolder"
    
    if (-not (Test-Path (Split-Path $logPath))) {
        New-Item -ItemType Directory -Path (Split-Path $logPath) -Force | Out-Null
    }
    
    Add-Content -Path $logPath -Value $logEntry
    
}
catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Rollback Information:" -ForegroundColor Yellow
    Write-Host "  To rollback, restore from: $backupFolder" -ForegroundColor Yellow
    Write-Host ""
    
    # Log failure
    $logPath = "C:\Deployments\Logs\deployment-log.txt"
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | FAILED | $Component | $Environment | Error: $($_.Exception.Message)"
    Add-Content -Path $logPath -Value $logEntry -ErrorAction SilentlyContinue
    
    exit 1
}
