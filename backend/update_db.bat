@echo off
@REM echo Dropping database...
@REM dotnet ef database drop --project src/NJS.Domain --startup-project src/NJSAPI --force

@REM echo Removing migrations...
@REM dotnet ef migrations remove --project src/NJS.Domain --startup-project src/NJSAPI

echo Adding initial migration...
dotnet ef migrations add InitialCreate --project src/NJS.Domain --startup-project src/NJSAPI

echo Updating database...
dotnet ef database update --project src/NJS.Domain --startup-project src/NJSAPI

pause
