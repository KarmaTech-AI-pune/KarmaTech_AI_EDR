using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;

namespace NJS.Domain.Database
{
    public class ProjectManagementContext : IdentityDbContext<User, Role, string>
    {
       public ProjectManagementContext(DbContextOptions<ProjectManagementContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<FeasibilityStudy> FeasibilityStudies { get; set; }
        public DbSet<GoNoGoDecision> GoNoGoDecisions { get; set; }
        public DbSet<WorkBreakdownStructure> WorkBreakdownStructures { get; set; }
        public DbSet<WBSTask> WBSTasks { get; set; }
        public DbSet<UserWBSTask> UserWBSTasks { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<FeasibilityStudy>().Property(f => f.ProbabilityAssessment).HasPrecision(18, 2);
            modelBuilder.Entity<FeasibilityStudy>().Property(f => f.FinancialInformation).HasPrecision(18, 2);
            modelBuilder.Entity<Project>().Property(f => f.EstimatedCost).HasPrecision(18, 2);
            modelBuilder.Entity<WBSTask>().Property(f => f.Budget).HasPrecision(18, 2);
        }
    }
}
