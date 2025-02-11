using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using NJS.Domain.Entities;

namespace NJS.Domain.Database
{
    public class ProjectManagementContext : IdentityDbContext<User>
    {
        public ProjectManagementContext(DbContextOptions<ProjectManagementContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public new DbSet<User> Users { get; set; }
        public new DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<FeasibilityStudy> FeasibilityStudies { get; set; }
        public DbSet<GoNoGoDecision> GoNoGoDecisions { get; set; }
        public DbSet<WorkBreakdownStructure> WorkBreakdownStructures { get; set; }
        public DbSet<WBSTask> WBSTasks { get; set; }
        public DbSet<UserWBSTask> UserWBSTasks { get; set; }
        public DbSet<OpportunityTracking> OpportunityTrackings { get; set; }
        public DbSet<ProjectResource> ProjectResources { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<OpportunityStatus> OpportunityStatuses { get; set; }
        public DbSet<OpportunityHistory> OpportunityHistories { get; set; }
        public DbSet<Region> Regions { get; set; }

        public DbSet<GoNoGoDecisionOpportunity> GoNoGoDecisionOpportunities { get; set; }
        // To:
        public DbSet<ScoringCriteria> ScoringCriteria { get; set; }

        public DbSet<ScoreRange> ScoreRange { get; set; }
        public DbSet<GoNoGoVersion> GoNoGoVersions { get; set; }

        public DbSet<ScoringDescriptions> ScoringDescription { get; set; }

        public DbSet<ScoringDescriptionSummarry> ScoringDescriptionSummarry { get; set; }
        public DbSet<GoNoGoDecisionHeader> GoNoGoDecisionHeaders { get; set; }
        public DbSet<GoNoGoDecisionTransaction> GoNoGoDecisionTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Identity tables
            modelBuilder.Entity<IdentityUserLogin<string>>(entity =>
            {
                entity.HasKey(e => new { e.LoginProvider, e.ProviderKey });
            });

            modelBuilder.Entity<IdentityUserRole<string>>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.RoleId });
            });

            modelBuilder.Entity<IdentityUserToken<string>>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name });
            });

            // Configure Role-Permission relationship
            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => rp.Id);

            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId);

            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId);

            // Configure decimal precisions
            modelBuilder.Entity<FeasibilityStudy>().Property(f => f.ProbabilityAssessment).HasPrecision(18, 2);
            modelBuilder.Entity<FeasibilityStudy>().Property(f => f.FinancialInformation).HasPrecision(18, 2);
            modelBuilder.Entity<Project>().Property(f => f.EstimatedCost).HasPrecision(18, 2);
            modelBuilder.Entity<User>().Property(f => f.Avatar).IsRequired(false);
            modelBuilder.Entity<Role>().ToTable("AspNetRoles");
            // Configure OpportunityTracking decimal precisions
            modelBuilder.Entity<OpportunityTracking>()
                .Property(o => o.BidFees)
                .HasPrecision(18, 2);
            modelBuilder.Entity<OpportunityTracking>()
                .Property(o => o.Emd)
                .HasPrecision(18, 2);
            modelBuilder.Entity<OpportunityTracking>()
                .Property(o => o.PercentageChanceOfProjectHappening)
                .HasPrecision(5, 2);
            modelBuilder.Entity<OpportunityTracking>()
                .Property(o => o.PercentageChanceOfNJSSuccess)
                .HasPrecision(5, 2);
            modelBuilder.Entity<OpportunityTracking>()
                .Property(o => o.GrossRevenue)
                .HasPrecision(18, 2);
            modelBuilder.Entity<OpportunityTracking>()
                .Property(o => o.NetNJSRevenue)
                .HasPrecision(18, 2);
            modelBuilder.Entity<OpportunityTracking>().Property(o => o.CreatedBy).IsRequired(false);
            modelBuilder.Entity<OpportunityTracking>().Property(o => o.UpdatedBy).IsRequired(false);
            modelBuilder.Entity<OpportunityTracking>().Property(o => o.ApprovalManagerId).IsRequired(false);
            modelBuilder.Entity<OpportunityTracking>().Property(o => o.ReviewManagerId).IsRequired(false);
            modelBuilder.Entity<OpportunityHistory>().Property(o => o.Comments).IsRequired(false);
            
           

            modelBuilder.Entity<OpportunityHistory>().HasOne(oh => oh.Opportunity).WithMany(o => o.OpportunityHistories).HasForeignKey(oh => oh.OpportunityId); 
            modelBuilder.Entity<OpportunityHistory>().HasOne(oh => oh.ActionUser).WithMany(u => u.OpportunityHistories).HasForeignKey(oh => oh.ActionBy);
            modelBuilder.Entity<OpportunityHistory>().HasOne(oh => oh.Status).WithMany(s => s.OpportunityHistories).HasForeignKey(oh => oh.StatusId);

            modelBuilder.Entity<GoNoGoDecisionOpportunity>().HasOne(oh => oh.ScoringCriterias).WithMany(s => s.GoNoGoDecisionOpportunities).HasForeignKey(oh => oh.ScoringCriteriaId);
            modelBuilder.Entity<GoNoGoDecisionOpportunity>().HasOne(oh => oh.ScoreRanges).WithMany(s => s.GoNoGoDecisionOpportunitiesScoring).HasForeignKey(oh => oh.ScoreRangeId);
            modelBuilder.Entity<ScoringDescriptionSummarry>().HasOne(oh => oh.ScoringDescriptions).WithMany(s => s.ScoringDescriptionSummarry).HasForeignKey(oh => oh.ScoringDescriptionID);

            // Configure GoNoGoDecisionTransaction relationships
            modelBuilder.Entity<GoNoGoDecisionTransaction>()
                .HasOne(t => t.GoNoGoDecisionHeader)
                .WithMany()
                .HasForeignKey(t => t.GoNoGoDecisionHeaderId);

            modelBuilder.Entity<GoNoGoDecisionTransaction>()
                .HasOne(t => t.ScoringCriterias)
                .WithMany()
                .HasForeignKey(t => t.ScoringCriteriaId);

            // Configure GoNoGoDecisionHeader relationships
            modelBuilder.Entity<GoNoGoDecisionHeader>()
                .HasOne(h => h.OpportunityTracking)
                .WithMany()
                .HasForeignKey(h => h.OpportunityId);

            modelBuilder.Entity<GoNoGoDecisionHeader>().Property(o => o.TypeOfClient).IsRequired(false);
            modelBuilder.Entity<GoNoGoDecisionHeader>().Property(o => o.RegionalBDHead).IsRequired(false);
          
        }
    }

}
