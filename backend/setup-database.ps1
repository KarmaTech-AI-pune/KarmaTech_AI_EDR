# Remove the Migrations folder
Write-Host "Removing Migrations folder..."
Remove-Item -Recurse -Force "src\NJS.Domain\Migrations" -ErrorAction SilentlyContinue

# Remove existing migration
Write-Host "Removing existing migration..."
dotnet ef migrations remove --context ProjectManagementContext --project src/NJS.Domain --startup-project src/NJSAPI

# Drop existing database
Write-Host "Dropping existing database..."
dotnet ef database drop --context ProjectManagementContext --project src/NJS.Domain --startup-project src/NJSAPI

# Add new migration
Write-Host "Adding new migration..."
dotnet ef migrations add newMigrations3 --context ProjectManagementContext --project src/NJS.Domain --startup-project src/NJSAPI

# Update database with verbose logging
Write-Host "Updating database..."
dotnet ef database update --context ProjectManagementContext --project src/NJS.Domain --startup-project src/NJSAPI --verbose

Write-Host "Database setup completed!"
