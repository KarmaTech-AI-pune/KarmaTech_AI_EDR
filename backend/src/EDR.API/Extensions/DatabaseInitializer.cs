using EDR.Domain.Database;
using EDR.Domain.Extensions;
using Microsoft.EntityFrameworkCore;

namespace EDR.API.Extensions;

public static class DatabaseInitializer
{
    public static async Task MigrateDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        
        var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
        await db.Database.MigrateAsync();
        await SeedExtensions.InitializeDatabaseAsync(app);
    }
}