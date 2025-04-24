@echo off
echo Dropping database...
dotnet ef database drop --project src/NJS.Domain --startup-project src/NJSAPI --force

echo Removing migrations...
dotnet ef migrations remove --project src/NJS.Domain --startup-project src/NJSAPI

echo Adding initial migration...
dotnet ef migrations add InitialCreate --project src/NJS.Domain --startup-project src/NJSAPI

echo Updating database...
dotnet ef database update --project src/NJS.Domain --startup-project src/NJSAPI

pause
