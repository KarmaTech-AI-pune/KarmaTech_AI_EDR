# populate-wbs-options.ps1
# Script to populate the WBS options in the database

# Get the connection string from appsettings.json
$appSettingsPath = Join-Path $PSScriptRoot "src\NJSAPI\appsettings.Development.json"
$appSettings = Get-Content $appSettingsPath | ConvertFrom-Json
$connectionString = $appSettings.ConnectionStrings.DefaultConnection

# Extract server, database, and authentication info from connection string
$serverPattern = "Server=(.*?);"
$databasePattern = "Database=(.*?);"
$trustedPattern = "Trusted_Connection=(.*?);"
$integratedPattern = "Integrated Security=(.*?);"

$server = if ($connectionString -match $serverPattern) { $matches[1] } else { "localhost" }
$database = if ($connectionString -match $databasePattern) { $matches[1] } else { "NJSProjectManagement" }
$trustedConnection = if ($connectionString -match $trustedPattern) { $matches[1] -eq "True" } else { $false }
$integratedSecurity = if ($connectionString -match $integratedPattern) { $matches[1] -eq "True" } else { $false }

$useWindowsAuth = $trustedConnection -or $integratedSecurity

# Path to the SQL script
$sqlScriptPath = Join-Path $PSScriptRoot "Database\Input\WBSOptions.sql"

Write-Host "Populating WBS options in database $database on server $server using Windows Authentication..."

# Execute the SQL script using sqlcmd with Windows Authentication
sqlcmd -S $server -d $database -i $sqlScriptPath -E

if ($LASTEXITCODE -eq 0) {
    Write-Host "WBS options populated successfully!" -ForegroundColor Green
}
else {
    Write-Host "Error populating WBS options. Please check the SQL script and connection details." -ForegroundColor Red
}
