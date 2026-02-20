# Remove the Migrations folder
Write-Host "Removing Migrations folder..."
Remove-Item -Recurse -Force "src\EDR.Domain\Migrations" -ErrorAction SilentlyContinue

# Remove existing migration
Write-Host "Removing existing migration..."
dotnet ef migrations remove --context ProjectManagementContext --project src/EDR.Domain --startup-project src/EDR.API

# Drop existing database
Write-Host "Dropping existing database..."
dotnet ef database drop --context ProjectManagementContext --project src/EDR.Domain --startup-project src/EDR.API

# Add new migration
Write-Host "Adding new migration..."
dotnet ef migrations add proper-migration --context ProjectManagementContext --project src/EDR.Domain --startup-project src/EDR.API

# Update database with verbose logging
Write-Host "Updating database..."
dotnet ef database update --context ProjectManagementContext --project src/EDR.Domain --startup-project src/EDR.API --verbose

Write-Host "Database setup completed!"
