# Test WBS Versioning Script
# This script tests the WBS versioning system

param(
    [string]$BaseUrl = "https://localhost:7001",
    [int]$ProjectId = 1
)

Write-Host "Testing WBS Versioning System" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Project ID: $ProjectId" -ForegroundColor Yellow

# Test 1: Get current WBS
Write-Host "`n1. Getting current WBS..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/projects/$ProjectId/wbs" -Method GET -ContentType "application/json"
    Write-Host "Current WBS retrieved successfully" -ForegroundColor Green
    Write-Host "Tasks count: $($response.tasks.Count)" -ForegroundColor Yellow
} catch {
    Write-Host "Error getting WBS: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Test 2: Update WBS to trigger versioning
Write-Host "`n2. Updating WBS to trigger versioning..." -ForegroundColor Green
$updateData = @(
    @{
        id = 1
        title = "Updated Task Title - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        description = "Updated description for versioning test"
        level = 1
        displayOrder = 1
        estimatedBudget = 10000
        startDate = "2024-01-01"
        endDate = "2024-12-31"
        taskType = 0
        plannedHours = @(
            @{
                year = 2024
                month = 1
                plannedHours = 40
            }
        )
        assignedUserId = "f19219ee-1e02-4c2e-9130-8a238199ab7d"
        costRate = 100
        resourceUnit = "Hours"
    }
)

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/projects/$ProjectId/wbs" -Method PUT -Body ($updateData | ConvertTo-Json -Depth 10) -ContentType "application/json"
    Write-Host "WBS updated successfully - versioning should be triggered" -ForegroundColor Green
} catch {
    Write-Host "Error updating WBS: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Test 3: Get WBS versions
Write-Host "`n3. Getting WBS versions..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/projects/$ProjectId/wbs/versions" -Method GET -ContentType "application/json"
    Write-Host "WBS versions retrieved successfully" -ForegroundColor Green
    Write-Host "Versions count: $($response.Count)" -ForegroundColor Yellow
    
    foreach ($version in $response) {
        Write-Host "  Version: $($version.version), Created: $($version.createdAt), IsLatest: $($version.isLatest)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error getting WBS versions: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check database tables
Write-Host "`n4. Checking versioning tables in database..." -ForegroundColor Green
try {
    $versionCount = sqlcmd -S localhost -d KarmaTechAI_SAAS -E -Q "SELECT COUNT(*) as VersionCount FROM WBSVersionHistories WHERE WorkBreakdownStructureId IN (SELECT Id FROM WorkBreakdownStructures WHERE ProjectId = $ProjectId)" -h -1
    Write-Host "WBSVersionHistories count: $versionCount" -ForegroundColor Yellow
    
    $taskVersionCount = sqlcmd -S localhost -d KarmaTechAI_SAAS -E -Q "SELECT COUNT(*) as TaskVersionCount FROM WBSTaskVersionHistories" -h -1
    Write-Host "WBSTaskVersionHistories count: $taskVersionCount" -ForegroundColor Yellow
    
    $plannedHourVersionCount = sqlcmd -S localhost -d KarmaTechAI_SAAS -E -Q "SELECT COUNT(*) as PlannedHourVersionCount FROM WBSTaskPlannedHourVersionHistories" -h -1
    Write-Host "WBSTaskPlannedHourVersionHistories count: $plannedHourVersionCount" -ForegroundColor Yellow
    
    $userVersionCount = sqlcmd -S localhost -d KarmaTechAI_SAAS -E -Q "SELECT COUNT(*) as UserVersionCount FROM UserWBSTaskVersionHistories" -h -1
    Write-Host "UserWBSTaskVersionHistories count: $userVersionCount" -ForegroundColor Yellow
} catch {
    Write-Host "Error checking database: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nWBS Versioning Test Completed!" -ForegroundColor Green 