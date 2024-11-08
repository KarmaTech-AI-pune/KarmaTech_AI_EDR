using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;
using System;

namespace NJS.Domain.Database
{
    public class ProjectManagementContext : DbContext
    {
       public ProjectManagementContext(DbContextOptions<ProjectManagementContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects {  get; set; }
        public DbSet<OpportunityTracking> OpportunityTrackings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<OpportunityTracking>()
                .HasOne(o => o.Project)
                .WithMany(p => p.OpportunityTrackings)
                .HasForeignKey(o => o.ProjectId);
        }
    }
}
