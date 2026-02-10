using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;

namespace NJS.Domain.Database
{
    public class TenantDbContext : DbContext
    {
        public TenantDbContext(DbContextOptions<TenantDbContext> options) : base(options)
        {
        }

        // Central database tables only
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<TenantUser> TenantUsers { get; set; }
        public DbSet<TenantDatabase> TenantDatabases { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<Feature> Features { get; set; }
        public DbSet<SubscriptionPlanFeature> SubscriptionPlanFeatures { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Tenant entity
            modelBuilder.Entity<Tenant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.ToTable("Tenant"); // Explicitly set table name
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Domain).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyName).HasMaxLength(255);
                entity.Property(e => e.ContactEmail).HasMaxLength(255);
                entity.Property(e => e.ContactPhone).HasMaxLength(255);
                entity.Property(e => e.StripeCustomerId).HasMaxLength(255);
                entity.Property(e => e.StripeSubscriptionId).HasMaxLength(255);
            });

            // Configure TenantUser entity
            modelBuilder.Entity<TenantUser>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(tu => tu.Tenant)
                    .WithMany(t => t.TenantUsers)
                    .HasForeignKey(tu => tu.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure TenantDatabase entity
            modelBuilder.Entity<TenantDatabase>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.ToTable("TenantDatabases"); // Explicitly set table name
                entity.Property(e => e.DatabaseName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ConnectionString).HasMaxLength(500);
                entity.HasOne(td => td.Tenant)
                    .WithMany(t => t.TenantDatabases)
                    .HasForeignKey(td => td.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure SubscriptionPlan entity
            modelBuilder.Entity<SubscriptionPlan>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.MonthlyPrice).HasPrecision(18, 2);
                entity.Property(e => e.YearlyPrice).HasPrecision(18, 2);
                entity.Property(e => e.StripePriceId).HasMaxLength(255);
            });

            // Configure Feature entity
            modelBuilder.Entity<Feature>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name);
                entity.Property(e => e.Description);
            });

            // Configure SubscriptionPlanFeature entity
            modelBuilder.Entity<SubscriptionPlanFeature>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(spf => spf.SubscriptionPlan)
                    .WithMany(sp => sp.SubscriptionPlanFeatures)
                    .HasForeignKey(spf => spf.SubscriptionPlanId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(spf => spf.Feature)
                    .WithMany(f => f.SubscriptionPlanFeatures)
                    .HasForeignKey(spf => spf.FeatureId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
