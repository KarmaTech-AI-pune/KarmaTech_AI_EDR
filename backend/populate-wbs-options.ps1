# populate-wbs-options.ps1
# Script to populate the WBS options in the database

# Get the appsettings.json path
$appSettingsPath = Join-Path $PSScriptRoot "src\NJSAPI\appsettings.json"

# Check if the file exists
if (-not (Test-Path $appSettingsPath)) {
    # Try Dev version if regular one doesn't exist
    $appSettingsPath = Join-Path $PSScriptRoot "src\NJSAPI\appsettings.Dev.json"
    if (-not (Test-Path $appSettingsPath)) {
        Write-Host "Error: Could not find appsettings.json or appsettings.Dev.json" -ForegroundColor Red
        exit 1
    }
}

# Path to the SQL script
$sqlScriptPath = Join-Path $PSScriptRoot "Database\Input\WBSOptions.sql"

# Check if SQL script exists
if (-not (Test-Path $sqlScriptPath)) {
    Write-Host "Error: Could not find SQL script at $sqlScriptPath" -ForegroundColor Red
    exit 1
}

# Get server name from config file
$appSettings = Get-Content $appSettingsPath | ConvertFrom-Json
$server = "localhost" # Default value

# Try to extract server name from connection string if available
if ($appSettings.ConnectionStrings.AppDbConnection) {
    $connectionString = $appSettings.ConnectionStrings.AppDbConnection
    if ($connectionString -match "Server=(.*?);") {
        $server = $matches[1]
    }
}

# Get database name from config file
$database = "NJSAPIProjectManagement" # Default value
if ($connectionString -match "Database=(.*?);") {
    $database = $matches[1]
}

Write-Host "Populating WBS options in database $database on server $server..." -ForegroundColor Cyan

# Execute the SQL script using sqlcmd with Windows Authentication
Write-Host "Executing SQL script: $sqlScriptPath" -ForegroundColor Cyan
sqlcmd -S $server -d $database -i $sqlScriptPath -E

if ($LASTEXITCODE -eq 0) {
    Write-Host "WBS options populated successfully!" -ForegroundColor Green
}
else {
    Write-Host "Error populating WBS options. Exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Please check that:"
    Write-Host "1. SQL Server is running"
    Write-Host "2. The database '$database' exists"
    Write-Host "3. You have permissions to modify the database"
    Write-Host "4. The SQL script is valid"
}
