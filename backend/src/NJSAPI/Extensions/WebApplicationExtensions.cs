using Microsoft.AspNetCore.HttpOverrides;
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
        var pathBase = app.Configuration["Api:PathBase"];

        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders =
                ForwardedHeaders.XForwardedFor |
                ForwardedHeaders.XForwardedProto
        });
        if (app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }


        app.UseRouting();

        app.UseCors("AllowSpecificOrigin");

        app.UseSwagger();

        app.UseSwaggerUI(options =>

        {
            var swaggerSettings = app.Services.GetRequiredService<IOptions<SwaggerSettings>>().Value;

            options.SwaggerEndpoint($"{pathBase}/swagger/{swaggerSettings.Version}/swagger.json",
                $"{swaggerSettings.Title}");
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


        return app;
    }
}