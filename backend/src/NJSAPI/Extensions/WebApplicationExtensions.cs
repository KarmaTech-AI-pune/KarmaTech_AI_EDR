using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NJS.Domain.Database;
using NJS.Domain.Extensions;
using NJSAPI.Configurations;
using NJSAPI.Middleware;
using Microsoft.AspNetCore.HttpOverrides;

namespace NJSAPI.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication ConfigureApplication(this WebApplication app)
    {
         //  REQUIRED for AWS ALB
        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders =
                ForwardedHeaders.XForwardedFor |
                ForwardedHeaders.XForwardedProto
        });

        // DO NOT USE HTTPS REDIRECTION IN ECS
        // TLS must terminate at ALB
        // app.UseHttpsRedirection();

        app.UseRouting();
        app.MapHealthChecks("/health").AllowAnonymous();

        app.UseCors("AllowSpecificOrigin");

        app.UseResponseCompression();
       
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            var swaggerSettings = app.Services
                .GetRequiredService<IOptions<SwaggerSettings>>().Value;

            options.SwaggerEndpoint(
                $"/swagger/{swaggerSettings.Version}/swagger.json",
                swaggerSettings.Title);
        });

      
        app.UseAuthentication();
        app.UseAuthorization();

       
        app.UseMiddleware<TenantResolverMiddleware>();
        app.UseMiddleware<TenantMiddleware>();      
      

        app.MapControllers();

        using (var scope = app.Services.CreateScope())

        {

            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

            db.Database.Migrate();

            SeedExtensions.InitializeDatabaseAsync(app).Wait();

        }
         

        return app;

    }
}
