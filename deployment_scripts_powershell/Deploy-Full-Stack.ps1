param(
    [switch]$DryRun        # Optional flag to simulate the script
)

# Import IIS management module
Import-Module WebAdministration -ErrorAction Stop


# ------------------------------------------------
# CONFIGURATION SECTION - UPDATE PATHS IF NEEDED
# ------------------------------------------------

# Frontend (Admin UI) Configuration
$frontendZip      = "C:\inetpub\wwwroot\frontend_12-12-2025.zip"
$frontendPath     = "C:\inetpub\wwwroot\Edradmin"
$frontendBackup   = "C:\inetpub\wwwroot\EdrAdmin_UI_Backup"
$frontendSite     = "EdrAdmin"

# Tenant UI Configuration (Uses same Frontend build)
$tenantPath       = "C:\inetpub\wwwroot\multiTennatUI"
$tenantSite       = "multiTennatUI"

# Backend (API) Configuration
$backendZip       = "C:\inetpub\wwwroot\Backend_10-12-2025.zip"
$backendPath      = "C:\inetpub\wwwroot\Edradmin\API"
$backendBackup    = "C:\inetpub\wwwroot\EDRAdminAPI_Backup"
$backendSite      = "EdrAdminAPI"
$backendAppPool   = "EdrAdminAPI"


# Generate timestamp for folders and logs
$timeStamp = Get-Date -Format "yyyy-MM-dd_hh-mm-ss_tt"

Write-Host "==============================================="
Write-Host " DEPLOYMENT STARTED  (Frontend + Backend + Tenant)"
Write-Host " Timestamp: $timeStamp"
Write-Host "==============================================="

if ($DryRun) {
    Write-Host "DRY RUN MODE ENABLED - No real changes will be made"
}


# ------------------------------------------------
# FUNCTION: Backup-Files
# PURPOSE : Create timestamped backup of a folder
# ------------------------------------------------
function Backup-Files {
    param($source, $destRoot)

    if ((Test-Path $source) -and ((Get-ChildItem $source -ErrorAction SilentlyContinue).Count -gt 0)) {
        $dest = Join-Path $destRoot $timeStamp

        Write-Host "Creating backup: $source  ->  $dest"

        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $dest -Force | Out-Null
            robocopy $source $dest /E /R:2 /W:2 | Out-Null
        }

        return $dest
    }
    else {
        Write-Host "Backup skipped: No files found at $source"
        return $null
    }
}


# ==========================================================
# FRONTEND DEPLOYMENT  (Shared for Admin UI + Tenant UI)
# ==========================================================
Write-Host ""
Write-Host "===== FRONTEND BUILD DEPLOYMENT STARTED ====="

$frontendSiteCheck = Get-Website -Name $frontendSite -ErrorAction SilentlyContinue
$tenantSiteCheck   = Get-Website -Name $tenantSite -ErrorAction SilentlyContinue

if (-not $frontendSiteCheck) { throw "Frontend IIS site not found" }
if (-not $tenantSiteCheck)   { throw "Tenant IIS site not found" }

if (-not (Test-Path $frontendZip)) { throw "Frontend ZIP file not found" }

# Backup only Frontend
$frontendBackupPath = Backup-Files $frontendPath $frontendBackup


# Create temporary folder and extract ZIP
$feTemp = "C:\inetpub\wwwroot\temp_fe_$timeStamp"
Write-Host "Extracting Frontend ZIP to temp folder: $feTemp"

if (-not $DryRun) {
    New-Item -ItemType Directory -Path $feTemp -Force | Out-Null
    Expand-Archive $frontendZip $feTemp -Force
}

# Locate 'dist' folder inside extracted content
$feDist = Get-ChildItem $feTemp -Recurse -Directory |
          Where-Object { $_.Name -eq "dist" } |
          Select-Object -First 1

if (-not $feDist) { throw "'dist' folder not found inside Frontend ZIP" }

# Copy build files to Frontend (Admin UI)
Write-Host "Deploying Frontend files to Admin UI..."
if (-not $DryRun) {
    robocopy $feDist.FullName $frontendPath /E /XO /MT:8 /R:2 /W:2 | Out-Null
}

# Copy same build files to Tenant UI
Write-Host "Deploying same Frontend files to Tenant UI..."
if (-not $DryRun) {
    robocopy $feDist.FullName $tenantPath /E /XO /MT:8 /R:2 /W:2 | Out-Null
}

# Restart AppPools for both UI sites
$fePool     = $frontendSiteCheck.ApplicationPool
$tenantPool = $tenantSiteCheck.ApplicationPool

Write-Host "Restarting Frontend Application Pool: $fePool"
Write-Host "Restarting Tenant Application Pool: $tenantPool"

if (-not $DryRun) {
    Restart-WebAppPool -Name $fePool
    Restart-WebAppPool -Name $tenantPool
}

Write-Host "Frontend temp folder retained at: $feTemp"


# ==========================================================
# BACKEND (API) DEPLOYMENT
# ==========================================================
Write-Host ""
Write-Host "===== BACKEND DEPLOYMENT STARTED ====="

$backendSiteCheck = Get-Website -Name $backendSite -ErrorAction SilentlyContinue
if (-not $backendSiteCheck) { throw "Backend IIS site not found" }

if (-not (Test-Path $backendZip)) { throw "Backend ZIP file not found" }

$backendBackupPath = Backup-Files $backendPath $backendBackup

$beTemp = "C:\inetpub\wwwroot\$($backendSite)_$timeStamp"
Write-Host "Extracting Backend ZIP to: $beTemp"

if (-not $DryRun) {
    New-Item -ItemType Directory -Path $beTemp -Force | Out-Null
    Expand-Archive $backendZip $beTemp -Force
}

$bePublish = Join-Path $beTemp "publish"
if (-not (Test-Path $bePublish)) { throw "'publish' folder not found in backend ZIP" }

Write-Host "Stopping Backend Website and AppPool..."
if (-not $DryRun) {
    Stop-WebAppPool -Name $backendAppPool -ErrorAction SilentlyContinue
    Stop-Website -Name $backendSite -ErrorAction SilentlyContinue
}

Write-Host "Deploying Backend files..."
if (-not $DryRun) {
    robocopy $bePublish $backendPath /E /XO /MT:8 /R:2 /W:2 | Out-Null
}

Write-Host "Starting Backend Website and AppPool..."
if (-not $DryRun) {
    Start-WebAppPool -Name $backendAppPool
    Start-Website -Name $backendSite
}

Write-Host "Backend temp folder retained at: $beTemp"


# ==========================================================
# FINAL STATUS
# ==========================================================
Write-Host ""
Write-Host "==============================================="
Write-Host " ? DEPLOYMENT COMPLETED SUCCESSFULLY "
Write-Host "==============================================="
Write-Host "Frontend Backup : $frontendBackupPath"
Write-Host "Backend Backup  : $backendBackupPath"
Write-Host "Frontend Live   : $frontendPath"
Write-Host "Tenant Live     : $tenantPath"
Write-Host "Backend Live    : $backendPath"
Write-Host "Frontend Temp   : $feTemp"
Write-Host "Backend Temp    : $beTemp"
