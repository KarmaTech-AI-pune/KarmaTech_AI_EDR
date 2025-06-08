using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

namespace NJSAPI.Extensions
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
                options.Level = CompressionLevel.Optimal;
            });

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });

           return services;
        }
    }
}
