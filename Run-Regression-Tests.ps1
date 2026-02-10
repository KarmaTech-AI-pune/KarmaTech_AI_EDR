# Run-Regression-Tests.ps1
# Full Stack Regression Testing Script
# Runs: Backend (dotnet test) AND Frontend (npm test)

$ErrorActionPreference = "Continue"
$ScriptPath = $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path $ScriptPath
$BackendSln = Join-Path $ProjectRoot "backend\NJS_backend.sln"
$FrontendDir = Join-Path $ProjectRoot "frontend"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  STARTING FULL REGRESSION SUITE          " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# ---------------------------------------------------------
# 1. Backend Tests
# ---------------------------------------------------------
Write-Host "Step 1: Running Backend Tests..." -ForegroundColor Yellow

if (Test-Path $BackendSln) {
    dotnet restore $BackendSln
    dotnet test $BackendSln --no-restore --verbosity minimal
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] Backend tests failed." -ForegroundColor Red
    } else {
        Write-Host "[PASS] Backend tests passed." -ForegroundColor Green
    }
} else {
    Write-Error "Backend solution not found at $BackendSln"
}

# ---------------------------------------------------------
# 2. Frontend Tests
# ---------------------------------------------------------
Write-Host "`nStep 2: Running Frontend Tests..." -ForegroundColor Yellow

if (Test-Path $FrontendDir) {
    Push-Location $FrontendDir
    try {
        # Standard npm test (vitest) without timeouts
        # Using -- to pass arguments if needed, but keeping it clean here
        npm test
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[FAIL] Frontend tests failed." -ForegroundColor Red
        } else {
            Write-Host "[PASS] Frontend tests passed." -ForegroundColor Green
        }
    }
    finally {
        Pop-Location
    }
} else {
    Write-Error "Frontend directory not found at $FrontendDir"
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  REGRESSION SUITE COMPLETE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
