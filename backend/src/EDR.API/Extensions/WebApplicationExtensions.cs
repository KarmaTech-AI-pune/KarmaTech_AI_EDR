using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using EDR.Domain.Database;
using EDR.Domain.Extensions;
using EDR.API.Configurations;
using EDR.API.Middleware;
using Microsoft.AspNetCore.HttpOverrides;
using NLog.Web.LayoutRenderers;
namespace EDR.API.Extensions;

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
        app.UseResponseCaching();

        app.UseMiddleware<TenantResolverMiddleware>();

        app.UseAuthentication();

        app.UseAuthorization();

        app.UseMiddleware<TenantMiddleware>();

        app.MapControllers();
        
        app.MapHealthChecks("/health");

        return app;
    }
}

