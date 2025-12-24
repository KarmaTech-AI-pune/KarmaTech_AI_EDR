using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NJS.Domain.Database;
using NJS.Domain.Extensions;
using NJSAPI.Configurations;
using NJSAPI.Middleware;

namespace NJSAPI.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication ConfigureApplication(this WebApplication app)
    {
        app.UseCors("AllowSpecificOrigin");
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            var swaggerSettings = app.Services.GetRequiredService<IOptions<SwaggerSettings>>().Value;
            options.SwaggerEndpoint($"/swagger/{swaggerSettings.Version}/swagger.json", $"{swaggerSettings.Title}");
        });
        app.UseResponseCompression();
        app.UseHttpsRedirection();

        app.UseMiddleware<TenantResolverMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseMiddleware<TenantMiddleware>();
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
            db.Database.Migrate();
            SeedExtensions.InitializeDatabaseAsync(app).Wait();
        }      
        app.MapControllers();
        app.MapFallbackToFile("index.html");
        return app;
    }
}