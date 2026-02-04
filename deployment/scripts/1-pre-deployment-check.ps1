# ====================================================================
# Pre-Deployment Validation Script
# ====================================================================
# This script validates that the system is ready for deployment
# Run this BEFORE starting any deployment

param(
    [string]$Environment = "Production"
)

$ErrorActionPreference = 'Stop'
$script:ValidationErrors = @()
$script:ValidationWarnings = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pre-Deployment Validation - $Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to log validation results
function Log-ValidationResult {
    param(
        [string]$Check,
        [bool]$Passed,
        [string]$Message
    )
    
    if ($Passed) {
        Write-Host "✓ $Check" -ForegroundColor Green
        if ($Message) { Write-Host "  $Message" -ForegroundColor Gray }
    } else {
        Write-Host "✗ $Check" -ForegroundColor Red
        Write-Host "  $Message" -ForegroundColor Red
        $script:ValidationErrors += "$Check : $Message"
    }
}

function Log-Warning {
    param([string]$Message)
    Write-Host "⚠ WARNING: $Message" -ForegroundColor Yellow
    $script:ValidationWarnings += $Message
}

# ====================================================================
# 1. Check SQL Server
# ====================================================================
Write-Host "`n1. Checking SQL Server..." -ForegroundColor Cyan

try {
    $sqlService = Get-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue
    if ($sqlService -and $sqlService.Status -eq "Running") {
        Log-ValidationResult "SQL Server Service" $true "Running"
    } else {
        Log-ValidationResult "SQL Server Service" $false "Not running or not found"
    }
} catch {
    Log-ValidationResult "SQL Server Service" $false $_.Exception.Message
}

# ====================================================================
# 2. Check IIS
# ====================================================================
Write-Host "`n2. Checking IIS..." -ForegroundColor Cyan

try {
    Import-Module WebAdministration -ErrorAction Stop
    $iisService = Get-Service -Name "W3SVC" -ErrorAction SilentlyContinue
    if ($iisService -and $iisService.Status -eq "Running") {
        Log-ValidationResult "IIS Service" $true "Running"
    } else {
        Log-ValidationResult "IIS Service" $false "Not running"
    }
} catch {
    Log-ValidationResult "IIS Service" $false $_.Exception.Message
}

# ====================================================================
# 3. Check Disk Space
# ====================================================================
Write-Host "`n3. Checking Disk Space..." -ForegroundColor Cyan

try {
    $drive = Get-PSDrive -Name C
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    
    if ($freeSpaceGB -gt 10) {
        Log-ValidationResult "Disk Space" $true "$freeSpaceGB GB available"
    } elseif ($freeSpaceGB -gt 5) {
        Log-ValidationResult "Disk Space" $true "$freeSpaceGB GB available"
        Log-Warning "Disk space is getting low. Consider cleanup."
    } else {
        Log-ValidationResult "Disk Space" $false "Only $freeSpaceGB GB available (minimum 5GB required)"
    }
} catch {
    Log-ValidationResult "Disk Space" $false $_.Exception.Message
}

# ====================================================================
# 4. Check Required Folders
# ====================================================================
Write-Host "`n4. Checking Required Folders..." -ForegroundColor Cyan

$requiredFolders = @(
    "C:\Deployments\Packages",
    "C:\Deployments\Backups",
    "C:\Deployments\Scripts",
    "C:\Deployments\Logs",
    "C:\DatabaseBackups\PreDeployment"
)

foreach ($folder in $requiredFolders) {
    if (Test-Path $folder) {
        Log-ValidationResult "Folder: $folder" $true "Exists"
    } else {
        Log-Warning "Folder $folder does not exist. Creating..."
        try {
            New-Item -ItemType Directory -Path $folder -Force | Out-Null
            Log-ValidationResult "Folder: $folder" $true "Created"
        } catch {
            Log-ValidationResult "Folder: $folder" $false "Failed to create"
        }
    }
}

# ====================================================================
# 5. Check .NET SDK
# ====================================================================
Write-Host "`n5. Checking .NET SDK..." -ForegroundColor Cyan

try {
    $dotnetVersion = dotnet --version 2>$null
    if ($dotnetVersion) {
        Log-ValidationResult ".NET SDK" $true "Version $dotnetVersion installed"
    } else {
        Log-ValidationResult ".NET SDK" $false "Not found"
    }
} catch {
    Log-ValidationResult ".NET SDK" $false "Not found or not in PATH"
}

# ====================================================================
# 6. Check Node.js
# ====================================================================
Write-Host "`n6. Checking Node.js..." -ForegroundColor Cyan

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Log-ValidationResult "Node.js" $true "Version $nodeVersion installed"
    } else {
        Log-ValidationResult "Node.js" $false "Not found"
    }
} catch {
    Log-ValidationResult "Node.js" $false "Not found or not in PATH"
}

# ====================================================================
# 7. Check Database Connection
# ====================================================================
Write-Host "`n7. Checking Database Connection..." -ForegroundColor Cyan

try {
    $connectionString = "Server=localhost;Database=KarmaTechAI_SAAS;Integrated Security=True;TrustServerCertificate=True"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    Log-ValidationResult "Database Connection" $true "Connected to KarmaTechAI_SAAS"
    $connection.Close()
} catch {
    Log-ValidationResult "Database Connection" $false $_.Exception.Message
}

# ====================================================================
# 8. Check IIS Sites
# ====================================================================
Write-Host "`n8. Checking IIS Sites..." -ForegroundColor Cyan

$requiredSites = @("api.karmatech-ai", "karmatech-ai")

foreach ($siteName in $requiredSites) {
    try {
        $site = Get-Website -Name $siteName -ErrorAction SilentlyContinue
        if ($site) {
            $state = $site.State
            Log-ValidationResult "IIS Site: $siteName" $true "State: $state"
        } else {
            Log-ValidationResult "IIS Site: $siteName" $false "Not found"
        }
    } catch {
        Log-ValidationResult "IIS Site: $siteName" $false $_.Exception.Message
    }
}

# ====================================================================
# Summary
# ====================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($script:ValidationErrors.Count -eq 0) {
    Write-Host "✓ All validation checks passed!" -ForegroundColor Green
    if ($script:ValidationWarnings.Count -gt 0) {
        Write-Host "`nWarnings:" -ForegroundColor Yellow
        foreach ($warning in $script:ValidationWarnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    Write-Host "`n✓ System is ready for deployment" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Validation failed with $($script:ValidationErrors.Count) error(s)" -ForegroundColor Red
    Write-Host "`nErrors:" -ForegroundColor Red
    foreach ($error in $script:ValidationErrors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host "`n✗ Please fix errors before deploying" -ForegroundColor Red
    exit 1
}
