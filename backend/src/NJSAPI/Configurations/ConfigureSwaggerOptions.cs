using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace NJSAPI.Configurations
{
    public class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
    {
        private readonly SwaggerSettings _settings;

        public ConfigureSwaggerOptions(IOptions<SwaggerSettings> settings)
        {
            _settings = settings.Value;
        }

        public void Configure(SwaggerGenOptions options)
        {
            options.SwaggerDoc(_settings.Version, new OpenApiInfo
            {
                Title = _settings.Title,
                Version = _settings.Version,
                Description = _settings.Description,
                Contact = new OpenApiContact
                {
                    Name = _settings.Contact?.Name,
                    Email = _settings.Contact?.Email
                }
            });
        }
    }
}
