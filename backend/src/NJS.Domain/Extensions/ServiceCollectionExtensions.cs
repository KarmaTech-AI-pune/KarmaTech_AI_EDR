﻿//File: backend/src/NJS.Domain/Extensions/ServiceCollectionExtensions.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NJS.Domain.Database;
using NJS.Domain.GenericRepository;
using NJS.Domain.UnitWork;

namespace NJS.Domain.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ProjectManagementContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            // Register UnitOfWork
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Register generic repository
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            return services;
        }
    }
}
