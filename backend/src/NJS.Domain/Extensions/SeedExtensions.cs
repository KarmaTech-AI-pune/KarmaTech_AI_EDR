using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NJS.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Extensions
{
    public  static class  SeedExtensions
    {
        public static IApplicationBuilder SeedApplicationData(this IApplicationBuilder app)
        {
            InitializeDatabaseAsync(app).GetAwaiter().GetResult();
            return app;
        }

        public static async Task InitializeDatabaseAsync(IApplicationBuilder app)
        {
            try
            {
                using var scope = app.ApplicationServices.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                await context.Database.MigrateAsync();
            }
            catch
            {
               
                throw; 
            }
        }
    }
}
