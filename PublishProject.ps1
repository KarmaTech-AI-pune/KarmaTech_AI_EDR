# File Name: PublishProject.ps1
# Usage: Right-click → Run with PowerShell or ./PublishProject.ps1

# -------------------------------
# CONFIGURATION
# -------------------------------
$frontendPath = "D:\KSmartBiz\KarmaTech_AI_EDR\frontend\"     # React app folder
$backendPath  = "D:\KSmartBiz\KarmaTech_AI_EDR\backend\src\NJSAPI"  # Main .NET project folder
$publishPath  = "D:\KSmartBiz\KarmaTech_AI_EDR\backend\src\NJSAPI\bin\Release\net8.0\publish"       # Publish output folder
$envName      = "Production"      # Environment: Development/Production

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
npm install --legacy-peer-deps
Check-LastCommand

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
dotnet publish ".\NJSAPI.csproj" -c Release -o "$publishPath"
Check-LastCommand

Write-Host "✅ .NET backend published successfully to '$publishPath'."

# -------------------------------
# DONE
# -------------------------------
Write-Host "`n🎉 All tasks completed! Project is now ready for deployment."
