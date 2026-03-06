# ============================================================================
# Regression & Integration Test Suite Runner
# ============================================================================
# Purpose: Automated testing framework for KarmaTech EDR
# Usage: .\test-suite\run-regression-tests.ps1 [-TestType All|Backend|Frontend|Quick]
# ============================================================================

param(
    [ValidateSet("All", "Backend", "Frontend", "Quick", "Unit", "Integration", "E2E")]
    [string]$TestType = "All",
    
    [switch]$GenerateReport,
    [switch]$FailFast,
    [switch]$Verbose,
    [string]$OutputDir = "test-results"
)

# Configuration
$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportFile = "$OutputDir/test-report-$timestamp.html"
$jsonReportFile = "$OutputDir/test-report-$timestamp.json"

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Failure { Write-Host $args -ForegroundColor Red }

# Test results storage
$testResults = @{
    StartTime = Get-Date
    Backend = @{
        Total = 0
        Passed = 0
        Failed = 0
        Skipped = 0
        Duration = 0
        Errors = @()
    }
    Frontend = @{
        Total = 0
        Passed = 0
        Failed = 0
        Skipped = 0
        Duration = 0
        Errors = @()
    }
}

# ============================================================================
# Backend Tests
# ============================================================================
function Run-BackendTests {
    param([string]$Filter = "")
    
    Write-Info "`n========================================`n  Running Backend Tests`n========================================"
    
    $backendStart = Get-Date
    
    try {
        Push-Location backend
        
        # Build first
        Write-Info "Building backend..."
        dotnet build --configuration Release --no-restore
        
        if ($LASTEXITCODE -ne 0) {
            Write-Failure "Backend build failed!"
            $testResults.Backend.Errors += "Build failed"
            return $false
        }
        
        # Run tests based on filter
        $testCommand = "dotnet test --no-build --configuration Release --logger `"console;verbosity=normal`" --logger `"trx;LogFileName=$OutputDir/backend-results-$timestamp.trx`""
        
        if ($Filter) {
            $testCommand += " --filter `"$Filter`""
        }
        
        if ($FailFast) {
            $testCommand += " --blame-crash"
        }
        
        Write-Info "Executing: $testCommand"
        $output = Invoke-Expression $testCommand 2>&1 | Out-String
        
        # Parse results
        if ($output -match "Total tests: (\d+)") {
            $testResults.Backend.Total = [int]$matches[1]
        }
        if ($output -match "Passed: (\d+)") {
            $testResults.Backend.Passed = [int]$matches[1]
        }
        if ($output -match "Failed: (\d+)") {
            $testResults.Backend.Failed = [int]$matches[1]
        }
        if ($output -match "Skipped: (\d+)") {
            $testResults.Backend.Skipped = [int]$matches[1]
        }
        
        $testResults.Backend.Duration = ((Get-Date) - $backendStart).TotalSeconds
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ Backend tests passed!"
            return $true
        } else {
            Write-Failure "✗ Backend tests failed!"
            $testResults.Backend.Errors += "Test execution failed"
            return $false
        }
        
    } catch {
        Write-Failure "Error running backend tests: $_"
        $testResults.Backend.Errors += $_.Exception.Message
        return $false
    } finally {
        Pop-Location
    }
}

# ============================================================================
# Frontend Tests
# ============================================================================
function Run-FrontendTests {
    param([string]$TestPattern = "")
    
    Write-Info "`n========================================`n  Running Frontend Tests`n========================================"
    
    $frontendStart = Get-Date
    
    try {
        Push-Location frontend
        
        # TypeScript compilation check
        Write-Info "Checking TypeScript compilation..."
        npx tsc -b
        
        if ($LASTEXITCODE -ne 0) {
            Write-Failure "TypeScript compilation failed!"
            $testResults.Frontend.Errors += "TypeScript compilation failed"
            return $false
        }
        
        # Run tests
        $testCommand = "npm test -- --run --reporter=json --outputFile=../$OutputDir/frontend-results-$timestamp.json"
        
        if ($TestPattern) {
            $testCommand += " --testNamePattern=`"$TestPattern`""
        }
        
        if ($Verbose) {
            $testCommand += " --reporter=verbose"
        }
        
        Write-Info "Executing: $testCommand"
        $output = Invoke-Expression $testCommand 2>&1 | Out-String
        
        # Parse results
        if ($output -match "Test Files\s+(\d+) failed \| (\d+) passed \((\d+)\)") {
            $testResults.Frontend.Failed = [int]$matches[1]
            $testResults.Frontend.Passed = [int]$matches[2]
            $testResults.Frontend.Total = [int]$matches[3]
        }
        if ($output -match "Tests\s+(\d+) failed \| (\d+) passed \((\d+)\)") {
            # More detailed test count
            $testResults.Frontend.Total = [int]$matches[3]
            $testResults.Frontend.Passed = [int]$matches[2]
            $testResults.Frontend.Failed = [int]$matches[1]
        }
        
        $testResults.Frontend.Duration = ((Get-Date) - $frontendStart).TotalSeconds
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ Frontend tests passed!"
            return $true
        } else {
            Write-Warning "⚠ Frontend tests completed with failures"
            return $false
        }
        
    } catch {
        Write-Failure "Error running frontend tests: $_"
        $testResults.Frontend.Errors += $_.Exception.Message
        return $false
    } finally {
        Pop-Location
    }
}

# ============================================================================
# Quick Smoke Tests
# ============================================================================
function Run-QuickTests {
    Write-Info "`n========================================`n  Running Quick Smoke Tests`n========================================"
    
    # Backend: Run only fast unit tests
    $backendResult = Run-BackendTests -Filter "Category=Unit&ExecutionTime<1000"
    
    # Frontend: Run only critical path tests
    $frontendResult = Run-FrontendTests -TestPattern "(Login|Dashboard|Navigation)"
    
    return ($backendResult -and $frontendResult)
}

# ============================================================================
# Generate HTML Report
# ============================================================================
function Generate-HtmlReport {
    $totalTests = $testResults.Backend.Total + $testResults.Frontend.Total
    $totalPassed = $testResults.Backend.Passed + $testResults.Frontend.Passed
    $totalFailed = $testResults.Backend.Failed + $testResults.Frontend.Failed
    $totalSkipped = $testResults.Backend.Skipped + $testResults.Frontend.Skipped
    $passRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 2) } else { 0 }
    
    $endTime = Get-Date
    $totalDuration = ($endTime - $testResults.StartTime).TotalSeconds
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - $timestamp</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .metric.success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .metric.warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .metric.info { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .metric-value { font-size: 36px; font-weight: bold; margin: 10px 0; }
        .metric-label { font-size: 14px; opacity: 0.9; }
        .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .pass { color: #27ae60; font-weight: bold; }
        .fail { color: #e74c3c; font-weight: bold; }
        .skip { color: #f39c12; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #3498db; color: white; }
        tr:hover { background: #f5f5f5; }
        .progress-bar { width: 100%; height: 30px; background: #ecf0f1; border-radius: 15px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%); transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .error-list { background: #fee; border-left: 4px solid #e74c3c; padding: 15px; margin: 10px 0; }
        .timestamp { color: #7f8c8d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test Execution Report</h1>
        <p class="timestamp">Generated: $($endTime.ToString('yyyy-MM-dd HH:mm:ss'))</p>
        <p class="timestamp">Duration: $([math]::Round($totalDuration, 2))s</p>
        
        <div class="summary">
            <div class="metric info">
                <div class="metric-label">Total Tests</div>
                <div class="metric-value">$totalTests</div>
            </div>
            <div class="metric success">
                <div class="metric-label">Passed</div>
                <div class="metric-value">$totalPassed</div>
            </div>
            <div class="metric warning">
                <div class="metric-label">Failed</div>
                <div class="metric-value">$totalFailed</div>
            </div>
            <div class="metric">
                <div class="metric-label">Pass Rate</div>
                <div class="metric-value">$passRate%</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: $passRate%">$passRate%</div>
        </div>
        
        <h2>📊 Backend Tests (.NET)</h2>
        <div class="section">
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Total Tests</td>
                    <td>$($testResults.Backend.Total)</td>
                </tr>
                <tr>
                    <td>Passed</td>
                    <td class="pass">$($testResults.Backend.Passed)</td>
                </tr>
                <tr>
                    <td>Failed</td>
                    <td class="fail">$($testResults.Backend.Failed)</td>
                </tr>
                <tr>
                    <td>Skipped</td>
                    <td class="skip">$($testResults.Backend.Skipped)</td>
                </tr>
                <tr>
                    <td>Duration</td>
                    <td>$([math]::Round($testResults.Backend.Duration, 2))s</td>
                </tr>
            </table>
            $(if ($testResults.Backend.Errors.Count -gt 0) {
                "<div class='error-list'><strong>Errors:</strong><ul>" + 
                ($testResults.Backend.Errors | ForEach-Object { "<li>$_</li>" }) -join "" + 
                "</ul></div>"
            })
        </div>
        
        <h2>⚛️ Frontend Tests (React/TypeScript)</h2>
        <div class="section">
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Total Tests</td>
                    <td>$($testResults.Frontend.Total)</td>
                </tr>
                <tr>
                    <td>Passed</td>
                    <td class="pass">$($testResults.Frontend.Passed)</td>
                </tr>
                <tr>
                    <td>Failed</td>
                    <td class="fail">$($testResults.Frontend.Failed)</td>
                </tr>
                <tr>
                    <td>Skipped</td>
                    <td class="skip">$($testResults.Frontend.Skipped)</td>
                </tr>
                <tr>
                    <td>Duration</td>
                    <td>$([math]::Round($testResults.Frontend.Duration, 2))s</td>
                </tr>
            </table>
            $(if ($testResults.Frontend.Errors.Count -gt 0) {
                "<div class='error-list'><strong>Errors:</strong><ul>" + 
                ($testResults.Frontend.Errors | ForEach-Object { "<li>$_</li>" }) -join "" + 
                "</ul></div>"
            })
        </div>
        
        <h2>✅ Verdict</h2>
        <div class="section">
            $(if ($totalFailed -eq 0) {
                "<p class='pass' style='font-size: 20px;'>✓ All tests passed! Ready for deployment.</p>"
            } else {
                "<p class='fail' style='font-size: 20px;'>✗ $totalFailed test(s) failed. Review required before deployment.</p>"
            })
        </div>
    </div>
</body>
</html>
"@
    
    $html | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Success "`nHTML report generated: $reportFile"
    
    # Also save JSON for CI/CD integration
    $testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonReportFile -Encoding UTF8
    Write-Success "JSON report generated: $jsonReportFile"
}

# ============================================================================
# Main Execution
# ============================================================================
Write-Info @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     KarmaTech EDR - Automated Test Suite Runner               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

Test Type: $TestType
Timestamp: $timestamp

"@

$overallSuccess = $true

switch ($TestType) {
    "Backend" {
        $overallSuccess = Run-BackendTests
    }
    "Frontend" {
        $overallSuccess = Run-FrontendTests
    }
    "Quick" {
        $overallSuccess = Run-QuickTests
    }
    "Unit" {
        $backendResult = Run-BackendTests -Filter "Category=Unit"
        $overallSuccess = $backendResult
    }
    "Integration" {
        $backendResult = Run-BackendTests -Filter "Category=Integration"
        $overallSuccess = $backendResult
    }
    "E2E" {
        Write-Info "E2E tests not yet implemented"
        $overallSuccess = $true
    }
    "All" {
        $backendResult = Run-BackendTests
        $frontendResult = Run-FrontendTests
        $overallSuccess = $backendResult -and $frontendResult
    }
}

# Generate report if requested
if ($GenerateReport) {
    Generate-HtmlReport
}

# Summary
Write-Info "`n========================================`n  Test Execution Summary`n========================================"
Write-Info "Backend:  $($testResults.Backend.Passed)/$($testResults.Backend.Total) passed"
Write-Info "Frontend: $($testResults.Frontend.Passed)/$($testResults.Frontend.Total) passed"

if ($overallSuccess) {
    Write-Success "`n✓ All tests passed successfully!`n"
    exit 0
} else {
    Write-Failure "`n✗ Some tests failed. Check the output above for details.`n"
    exit 1
}
