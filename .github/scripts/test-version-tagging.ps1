# Test Script for Version Tagging Functionality
# Tests all environment tagging scenarios

# Test counters
$script:TestsRun = 0
$script:TestsPassed = 0
$script:TestsFailed = 0

# Function to print colored output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
}

function Write-Test {
    param([string]$Message)
    Write-Host "[TEST] $Message" -ForegroundColor Cyan
}

# Function to verify tag format
function Test-TagFormat {
    param(
        [string]$Tag,
        [string]$ExpectedEnv
    )
    
    # Expected format: v{MAJOR}.{MINOR}.{PATCH}-{ENV}.{DATE}.{BUILD}
    # Example: v1.3.0-dev.20241209.1
    
    $pattern = "^v\d+\.\d+\.\d+-$ExpectedEnv\.\d{8}\.\d+$"
    
    if ($Tag -match $pattern) {
        return $true
    } else {
        Write-Error "Tag format incorrect: $Tag"
        Write-Error "Expected format: v{MAJOR}.{MINOR}.{PATCH}-$ExpectedEnv.{DATE}.{BUILD}"
        return $false
    }
}

# Function to verify clean production tag format
function Test-CleanTagFormat {
    param([string]$Tag)
    
    # Expected format: v{MAJOR}.{MINOR}.{PATCH}
    # Example: v1.3.0
    
    $pattern = "^v\d+\.\d+\.\d+$"
    
    if ($Tag -match $pattern) {
        return $true
    } else {
        Write-Error "Clean tag format incorrect: $Tag"
        Write-Error "Expected format: v{MAJOR}.{MINOR}.{PATCH}"
        return $false
    }
}

# Function to extract environment from tag
function Get-EnvironmentFromTag {
    param([string]$Tag)
    
    if ($Tag -match 'v\d+\.\d+\.\d+-([^.]+)\.') {
        return $Matches[1]
    }
    return $null
}

# Function to extract build number from tag
function Get-BuildNumberFromTag {
    param([string]$Tag)
    
    if ($Tag -match '\.(\d+)$') {
        return [int]$Matches[1]
    }
    return 0
}

# Function to run the version tagging script
function Invoke-VersionTagging {
    param(
        [string]$Branch,
        [string]$Increment = "patch"
    )
    
    # Set environment variables
    $env:BRANCH_NAME = $Branch
    $env:VERSION_INCREMENT = $Increment
    $env:COMMIT_SHA = "HEAD"
    
    # Run the version tagging script
    $output = & bash .github/scripts/create-version-tag.sh 2>&1
    
    return $output
}

# Main test suite
function Start-TestSuite {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host "  Version Tagging Test Suite" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Ensure we're in the repository root
    if (-not (Test-Path ".github/scripts/create-version-tag.sh")) {
        Write-Error "Must run from repository root"
        exit 1
    }
    
    Write-Info "Starting test suite..."
    Write-Host ""
    
    # Get current date
    $today = Get-Date -Format "yyyyMMdd"
    
    # ========================================
    # Test 1: Dev Environment Tag Format
    # ========================================
    Write-Test "Test 1: Dev deployment creates correct tag format"
    $script:TestsRun++
    
    try {
        $output = Invoke-VersionTagging -Branch "Saas/dev" -Increment "patch"
        $outputStr = $output -join "`n"
        
        # Extract version tag from output
        if ($outputStr -match 'VERSION_TAG=(.+)') {
            $devTag = $Matches[1].Trim()
            
            if (Test-TagFormat -Tag $devTag -ExpectedEnv "dev") {
                $script:TestsPassed++
                Write-Success "PASSED: Dev tag format correct: $devTag"
            } else {
                $script:TestsFailed++
                Write-Error "FAILED: Dev tag format incorrect: $devTag"
            }
        } else {
            $script:TestsFailed++
            Write-Error "FAILED: No dev tag created"
        }
    } catch {
        $script:TestsFailed++
        Write-Error "FAILED: Exception during test: $_"
    }
    Write-Host ""
    
    # ========================================
    # Test 2: Staging Environment Tag Format
    # ========================================
    Write-Test "Test 2: Staging deployment creates correct tag format"
    $script:TestsRun++
    
    try {
        $output = Invoke-VersionTagging -Branch "staging" -Increment "patch"
        $outputStr = $output -join "`n"
        
        # Extract version tag from output
        if ($outputStr -match 'VERSION_TAG=(.+)') {
            $stagingTag = $Matches[1].Trim()
            
            if (Test-TagFormat -Tag $stagingTag -ExpectedEnv "staging") {
                $script:TestsPassed++
                Write-Success "PASSED: Staging tag format correct: $stagingTag"
            } else {
                $script:TestsFailed++
                Write-Error "FAILED: Staging tag format incorrect: $stagingTag"
            }
        } else {
            $script:TestsFailed++
            Write-Error "FAILED: No staging tag created"
        }
    } catch {
        $script:TestsFailed++
        Write-Error "FAILED: Exception during test: $_"
    }
    Write-Host ""
    
    # ========================================
    # Test 3: Production Environment Tags
    # ========================================
    Write-Test "Test 3: Production deployment creates both environment and clean tags"
    $script:TestsRun++
    
    try {
        $output = Invoke-VersionTagging -Branch "main" -Increment "patch"
        $outputStr = $output -join "`n"
        
        # Extract version tag and version from output
        $prodTag = $null
        $version = $null
        
        if ($outputStr -match 'VERSION_TAG=(.+)') {
            $prodTag = $Matches[1].Trim()
        }
        if ($outputStr -match '^VERSION=(.+)') {
            $version = $Matches[1].Trim()
        }
        
        if ($prodTag -and $version) {
            # Check environment-specific tag
            if (Test-TagFormat -Tag $prodTag -ExpectedEnv "prod") {
                Write-Success "Production environment tag format correct: $prodTag"
                
                # Check if clean tag exists
                $cleanTag = "v$version"
                $tagExists = git rev-parse $cleanTag 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    if (Test-CleanTagFormat -Tag $cleanTag) {
                        $script:TestsPassed++
                        Write-Success "PASSED: Both tags created - $prodTag and $cleanTag"
                    } else {
                        $script:TestsFailed++
                        Write-Error "FAILED: Clean tag format incorrect: $cleanTag"
                    }
                } else {
                    $script:TestsFailed++
                    Write-Error "FAILED: Clean tag not created: $cleanTag"
                }
            } else {
                $script:TestsFailed++
                Write-Error "FAILED: Production tag format incorrect: $prodTag"
            }
        } else {
            $script:TestsFailed++
            Write-Error "FAILED: No production tag created"
        }
    } catch {
        $script:TestsFailed++
        Write-Error "FAILED: Exception during test: $_"
    }
    Write-Host ""
    
    # ========================================
    # Test 4: Multiple Deployments Same Day
    # ========================================
    Write-Test "Test 4: Multiple deployments same day increment build number"
    $script:TestsRun++
    
    try {
        # First deployment
        $output1 = Invoke-VersionTagging -Branch "Saas/dev" -Increment "patch"
        $outputStr1 = $output1 -join "`n"
        
        if ($outputStr1 -match 'VERSION_TAG=(.+)') {
            $tag1 = $Matches[1].Trim()
            $build1 = Get-BuildNumberFromTag -Tag $tag1
            Write-Info "First deployment tag: $tag1 (build: $build1)"
            
            # Second deployment (same day)
            Start-Sleep -Seconds 2
            $output2 = Invoke-VersionTagging -Branch "Saas/dev" -Increment "patch"
            $outputStr2 = $output2 -join "`n"
            
            if ($outputStr2 -match 'VERSION_TAG=(.+)') {
                $tag2 = $Matches[1].Trim()
                $build2 = Get-BuildNumberFromTag -Tag $tag2
                Write-Info "Second deployment tag: $tag2 (build: $build2)"
                
                # Verify build number incremented
                if ($build2 -gt $build1) {
                    $script:TestsPassed++
                    Write-Success "PASSED: Build number incremented from $build1 to $build2"
                } else {
                    $script:TestsFailed++
                    Write-Error "FAILED: Build number did not increment (was $build1, now $build2)"
                }
            } else {
                $script:TestsFailed++
                Write-Error "FAILED: Second deployment did not create tag"
            }
        } else {
            $script:TestsFailed++
            Write-Error "FAILED: First deployment did not create tag"
        }
    } catch {
        $script:TestsFailed++
        Write-Error "FAILED: Exception during test: $_"
    }
    Write-Host ""
    
    # ========================================
    # Test 5: Tags Visible in GitHub
    # ========================================
    Write-Test "Test 5: Verify tags are visible in GitHub repository"
    $script:TestsRun++
    
    try {
        # Fetch all tags from remote
        git fetch --tags --quiet 2>$null
        
        # Check if recent tags exist
        $recentTags = git tag -l "v*-dev.$today.*" 2>$null
        $tagCount = ($recentTags | Measure-Object).Count
        
        if ($tagCount -gt 0) {
            $script:TestsPassed++
            Write-Success "PASSED: Found $tagCount tag(s) in repository"
            
            # List recent tags
            Write-Info "Recent dev tags:"
            $recentTags | Select-Object -Last 5 | ForEach-Object { Write-Host "  $_" }
        } else {
            $script:TestsFailed++
            Write-Error "FAILED: No tags found in repository"
        }
    } catch {
        $script:TestsFailed++
        Write-Error "FAILED: Exception during test: $_"
    }
    Write-Host ""
    
    # ========================================
    # Test 6: Environment Detection
    # ========================================
    Write-Test "Test 6: Verify environment detection from branch names"
    $script:TestsRun++
    
    $testCases = @(
        @{ Branch = "Saas/dev"; Expected = "dev" },
        @{ Branch = "staging"; Expected = "staging" },
        @{ Branch = "qa"; Expected = "qa" },
        @{ Branch = "main"; Expected = "prod" }
    )
    
    $envTestsPassed = 0
    $envTestsTotal = $testCases.Count
    
    foreach ($testCase in $testCases) {
        try {
            $output = Invoke-VersionTagging -Branch $testCase.Branch -Increment "patch"
            $outputStr = $output -join "`n"
            
            if ($outputStr -match 'VERSION_TAG=(.+)') {
                $tag = $Matches[1].Trim()
                $actualEnv = Get-EnvironmentFromTag -Tag $tag
                
                if ($actualEnv -eq $testCase.Expected) {
                    $envTestsPassed++
                    Write-Success "  ✓ Branch '$($testCase.Branch)' → Environment '$actualEnv'"
                } else {
                    Write-Error "  ✗ Branch '$($testCase.Branch)' → Expected '$($testCase.Expected)', got '$actualEnv'"
                }
            }
        } catch {
            Write-Error "  ✗ Branch '$($testCase.Branch)' → Exception: $_"
        }
    }
    
    if ($envTestsPassed -eq $envTestsTotal) {
        $script:TestsPassed++
        Write-Success "PASSED: All environment detections correct ($envTestsPassed/$envTestsTotal)"
    } else {
        $script:TestsFailed++
        Write-Error "FAILED: Some environment detections incorrect ($envTestsPassed/$envTestsTotal)"
    }
    Write-Host ""
    
    # ========================================
    # Test Summary
    # ========================================
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host "  Test Summary" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Total Tests:  $script:TestsRun"
    Write-Host "Passed:       $script:TestsPassed" -ForegroundColor Green
    Write-Host "Failed:       $script:TestsFailed" -ForegroundColor Red
    Write-Host ""
    
    if ($script:TestsFailed -eq 0) {
        Write-Host "✓ All tests passed!" -ForegroundColor Green
        Write-Host ""
        return 0
    } else {
        Write-Host "✗ Some tests failed" -ForegroundColor Red
        Write-Host ""
        return 1
    }
}

# Run main test suite
$exitCode = Start-TestSuite

# Exit with appropriate code
exit $exitCode
