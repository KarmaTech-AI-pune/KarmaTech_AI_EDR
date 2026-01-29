# ====================================================================
# Database Backup Script
# ====================================================================
# This script creates a backup of the SQL Server database before deployment

param(
    [string]$DatabaseName = "KarmaTechAI_SAAS",
    [string]$BackupPath = "C:\DatabaseBackups\PreDeployment",
    [string]$ServerInstance = "localhost"
)

$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Backup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create backup filename with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFileName = "${DatabaseName}_${timestamp}.bak"
$backupFullPath = Join-Path $BackupPath $backupFileName

Write-Host "Database: $DatabaseName" -ForegroundColor Gray
Write-Host "Server: $ServerInstance" -ForegroundColor Gray
Write-Host "Backup Path: $backupFullPath" -ForegroundColor Gray
Write-Host ""

# Ensure backup directory exists
if (-not (Test-Path $BackupPath)) {
    Write-Host "Creating backup directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

try {
    Write-Host "Starting database backup..." -ForegroundColor Cyan
    
    # Create SQL connection
    $connectionString = "Server=$ServerInstance;Database=master;Integrated Security=True;TrustServerCertificate=True"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    # Create backup command
    $backupQuery = @"
BACKUP DATABASE [$DatabaseName]
TO DISK = N'$backupFullPath'
WITH FORMAT, INIT, COMPRESSION,
NAME = N'$DatabaseName-Full Database Backup',
SKIP, NOREWIND, NOUNLOAD, STATS = 10
"@
    
    $command = $connection.CreateCommand()
    $command.CommandText = $backupQuery
    $command.CommandTimeout = 600 # 10 minutes timeout
    
    # Execute backup
    $startTime = Get-Date
    Write-Host "Executing backup..." -ForegroundColor Yellow
    $command.ExecuteNonQuery() | Out-Null
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    $connection.Close()
    
    # Verify backup file exists
    if (Test-Path $backupFullPath) {
        $fileSize = (Get-Item $backupFullPath).Length / 1MB
        Write-Host ""
        Write-Host "✓ Backup completed successfully!" -ForegroundColor Green
        Write-Host "  File: $backupFileName" -ForegroundColor Gray
        Write-Host "  Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
        Write-Host "  Duration: $($duration.ToString('mm\:ss'))" -ForegroundColor Gray
        Write-Host ""
        
        # Save backup info to log
        $logPath = "C:\Deployments\Logs\backup-log.txt"
        $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | SUCCESS | $backupFileName | $([math]::Round($fileSize, 2)) MB"
        Add-Content -Path $logPath -Value $logEntry
        
        # Return backup file path for use in other scripts
        return $backupFullPath
    } else {
        throw "Backup file was not created"
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Backup failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    # Log failure
    $logPath = "C:\Deployments\Logs\backup-log.txt"
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | FAILED | $($_.Exception.Message)"
    Add-Content -Path $logPath -Value $logEntry
    
    exit 1
} finally {
    if ($connection -and $connection.State -eq 'Open') {
        $connection.Close()
    }
}
