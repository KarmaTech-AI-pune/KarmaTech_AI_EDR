:: @echo off
:: echo Dropping database...
:: dotnet ef database drop --project src/NJS.Domain --startup-project src/NJSAPI --force

:: echo Removing migrations...
:: dotnet ef migrations remove --project src/NJS.Domain --startup-project src/NJSAPI

:: echo Adding initial migration...
:: dotnet ef migrations add InitialCreate --project src/NJS.Domain --startup-project src/NJSAPI

:: echo Updating database...
:: dotnet ef database update --project src/NJS.Domain --startup-project src/NJSAPI

:: pause

@echo off

:: Prompt the user to enter a migration name
set /p migrationName="Enter migration name (or leave blank for auto name): "



:: Check if the user entered a name
if "%migrationName%"=="" (
    for /f %%i in ('powershell -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set migrationName=AutoMigration_%%i
)

:: Output the migration name for confirmation
echo Migration name: %migrationName%
:: echo Dropping database...
:: dotnet ef database drop --project src/NJS.Domain --startup-project src/NJSAPI --force

::echo Removing migrations...
::dotnet ef migrations remove --project src/NJS.Domain --startup-project src/NJSAPI

echo Adding migration: %migrationName%...
dotnet ef migrations add %migrationName% --context ProjectManagementContext --project src/NJS.Domain --startup-project src/NJSAPI

echo Updating database...
dotnet ef database update --context ProjectManagementContext --project src/NJS.Domain --startup-project src/NJSAPI

pause
