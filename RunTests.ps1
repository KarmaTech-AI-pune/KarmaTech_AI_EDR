# File Name: RunTests.ps1
# Usage: ./RunTests.ps1
# Description: Runs all project tests (Frontend & Backend) to verify build health.

$ErrorActionPreference = "Stop"

function Print-Header($message) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host " $message" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Command($taskName) {
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ $taskName FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    } else {
        Write-Host "✅ $taskName PASSED" -ForegroundColor Green
    }
}

# 1. Frontend Tests
Print-Header "STARTING FRONTEND TESTS"
$frontendPath = "frontend"

if (Test-Path $frontendPath) {
    Push-Location $frontendPath
    try {
        Write-Host "Running: npm install (ensuring dependencies)..." -ForegroundColor Yellow
        # Using npm ci if package-lock.json exists for cleaner installs in CI, else install
        if (Test-Path "package-lock.json") {
             npm ci --legacy-peer-deps
        } else {
             npm install --legacy-peer-deps
        }
        
        Write-Host "Running: npm run test..." -ForegroundColor Yellow
        # Assuming "test" script runs vitest run or similar single-run command
        npm run test
        Check-Command "Frontend Tests"
    }
    finally {
        Pop-Location
    }
} else {
    Write-Host "⚠️ Frontend directory not found!" -ForegroundColor Yellow
}

# 2. Backend Tests (.NET)
Print-Header "STARTING BACKEND TESTS (.NET)"
$backendSolution = "backend/NJS_backend.sln"

if (Test-Path $backendSolution) {
    Write-Host "Running: dotnet test..." -ForegroundColor Yellow
    dotnet test "$backendSolution" --verbosity minimal
    Check-Command "Backend .NET Tests"
} else {
    Write-Host "⚠️ Backend solution file not found at $backendSolution!" -ForegroundColor Red
    exit 1
}

Print-Header "🎉 ALL TESTS PASSED SUCCESSFULLY"
exit 0
