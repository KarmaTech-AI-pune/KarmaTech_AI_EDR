# ============================
# API Backup + Deployment Script (Final Fixed)
# ============================

# --- Configuration ---
$siteName = "  "       # The name of the IIS website you want to stop, back up, deploy, and restart
$appPoolName = "  "    # The name of the IIS application pool associated with the website
$wwwrootPath = "C:\inetpub\wwwroot"                 # Base path for deployment folders
$mainProjectPath = Join-Path $wwwrootPath "  "      # Live running project folder
$zipFilePath ="  "                                  # ZIP file path
$backupBasePath = "C:\inetpub\wwwroot\  "          # Backup storage location

# --- Step 1: Create backup folder ---
$currentDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolderName = $currentDate
$backupFolder = Join-Path $backupBasePath $backupFolderName
Write-Host "Creating backup folder: $backupFolder"
New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null

# --- Step 1.1: Backup current running live project ---
if (Test-Path $mainProjectPath) {
    Write-Host "Backing up current live project from $mainProjectPath to $backupFolder ..."
    Copy-Item -Path "$mainProjectPath\*" -Destination $backupFolder -Recurse -Force
    Write-Host "? Full backup completed successfully!"
} else {
    Write-Host "?? Live project folder not found. Skipping backup."
}

# --- Step 2: Check ZIP file ---
if (-not (Test-Path $zipFilePath)) {
    Write-Error "? ZIP file not found: $zipFilePath"
    exit
}

# --- Step 3: Create new deployment folder (SiteName + Date) ---
$newFolderName = "${siteName}_$currentDate"
$newDeployPath = Join-Path $wwwrootPath $newFolderName
Write-Host "Creating new deployment folder: $newDeployPath"
New-Item -ItemType Directory -Force -Path $newDeployPath | Out-Null

# --- Step 4: Stop IIS safely ---
Write-Host "Stopping IIS site and app pool..."
Import-Module WebAdministration
Try {
    Stop-WebAppPool -Name $appPoolName -ErrorAction SilentlyContinue
    Stop-Website -Name $siteName -ErrorAction SilentlyContinue
} Catch {
    Write-Warning "?? Error stopping IIS: $($_.Exception.Message)"
}

# --- Step 5: Extract ZIP into new deployment folder ---
Write-Host "Extracting ZIP contents into $newDeployPath ..."
Expand-Archive -Path $zipFilePath -DestinationPath $newDeployPath -Force
Write-Host "? Files extracted successfully!"

# --- Step 6: Copy 'publish' contents into main project folder ---
$publishFolder = Join-Path $newDeployPath "publish"

if (Test-Path $publishFolder) {
    Write-Host "Copying files from $publishFolder to $mainProjectPath ..."
    Copy-Item -Path "$publishFolder\*" -Destination $mainProjectPath -Recurse -Force
    Write-Host "? Files copied to live folder successfully!"
} else {
    Write-Warning "?? Publish folder not found in deployment folder: $publishFolder"
}

# --- Step 7: Start IIS again ---
Write-Host "Starting IIS site and app pool..."
Start-WebAppPool -Name $appPoolName
Start-Website -Name $siteName

Write-Host "? Deployment completed successfully!"
Write-Host "?? New Deployment Folder: $newDeployPath"
Write-Host "?? Backup stored at: $backupFolder"