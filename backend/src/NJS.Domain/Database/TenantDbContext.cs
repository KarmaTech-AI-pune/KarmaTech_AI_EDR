using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;

namespace NJS.Domain.Database
{
    public class TenantDbContext : DbContext
    {
        public TenantDbContext(DbContextOptions<TenantDbContext> options) : base(options)
        {
        }

        public DbSet<Tenant> Tenants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Tenant>().ToTable("Tenants", t => t.ExcludeFromMigrations());
        }
    }
}
