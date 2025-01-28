dotnet ef database drop --project src/NJS.Domain --startup-project src/NJSAPI --force
dotnet ef migrations remove --project src/NJS.Domain --startup-project src/NJSAPI
dotnet ef migrations add InitialCreate --project src/NJS.Domain --startup-project src/NJSAPI
dotnet ef database update --project src/NJS.Domain --startup-project src/NJSAPI
