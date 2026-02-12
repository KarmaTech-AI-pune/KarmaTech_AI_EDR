# Run-Integration-Tests.ps1
# Backend Integration/Unit Testing Script
# Using: dotnet test

$ErrorActionPreference = "Continue"
$ScriptPath = $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path $ScriptPath
$BackendSln = Join-Path $ProjectRoot "backend\NJS_backend.sln"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  STARTING BACKEND INTEGRATION TESTS      " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Solution Exists
if (-not (Test-Path $BackendSln)) {
    Write-Error "Solution file not found at: $BackendSln"
    exit 1
}

# 1. Restore
Write-Host "Step 1: Restoring NuGet Packages..." -ForegroundColor Yellow
dotnet restore $BackendSln
if ($LASTEXITCODE -ne 0) { throw "Restore failed" }

# 2. Test with Minimal Verbosity
Write-Host "`nStep 2: Running Tests..." -ForegroundColor Yellow
dotnet test $BackendSln --no-restore --verbosity minimal

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FAIL] Backend tests failed." -ForegroundColor Red
} else {
    Write-Host "`n[PASS] All backend tests passed." -ForegroundColor Green
}

Write-Host "==========================================" -ForegroundColor Cyan
