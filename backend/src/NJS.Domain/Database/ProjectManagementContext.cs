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

        public DbSet<BidPreparation> BidPreparations { get; set; }
        public DbSet<BidVersionHistory> BidVersionHistories { get; set; }
        public DbSet<Project> Projects { get; set; }
        public new DbSet<User> Users { get; set; }
        public new DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<FeasibilityStudy> FeasibilityStudies { get; set; }
        public DbSet<GoNoGoDecision> GoNoGoDecisions { get; set; }
        public DbSet<WorkBreakdownStructure> WorkBreakdownStructures { get; set; }
        public DbSet<WBSTask> WBSTasks { get; set; }
        public DbSet<UserWBSTask> UserWBSTasks { get; set; }
        public DbSet<WBSOption> WBSOptions { get; set; }
        public DbSet<OpportunityTracking> OpportunityTrackings { get; set; }
        public DbSet<ProjectResource> ProjectResources { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<OpportunityStatus> OpportunityStatuses { get; set; }
        public DbSet<OpportunityHistory> OpportunityHistories { get; set; }
        public DbSet<Region> Regions { get; set; }
        public DbSet<FailedEmailLog> FailedEmailLogs { get; set; }
        public DbSet<Settings> Settings { get; set; }

        public DbSet<GoNoGoDecisionOpportunity> GoNoGoDecisionOpportunities { get; set; }
        public DbSet<ScoringCriteria> ScoringCriteria { get; set; }
        public DbSet<ScoreRange> ScoreRange { get; set; }
        public DbSet<GoNoGoVersion> GoNoGoVersions { get; set; }
        public DbSet<ScoringDescriptions> ScoringDescription { get; set; }
        public DbSet<ScoringDescriptionSummarry> ScoringDescriptionSummarry { get; set; }
        public DbSet<GoNoGoDecisionHeader> GoNoGoDecisionHeaders { get; set; }
        public DbSet<GoNoGoDecisionTransaction> GoNoGoDecisionTransactions { get; set; }
        public DbSet<JobStartForm> JobStartForms { get; set; }
        public DbSet<JobStartFormSelection> JobStartFormSelections { get; set; } // Add DbSet for Selections
        public DbSet<JobStartFormResource> JobStartFormResources { get; set; } // Add DbSet for Resources
        public DbSet<InputRegister> InputRegisters { get; set; }
        public DbSet<CorrespondenceInward> CorrespondenceInwards { get; set; }
        public DbSet<CorrespondenceOutward> CorrespondenceOutwards { get; set; }
        public DbSet<CheckReview> CheckReviews { get; set; }
        public DbSet<ChangeControl> ChangeControls { get; set; }

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

            // Configure BidPreparation entity
            modelBuilder.Entity<BidPreparation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.DocumentCategoriesJson).HasColumnType("nvarchar(max)");
                entity.Property(e => e.CreatedBy).IsRequired(false);
                entity.Property(e => e.UpdatedBy).IsRequired(false);
                entity.Property(e => e.Comments).IsRequired(false);

                // Create index on UserId for faster lookups
                entity.HasIndex(e => e.UserId);

                // Configure relationship with OpportunityTracking
                entity.HasOne(b => b.OpportunityTracking)
                    .WithMany()
                    .HasForeignKey(b => b.OpportunityId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Configure relationship with BidVersionHistory
                entity.HasMany(b => b.VersionHistory)
                    .WithOne(v => v.BidPreparation)
                    .HasForeignKey(v => v.BidPreparationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure BidVersionHistory entity
            modelBuilder.Entity<BidVersionHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DocumentCategoriesJson).HasColumnType("nvarchar(max)");
                entity.Property(e => e.Comments).IsRequired(false);
                entity.Property(e => e.ModifiedBy).IsRequired();

                // Create index on BidPreparationId for faster lookups
                entity.HasIndex(e => e.BidPreparationId);
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
            modelBuilder.Entity<Permission>();

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
                .HasForeignKey(t => t.GoNoGoDecisionHeaderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GoNoGoDecisionTransaction>()
                .HasOne(t => t.ScoringCriterias)
                .WithMany()
                .HasForeignKey(t => t.ScoringCriteriaId);

            // Configure GoNoGoDecisionHeader relationships
            modelBuilder.Entity<GoNoGoDecisionHeader>()
                .HasOne(h => h.OpportunityTracking)
                .WithMany()
                .HasForeignKey(h => h.OpportunityId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GoNoGoDecisionHeader>().Property(o => o.TypeOfClient).IsRequired(false);
            modelBuilder.Entity<GoNoGoDecisionHeader>().Property(o => o.RegionalBDHead).IsRequired(false);

            // Configure WBSOption entity
            modelBuilder.Entity<WBSOption>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Value).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Label).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Level).IsRequired();
                entity.Property(e => e.ParentValue).HasMaxLength(100);
                entity.Property(e => e.FormType).IsRequired();

                // Create index on Level for faster lookups
                entity.HasIndex(e => e.Level);

                // Create index on ParentValue for faster hierarchical queries
                entity.HasIndex(e => e.ParentValue);

                // Create index on FormType for faster filtering
                entity.HasIndex(e => e.FormType);
            });

            // Configure WBSTask entity
            modelBuilder.Entity<WBSTask>(entity =>
            {
                entity.Property(t => t.EstimatedBudget).HasPrecision(18, 2);

                // Configure self-referencing relationship for hierarchy
                entity.HasOne(t => t.Parent)
                      .WithMany(t => t.Children)
                      .HasForeignKey(t => t.ParentId)
                      .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a task if it has children

                // Configure relationship with WorkBreakdownStructure
                entity.HasOne(t => t.WorkBreakdownStructure)
                      .WithMany(w => w.Tasks)
                  .HasForeignKey(t => t.WorkBreakdownStructureId)
                  .OnDelete(DeleteBehavior.Cascade); // Deleting WBS deletes its tasks
            });

            // Configure JobStartForm entity
            modelBuilder.Entity<JobStartForm>(entity =>
            {
                entity.HasKey(e => e.FormId);

                entity.Property(e => e.GrandTotal).HasPrecision(18, 2);
                entity.Property(e => e.Profit).HasPrecision(18, 2);
                entity.Property(e => e.ProjectFees).HasPrecision(18, 2);
                entity.Property(e => e.ServiceTaxAmount).HasPrecision(18, 2);
                entity.Property(e => e.ServiceTaxPercentage).HasPrecision(5, 2);
                entity.Property(e => e.TotalExpenses).HasPrecision(18, 2);
                entity.Property(e => e.TotalProjectFees).HasPrecision(18, 2);
                entity.Property(e => e.TotalTimeCost).HasPrecision(18, 2);

                entity.HasOne(jsf => jsf.Project)
                      .WithMany()
                      .HasForeignKey(jsf => jsf.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(jsf => jsf.WorkBreakdownStructure)
                      .WithMany(wbs => wbs.JobStartForms)
                      .HasForeignKey(jsf => jsf.WorkBreakdownStructureId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasMany(jsf => jsf.Selections)
                      .WithOne(s => s.JobStartForm)
                      .HasForeignKey(s => s.FormId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(jsf => jsf.Resources)
                      .WithOne(r => r.JobStartForm)
                      .HasForeignKey(r => r.FormId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(jsf => jsf.ProjectId);
            });

            // Configure JobStartFormSelection entity
            modelBuilder.Entity<JobStartFormSelection>(entity =>
            {
                entity.HasKey(e => e.SelectionId);
                // No complex relationships needed here as it's primarily linked via JobStartForm
                entity.HasIndex(s => s.FormId); // Index for faster lookup by form
            });

            // Configure JobStartFormResource entity
            modelBuilder.Entity<JobStartFormResource>(entity =>
            {
                entity.HasKey(e => e.ResourceId);
                entity.Property(e => e.Rate).HasPrecision(18, 2);
                entity.Property(e => e.Units).HasPrecision(18, 2);
                entity.Property(e => e.BudgetedCost).HasPrecision(18, 2);

                entity.HasOne(r => r.JobStartForm)
                      .WithMany(j => j.Resources)
                      .HasForeignKey(r => r.FormId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(r => r.FormId); // Index for faster lookup by form
            });

             // Configure UserWBSTask entity decimal properties
            modelBuilder.Entity<UserWBSTask>(entity =>
            {
                entity.Property(ut => ut.CostRate).HasPrecision(18, 2);
                entity.Property(ut => ut.TotalCost).HasPrecision(18, 2);
            });

            // Configure WorkBreakdownStructure entity
            modelBuilder.Entity<WorkBreakdownStructure>(entity =>
            {
                 // Optional: Add index on ProjectId if frequent lookups by project are expected
                 entity.HasIndex(w => w.ProjectId);
            });

            // Configure InputRegister entity
            modelBuilder.Entity<InputRegister>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DataReceived).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ReceivedFrom).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FilesFormat).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CheckedBy).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.Custodian).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.StoragePath).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.Remarks).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.CreatedBy).IsRequired(false);
                entity.Property(e => e.UpdatedBy).IsRequired(false);

                // Create index on ProjectId for faster lookups
                entity.HasIndex(e => e.ProjectId);

                // Configure relationship with Project
                entity.HasOne(i => i.Project)
                      .WithMany()
                      .HasForeignKey(i => i.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure CorrespondenceInward entity
            modelBuilder.Entity<CorrespondenceInward>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.IncomingLetterNo).IsRequired().HasMaxLength(255);
                entity.Property(e => e.NjsInwardNo).IsRequired().HasMaxLength(255);
                entity.Property(e => e.From).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
                entity.Property(e => e.AttachmentDetails).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.ActionTaken).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.StoragePath).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.Remarks).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.CreatedBy).IsRequired(false);
                entity.Property(e => e.UpdatedBy).IsRequired(false);

                // Create index on ProjectId for faster lookups
                entity.HasIndex(e => e.ProjectId);

                // Configure relationship with Project
                entity.HasOne(i => i.Project)
                      .WithMany()
                      .HasForeignKey(i => i.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure CorrespondenceOutward entity
            modelBuilder.Entity<CorrespondenceOutward>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LetterNo).IsRequired().HasMaxLength(255);
                entity.Property(e => e.To).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
                entity.Property(e => e.AttachmentDetails).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.ActionTaken).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.StoragePath).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.Remarks).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.Acknowledgement).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.CreatedBy).IsRequired(false);
                entity.Property(e => e.UpdatedBy).IsRequired(false);

                // Create index on ProjectId for faster lookups
                entity.HasIndex(e => e.ProjectId);

                // Configure relationship with Project
                entity.HasOne(i => i.Project)
                      .WithMany()
                      .HasForeignKey(i => i.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure CheckReview entity
            modelBuilder.Entity<CheckReview>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ActivityNo).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ActivityName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Objective).IsRequired().HasMaxLength(500);
                entity.Property(e => e.References).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.FileName).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.QualityIssues).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.Completion).IsRequired().HasMaxLength(1);
                entity.Property(e => e.CheckedBy).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.ApprovedBy).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.ActionTaken).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.CreatedBy).IsRequired(false);
                entity.Property(e => e.UpdatedBy).IsRequired(false);

                // Create index on ProjectId for faster lookups
                entity.HasIndex(e => e.ProjectId);

                // Configure relationship with Project
                entity.HasOne(i => i.Project)
                      .WithMany()
                      .HasForeignKey(i => i.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure ChangeControl entity
            modelBuilder.Entity<ChangeControl>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Originator).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
                entity.Property(e => e.CostImpact).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.TimeImpact).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.ResourcesImpact).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.QualityImpact).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.ChangeOrderStatus).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.ClientApprovalStatus).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.ClaimSituation).HasMaxLength(255).IsRequired(false);
                entity.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.UpdatedBy).HasMaxLength(100).IsRequired(false);

                // Create index on ProjectId for faster lookups
                entity.HasIndex(e => e.ProjectId);

                // Configure relationship with Project
                entity.HasOne(cc => cc.Project)
                      .WithMany()
                      .HasForeignKey(cc => cc.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
