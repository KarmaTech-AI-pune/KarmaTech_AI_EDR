# Run-Regression-Tests.ps1
# Full Stack Regression Testing Script
# Runs: Backend Regression (dotnet test --filter Regression) AND Frontend Regression (vitest + playwright)

$ErrorActionPreference = "Continue"
$ScriptPath = $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path $ScriptPath
$BackendSln = Join-Path $ProjectRoot "backend\EDR_backend.sln"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  STARTING FULL REGRESSION SUITE          " -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan

$results = @()

# ---------------------------------------------------------
# 1. Backend Regression Tests (Filtered to Regression namespace)
# ---------------------------------------------------------
Write-Host "`nStep 1: Running Backend Regression Tests..." -ForegroundColor Yellow

if (Test-Path $BackendSln) {
    dotnet restore $BackendSln --verbosity quiet
    
    # Run ONLY tests in the Regression namespace
    dotnet test $BackendSln --no-restore --verbosity minimal `
        --filter "FullyQualifiedName~Regression" `
        --logger "trx;LogFileName=regression-results-$Timestamp.trx" `
        --results-directory "backend/EDR.API.Tests/TestResults"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] Backend regression tests failed." -ForegroundColor Red
        $results += @{ Component = "Backend Regression"; Status = "FAIL" }
    } else {
        Write-Host "[PASS] Backend regression tests passed." -ForegroundColor Green
        $results += @{ Component = "Backend Regression"; Status = "PASS" }
    }
} else {
    Write-Error "Backend solution not found at $BackendSln"
    $results += @{ Component = "Backend Regression"; Status = "SKIP" }
}

# ---------------------------------------------------------
# 2. Frontend Regression Tests (Vitest - regression folder)
# ---------------------------------------------------------
Write-Host "`nStep 2: Running Frontend Regression Tests (Vitest)..." -ForegroundColor Yellow

if (Test-Path $FrontendDir) {
    Push-Location $FrontendDir
    try {
        # Run only regression tests using vitest
        npx vitest run test/regression/ --reporter=verbose
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[FAIL] Frontend regression tests (Vitest) failed." -ForegroundColor Red
            $results += @{ Component = "Frontend Regression (Vitest)"; Status = "FAIL" }
        } else {
            Write-Host "[PASS] Frontend regression tests (Vitest) passed." -ForegroundColor Green
            $results += @{ Component = "Frontend Regression (Vitest)"; Status = "PASS" }
        }
    }
    finally {
        Pop-Location
    }
} else {
    Write-Error "Frontend directory not found at $FrontendDir"
    $results += @{ Component = "Frontend Regression (Vitest)"; Status = "SKIP" }
}

# ---------------------------------------------------------
# 3. E2E Regression Tests (Playwright - regression folder)
# ---------------------------------------------------------
Write-Host "`nStep 3: Running E2E Regression Tests (Playwright)..." -ForegroundColor Yellow

if (Test-Path $FrontendDir) {
    Push-Location $FrontendDir
    try {
        npx playwright test e2e/tests/regression/ --reporter=html
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[FAIL] E2E regression tests (Playwright) failed." -ForegroundColor Red
            $results += @{ Component = "E2E Regression (Playwright)"; Status = "FAIL" }
        } else {
            Write-Host "[PASS] E2E regression tests (Playwright) passed." -ForegroundColor Green
            $results += @{ Component = "E2E Regression (Playwright)"; Status = "PASS" }
        }
    }
    finally {
        Pop-Location
    }
} else {
    $results += @{ Component = "E2E Regression (Playwright)"; Status = "SKIP" }
}

# ---------------------------------------------------------
# Summary
# ---------------------------------------------------------
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  REGRESSION SUITE SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

foreach ($r in $results) {
    $color = switch ($r.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "SKIP" { "Yellow" }
    }
    Write-Host "  $($r.Component): $($r.Status)" -ForegroundColor $color
}

$failed = $results | Where-Object { $_.Status -eq "FAIL" }
if ($failed.Count -gt 0) {
    Write-Host "`n  Overall: FAILED ($($failed.Count) component(s) failed)" -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n  Overall: ALL PASSED" -ForegroundColor Green
    exit 0
}
