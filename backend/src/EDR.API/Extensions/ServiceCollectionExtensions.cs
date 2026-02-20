using Microsoft.AspNetCore.ResponseCompression;
using EDR.API.Configurations;
using System.IO.Compression;

namespace EDR.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddCompression(this IServiceCollection services)
        {
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = false;
                options.Providers.Add<BrotliCompressionProvider>();
                options.Providers.Add<GzipCompressionProvider>();
            });
            services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Fastest;
            });

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Fastest;
            });

           return services;
        }

        // public static IServiceCollection AddConfiguredSwagger(this IServiceCollection services, IConfiguration configuration)
        // {
        //     
        //     services.Configure<SwaggerSettings>(configuration.GetSection("Swagger"));
        //     services.AddSwaggerGen();
        //     services.ConfigureOptions<ConfigureSwaggerOptions>();
        //
        //     return services;
        // }
    }
}

