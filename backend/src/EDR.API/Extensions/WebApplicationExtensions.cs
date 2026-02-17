using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using EDR.Domain.Database;
using EDR.Domain.Extensions;
using EDR.API.Configurations;
using EDR.API.Middleware;
using NLog.Web.LayoutRenderers;

namespace EDR.API.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication ConfigureApplication(this WebApplication app)
    {
        var pathBase = app.Configuration["Api:PathBase"];
 
       
        if (!string.IsNullOrWhiteSpace(pathBase))
        {
            pathBase = "/";
        }
        app.UsePathBase(pathBase);
        app.UseHttpsRedirection();

        app.UseRouting();

        app.UseCors("AllowSpecificOrigin");

        app.UseSwagger();

        app.UseSwaggerUI(options =>

        {

            var swaggerSettings = app.Services.GetRequiredService<IOptions<SwaggerSettings>>().Value;

            options.SwaggerEndpoint($"{pathBase}/swagger/{swaggerSettings.Version}/swagger.json", $"{swaggerSettings.Title}");

        });

        app.UseResponseCompression();


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

        // app.MapFallbackToFile("index.html");       

        return app;

    }
}
