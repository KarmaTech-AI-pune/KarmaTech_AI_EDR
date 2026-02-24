using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using EDR.API.Configurations;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace EDR.API.Extensions
{
    public static class SwaggerExtensions
    {
        public static IServiceCollection AddConfiguredSwagger(this IServiceCollection services,
            IConfiguration configuration)
        {
            // Bind Swagger settings from configuration
            // Bind Swagger settings from configuration
            var swaggerSettings = new SwaggerSettings();
            configuration.GetSection("Swagger").Bind(swaggerSettings);
            services.Configure<SwaggerSettings>(configuration.GetSection("Swagger"));

            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc(swaggerSettings.Version, new OpenApiInfo
                {
                    Title = swaggerSettings.Title,
                    Version = swaggerSettings.Version,
                    Description = swaggerSettings.Description,
                    Contact = new OpenApiContact
                    {
                        Name = swaggerSettings.Contact?.Name,
                        Email = swaggerSettings.Contact?.Email
                    }
                });

                // Add JWT Authentication
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme.\r\n\r\n" +
                                  "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\n" +
                                  "Example: \"Bearer 12345abcdef\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http, 
                    Scheme = "bearer", 
                    BearerFormat = "JWT" 
                });

                // Add Tenant Header
                options.AddSecurityDefinition("X-Tenant-Context", new OpenApiSecurityScheme
                {
                    Description = "Tenant identifier header. Example: \"tenant1\"",
                    Name = "X-Tenant-Context",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey
                });

                // Add Security Requirement for JWT
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });

                // Add Security Requirement for Tenant
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "X-Tenant-Context"
                            }
                        },
                        Array.Empty<string>()
                    }
                });

                // Add operation filter to handle [Authorize] attribute
                options.OperationFilter<SecurityRequirementsOperationFilter>();
            });

            return services;
        }
    }

    public class SecurityRequirementsOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Check for authorize attribute
            var hasAuthorize = context.MethodInfo.DeclaringType.GetCustomAttributes(true)
                .Union(context.MethodInfo.GetCustomAttributes(true))
                .OfType<AuthorizeAttribute>()
                .Any();

            if (hasAuthorize)
            {
                operation.Security = new List<OpenApiSecurityRequirement>
                {
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                }
                            },
                            Array.Empty<string>()
                        },
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "X-Tenant-Context"
                                }
                            },
                            Array.Empty<string>()
                        }
                    }
                };
            }
        }
    }
}
