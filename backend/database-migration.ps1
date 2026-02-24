# Database Migration Script for EDR Project

# Stop on first error
$ErrorActionPreference = 'Stop'

try {
    # Drop existing database
    Write-Host "Dropping existing database..." -ForegroundColor Yellow 
    # Remove existing migrations
    Write-Host "Removing existing migrations..." -ForegroundColor Yellow
    dotnet ef migrations remove --project src/EDR.Domain --startup-project src/EDR.API

    # Create new initial migration
    Write-Host "Creating new initial migration..." -ForegroundColor Yellow
    dotnet ef migrations add InitialCreate --project src/EDR.Domain --startup-project src/EDR.API

    # Update database to latest migration
    Write-Host "Updating database to latest migration..." -ForegroundColor Yellow
    dotnet ef database update --project src/EDR.Domain --startup-project src/EDR.API

    Write-Host "Database migration completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "An error occurred during database migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
