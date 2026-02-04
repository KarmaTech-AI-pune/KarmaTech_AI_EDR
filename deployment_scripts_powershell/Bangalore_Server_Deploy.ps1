# =========================================================
# Script: Bangalore_Server_Deploy.ps1
# Purpose:
#   1. Take automatic backup of IIS site
#   2. Allow user to choose folder via Dialog OR manual path
#   3. Stop IIS Website
#   4. Copy files (overwrite only, no delete)
#   5. Start IIS Website
# =========================================================

# Enable UTF-8 encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Load required modules
Add-Type -AssemblyName System.Windows.Forms
Import-Module WebAdministration

# ----------------------------
# IIS Configuration
# ----------------------------
$SiteName   = "KarmaTechApp"
$IISPath    = "C:\inetpub\wwwroot\KarmaTechApp"
$BackupRoot = "C:\inetpub\wwwroot\KarmaTechApp_Backup"

# ----------------------------
# Step 1: Stop IIS Website
# ----------------------------
if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
    Write-Host "Stopping IIS Website..."
    Stop-Website -Name $SiteName
}

# ----------------------------
# Step 2: Create Backup
# ----------------------------
if (!(Test-Path $BackupRoot)) {
    New-Item -ItemType Directory -Path $BackupRoot | Out-Null
}

$timestamp    = Get-Date -Format "dd-MM-yyyy_hh-mm-ss_tt"
$backupFolder = Join-Path $BackupRoot "$SiteName-backup-$timestamp"

Write-Host "Taking backup to: $backupFolder"
Copy-Item $IISPath $backupFolder -Recurse -Force

# ----------------------------
# Step 3: Choose input method
# ----------------------------
Write-Host ""
Write-Host "Choose how you want to select the source folder:"
Write-Host "1 - Use Folder Selection Dialog"
Write-Host "2 - Enter Folder Path Manually"

$choice = Read-Host "Enter your choice (1 or 2)"

$sourcePath = ""

if ($choice -eq "1") {
    # Dialog Box Method
    $folderDialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $folderDialog.Description = "Select the folder that contains extracted files"

    if ($folderDialog.ShowDialog() -eq "OK") {
        $sourcePath = $folderDialog.SelectedPath
    }
}
elseif ($choice -eq "2") {
    # Manual Path Method
    $sourcePath = Read-Host "Enter full path of extracted folder (e.g. D:\Deploy\KarmaTechApp)"
}

# Validate Source Path
if ([string]::IsNullOrWhiteSpace($sourcePath) -or !(Test-Path $sourcePath)) {
    Write-Host "❌ Invalid folder path. Script stopped."
    exit
}

Write-Host "Source Folder Selected: $sourcePath"

# ----------------------------
# Step 4: Deploy Files (Overwrite Only)
# ----------------------------
Write-Host "Deploying files to IIS site..."

$items = Get-ChildItem -Path $sourcePath -Recurse

foreach ($item in $items) {

    $relativePath = $item.FullName.Substring($sourcePath.Length)
    $destination  = Join-Path $IISPath $relativePath

    if ($item.PSIsContainer) {
        if (!(Test-Path $destination)) {
            New-Item -ItemType Directory -Path $destination | Out-Null
        }
    }
    else {
        Copy-Item -Path $item.FullName -Destination $destination -Force
    }
}

# ----------------------------
# Step 5: Start IIS Website
# ----------------------------
if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
    Write-Host "Starting IIS Website..."
    Start-Website -Name $SiteName
}

Write-Host ""
Write-Host "✅ Deployment completed successfully (Backup + Overwrite only, no delete)!"
cd 
