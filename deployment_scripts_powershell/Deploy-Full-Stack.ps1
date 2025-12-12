# =========================================
# FULL FRONTEND + BACKEND IIS DEPLOY SCRIPT
# =========================================

param(
    [switch]$DryRun
)

Import-Module WebAdministration

# -------------------------------
# CONFIGURATION - UPDATE THESE
# -------------------------------

# Frontend
$frontendZip      = "C:\zip file\frontend_8-12-25.zip"
$frontendPath     = "C:\inetpub\wwwroot\EDR_AdminUI"
$frontendBackup   = "C:\inetpub\wwwroot\Frontend_Backup"
$frontendSite     = "EDRAdminUI"

# Backend
$backendZip       = "C:\zip file\Backend_8-12-25.zip"
$backendPath      = "C:\inetpub\wwwroot\EDRAdmin_Api"
$backendBackup    = "C:\inetpub\wwwroot\EDRAdmin_Api_Backup"
$backendSite      = "EDRAdmin_Api"
$backendAppPool   = "EDRAdmin_Api"

$timeStamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "==============================================="
Write-Host " FRONTEND + BACKEND DEPLOYMENT STARTED "
Write-Host "Timestamp: $timeStamp"
Write-Host "==============================================="

if ($DryRun) {
    Write-Host "DRY RUN MODE ENABLED - No actual changes made."
}

# -------------------------------
# BACKUP FUNCTION
# -------------------------------
function Backup-Files {
    param($source, $destRoot)

    if ((Test-Path $source) -and ((Get-ChildItem $source -ErrorAction SilentlyContinue).Count -gt 0)) {
        $dest = Join-Path $destRoot $timeStamp
        Write-Host "Backing up: $source -> $dest"
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $dest -Force | Out-Null
            Copy-Item "$source\*" -Destination $dest -Recurse -Force
        }
        return $dest
    }
    else {
        Write-Host "No files found to back up at $source"
        return $null
    }
}

# =================================================
# FRONTEND DEPLOYMENT
# =================================================
Write-Host ""
Write-Host "===== FRONTEND DEPLOYMENT STARTED ====="

$frontendSiteCheck = Get-Website -Name $frontendSite -ErrorAction SilentlyContinue
if (-not $frontendSiteCheck) { Write-Error "Frontend site not found"; exit }

if (-not (Test-Path $frontendZip)) { Write-Error "Frontend ZIP file not found"; exit }

$frontendBackupPath = Backup-Files $frontendPath $frontendBackup

$feTemp = "C:\inetpub\wwwroot\temp_fe_$timeStamp"
Write-Host "Extracting frontend ZIP..."
if (-not $DryRun) {
    New-Item -ItemType Directory -Path $feTemp -Force | Out-Null
    Expand-Archive $frontendZip $feTemp -Force
}

$feDist = Get-ChildItem $feTemp -Recurse -Directory | Where-Object { $_.Name -eq "dist" } | Select-Object -First 1
if (-not $feDist) { Write-Error "dist folder not found in frontend ZIP"; exit }

Write-Host "Deploying Frontend files..."
if (-not $DryRun) {
    # Updated: Do not delete old files, only overwrite if newer
    robocopy $feDist.FullName $frontendPath /E /XO /MT:8 | Out-Null
}

$fePool = $frontendSiteCheck.ApplicationPool
Write-Host "Restarting Frontend AppPool: $fePool"
if (-not $DryRun) { Restart-WebAppPool -Name $fePool }

# NOTE: Frontend temp files are retained
Write-Host "Frontend temp files retained at: $feTemp"

# =================================================
# BACKEND DEPLOYMENT
# =================================================
Write-Host ""
Write-Host "===== BACKEND (API) DEPLOYMENT STARTED ====="

$backendSiteCheck = Get-Website -Name $backendSite -ErrorAction SilentlyContinue
if (-not $backendSiteCheck) { Write-Error "Backend site not found"; exit }

if (-not (Test-Path $backendZip)) { Write-Error "Backend ZIP file not found"; exit }

$backendBackupPath = Backup-Files $backendPath $backendBackup

# Backend temp folder = SiteName + Timestamp
$beTemp = "C:\inetpub\wwwroot\$($backendSite)_$timeStamp"
Write-Host "Extracting backend ZIP..."
if (-not $DryRun) {
    New-Item -ItemType Directory -Path $beTemp -Force | Out-Null
    Expand-Archive $backendZip $beTemp -Force
}

$bePublish = Join-Path $beTemp "publish"
if (-not (Test-Path $bePublish)) { Write-Error "publish folder not found in backend ZIP"; exit }

Write-Host "Stopping backend IIS services..."
if (-not $DryRun) {
    Stop-WebAppPool -Name $backendAppPool -ErrorAction SilentlyContinue
    Stop-Website -Name $backendSite -ErrorAction SilentlyContinue
}

Write-Host "Deploying Backend (API) files..."
if (-not $DryRun) {
    # Updated: Do not delete old files, only overwrite if newer
    robocopy $bePublish $backendPath /E /XO /MT:8 | Out-Null
}

Write-Host "Starting backend IIS services..."
if (-not $DryRun) {
    Start-WebAppPool -Name $backendAppPool
    Start-Website -Name $backendSite
}

# NOTE: Backend temp files are retained
Write-Host "Backend temp files retained at: $beTemp"

# =================================================
# FINAL STATUS
# =================================================
Write-Host ""
Write-Host "==============================================="
Write-Host " DEPLOYMENT COMPLETED SUCCESSFULLY "
Write-Host "==============================================="
Write-Host "Frontend Backup: $frontendBackupPath"
Write-Host "Backend Backup : $backendBackupPath"
Write-Host "Frontend Live  : $frontendPath"
Write-Host "Backend Live   : $backendPath"
Write-Host "Frontend Temp  : $feTemp"
Write-Host "Backend Temp   : $beTemp"
