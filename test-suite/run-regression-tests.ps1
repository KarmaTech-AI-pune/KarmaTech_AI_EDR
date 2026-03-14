# ============================================================================
# Sequential Test Runner (Unit -> Regression -> Integration)
# ============================================================================
# Purpose: Runs all backend and frontend tests sequentially.
# It does NOT break on failures, but reports them at the end.
# Usage: .\test-suite\run-regression-tests.ps1
# ============================================================================

$ErrorActionPreference = "Continue"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$OutputDir = "test-results"

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$ReportFile = Join-Path $OutputDir "test-report-$Timestamp.html"

# Colors for output
function Write-Header { Write-Host "`n`n========================================`n  $args`n========================================" -ForegroundColor Cyan }
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Failure { Write-Host $args -ForegroundColor Red }

$TestResults = @{
    StartTime = Get-Date
    BackendUnit = @{ Total = 0; Passed = 0; Failed = 0; Skipped = 0; Duration = 0; Success = $false }
    FrontendUnit = @{ Total = 0; Passed = 0; Failed = 0; Skipped = 0; Duration = 0; Success = $false }
    BackendRegression = @{ Total = 0; Passed = 0; Failed = 0; Skipped = 0; Duration = 0; Success = $false }
    FrontendRegression = @{ Total = 0; Passed = 0; Failed = 0; Skipped = 0; Duration = 0; Success = $false }
    BackendIntegration = @{ Total = 0; Passed = 0; Failed = 0; Skipped = 0; Duration = 0; Success = $false }
    FrontendIntegration = @{ Total = 0; Passed = 0; Failed = 0; Skipped = 0; Duration = 0; Success = $false }
}

# ============================================================================
# Helper: Run Backend Tests
# ============================================================================
function Run-BackendTestPhase([string]$PhaseName, [string]$Filter) {
    Write-Header "Backend $PhaseName Tests"
    $startTime = Get-Date
    
    $resultObj = $TestResults."Backend$PhaseName"
    
    try {
        Push-Location backend
        
        Write-Info "Building backend (if needed)..."
        # We just build, ignore errors here so the test command can try to run
        dotnet build --configuration Release --no-restore > $null
        
        $testCommand = "dotnet test --no-build --configuration Release --logger `"console;verbosity=normal`" --logger `"trx;LogFileName=../$OutputDir/backend-$PhaseName.trx`" --filter `"$Filter`""
        
        Write-Info "Executing: $testCommand"
        $output = Invoke-Expression $testCommand 2>&1 | Out-String
        
        # Parse results
        if ($output -match 'Total tests: (\d+)') {
            $resultObj.Total = [int]$matches[1]
        }
        if ($output -match 'Passed: (\d+)') {
            $resultObj.Passed = [int]$matches[1]
        }
        if ($output -match 'Failed: (\d+)') {
            $resultObj.Failed = [int]$matches[1]
        }
        if ($output -match 'Skipped: (\d+)') {
            $resultObj.Skipped = [int]$matches[1]
        }
        
        $resultObj.Duration = ((Get-Date) - $startTime).TotalSeconds
        
        if ($LASTEXITCODE -eq 0 -and $resultObj.Failed -eq 0) {
            Write-Success "[PASS] Backend $PhaseName passed!"
            $resultObj.Success = $true
        } else {
            Write-Failure "[FAIL] Backend $PhaseName completed with failures! continuing..."
            $resultObj.Success = $false
        }
    } catch {
        Write-Failure "Error running backend $PhaseName tests: $_"
        $resultObj.Success = $false
    } finally {
        Pop-Location
    }
}

# ============================================================================
# Helper: Run Frontend Tests
# ============================================================================
function Run-FrontendTestPhase([string]$PhaseName, [string]$TestDirs) {
    Write-Header "Frontend $PhaseName Tests"
    $startTime = Get-Date
    
    $resultObj = $TestResults."Frontend$PhaseName"
    
    try {
        Push-Location frontend
        
        $testCommand = "npx vitest run $TestDirs --reporter=default --no-color"
        
        Write-Info "Executing: $testCommand"
        $output = Invoke-Expression $testCommand 2>&1 | Out-String
        
        # Parse results matching new vite output format
        if ($output -match 'Tests\s+(\d+)\s+failed\s*(?:\||)\s*(\d+)\s+passed\s+\((\d+)\)') {
            $resultObj.Failed = [int]$matches[1]
            $resultObj.Passed = [int]$matches[2]
            $resultObj.Total = [int]$matches[3]
        } elseif ($output -match 'Tests\s+(\d+)\s+passed\s+\((\d+)\)') {
            $resultObj.Passed = [int]$matches[1]
            $resultObj.Total = [int]$matches[2]
            $resultObj.Failed = 0
        }
        
        $resultObj.Duration = ((Get-Date) - $startTime).TotalSeconds
        
        if ($LASTEXITCODE -eq 0 -and $resultObj.Failed -eq 0) {
            Write-Success "[PASS] Frontend $PhaseName passed!"
            $resultObj.Success = $true
        } else {
            Write-Warning "[WARN] Frontend $PhaseName completed with failures! continuing..."
            $resultObj.Success = $false
        }
    } catch {
        Write-Failure "Error running frontend $PhaseName tests: $_"
        $resultObj.Success = $false
    } finally {
        Pop-Location
    }
}

# ============================================================================
# Print Summary
# ============================================================================
function Print-Summary {
    $endTime = Get-Date
    $totalDuration = ($endTime - $TestResults.StartTime).TotalSeconds
    
    Write-Header "Test Execution Summary"
    Write-Info "Duration: $([math]::Round($totalDuration, 2))s"
    Write-Info "------------------------------------------------------------"
    
    foreach ($k in $TestResults.Keys) {
        if ($k -eq "StartTime") { continue }
        $data = $TestResults.$k
        
        $statusStr = if ($data.Success) { "PASS" } else { "FAIL" }
        $color = if ($data.Success) { "Green" } else { "Red" }
        
        # Format: PhaseName | Total | Passed | Failed | Duration | Status
        $line = "{0,-20} | Total: {1,-4} | Pass: {2,-4} | Fail: {3,-4} | {4,5}s | {5}" -f `
            $k, $data.Total, $data.Passed, $data.Failed, [math]::Round($data.Duration, 1), $statusStr
            
        Write-Host $line -ForegroundColor $color
    }
}

# ============================================================================
# Main Execution Flow
# ============================================================================
Write-Header "KarmaTech EDR - Sequential Test Execution (Unit -> Regression -> Integration)"

# 1. UNIT TESTS
Run-BackendTestPhase -PhaseName "Unit" -Filter "(FullyQualifiedName~Controllers|FullyQualifiedName~Services|FullyQualifiedName~Repositories|FullyQualifiedName~Handlers|FullyQualifiedName~Validation)&(FullyQualifiedName!~Integration)&(FullyQualifiedName!~Regression)"
Run-FrontendTestPhase -PhaseName "Unit" -TestDirs "test/components/ test/features/ test/services/"

# 2. REGRESSION TESTS
Run-BackendTestPhase -PhaseName "Regression" -Filter "FullyQualifiedName~Regression"
Run-FrontendTestPhase -PhaseName "Regression" -TestDirs "test/regression/"

# 3. INTEGRATION TESTS
Run-BackendTestPhase -PhaseName "Integration" -Filter "FullyQualifiedName~Integration"
Run-FrontendTestPhase -PhaseName "Integration" -TestDirs "test/integration/"

# Print Summary
Print-Summary

# Determine overall success
$overallSuccess = $TestResults.BackendUnit.Success -and $TestResults.FrontendUnit.Success -and `
                  $TestResults.BackendRegression.Success -and $TestResults.FrontendRegression.Success -and `
                  $TestResults.BackendIntegration.Success -and $TestResults.FrontendIntegration.Success

Write-Header "Final Verdict"
if ($overallSuccess) {
    Write-Success "[PASS] All test phases passed!"
    exit 0
} else {
    Write-Failure "[FAIL] One or more test phases failed. Check summary above."
    exit 1
}
