# File Name: PublishProject.ps1
# Usage: Right-click → Run with PowerShell or ./PublishProject.ps1

# -------------------------------
# CONFIGURATION
# -------------------------------
$scriptDir    = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Get-Location } # Fallback for some environments

$frontendPath = Join-Path $scriptDir "..\frontend"
$backendPath  = Join-Path $scriptDir "..\backend\src\EDR.API"
$publishPath  = Join-Path $backendPath "bin\Release\net8.0\publish"
$envName      = "Production"

Write-Host "Frontend Path: $frontendPath"
Write-Host "Backend Path:  $backendPath"
Write-Host "Publish Path:  $publishPath"

# -------------------------------
# CHECK IF LAST COMMAND SUCCEEDED
# -------------------------------
function Check-LastCommand {
    if (!$?) {
        Write-Host "❌ Last command failed. Stopping script."
        exit 1
    }
}

# -------------------------------
# STEP 1: Build React Frontend
# -------------------------------
Write-Host "🚀 Building React frontend..."
Set-Location $frontendPath

Write-Host "Installing npm dependencies..."
try {
    npm install --legacy-peer-deps
    if (!$?) { throw "npm install failed" }
} catch {
    Write-Host "⚠️ npm install failed. Attempting to clean node_modules and retry..."
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    }
    npm install --legacy-peer-deps
    Check-LastCommand
}

Write-Host "Running production build..."
npm run build
Check-LastCommand

Write-Host "✅ React build completed successfully."

# -------------------------------
# STEP 2: Publish .NET Backend
# -------------------------------
Write-Host "`n🏗️ Publishing .NET backend..."
Set-Location "$backendPath"

# Set environment variable
$env:ASPNETCORE_ENVIRONMENT = $envName

# Run publish command (explicit .csproj reference)
dotnet publish ".\EDR.API.csproj" -c Release -o "$publishPath"
Check-LastCommand

Write-Host "✅ .NET backend published successfully to '$publishPath'."

# -------------------------------
# DONE
# -------------------------------
Write-Host "`n🎉 All tasks completed! Project is now ready for deployment."
