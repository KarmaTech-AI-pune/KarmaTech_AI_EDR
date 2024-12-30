#!/bin/bash

# Exit on error
set -e

echo "Dropping existing database..."
cd backend && dotnet ef database drop --project src/NJS.Domain --startup-project src/NJSAPI --force

echo "Removing existing migrations..."
dotnet ef migrations remove --project src/NJS.Domain --startup-project src/NJSAPI

echo "Adding new migrations..."
dotnet ef migrations add InitialCreate --project src/NJS.Domain --startup-project src/NJSAPI

echo "Updating database with new migrations..."
dotnet ef database update --project src/NJS.Domain --startup-project src/NJSAPI

echo "Database update completed successfully!"
