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
        public DbSet<WBSTaskMonthlyHourHeader> WBSTaskMonthlyHourHeaders { get; set; } // Added
        public DbSet<WBSTaskMonthlyHour> WBSTaskMonthlyHours { get; set; } // Added
        public DbSet<UserWBSTask> UserWBSTasks { get; set; }
        public DbSet<WBSOption> WBSOptions { get; set; }
        public DbSet<OpportunityTracking> OpportunityTrackings { get; set; }
        public DbSet<ProjectResource> ProjectResources { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<OpportunityStatus> OpportunityStatuses { get; set; }
        public DbSet<OpportunityHistory> OpportunityHistories { get; set; }
        public DbSet<WBSHistory> WBSHistories { get; set; }
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
        public DbSet<JobStartFormHeader> JobStartFormHeaders { get; set; }
        public DbSet<JobStartFormHistory> JobStartFormHistories { get; set; }
        public DbSet<InputRegister> InputRegisters { get; set; }
        public DbSet<CorrespondenceInward> CorrespondenceInwards { get; set; }
        public DbSet<CorrespondenceOutward> CorrespondenceOutwards { get; set; }
        public DbSet<CheckReview> CheckReviews { get; set; }
        public DbSet<ChangeControl> ChangeControls { get; set; }
        public DbSet<ProjectClosure> ProjectClosures { get; set; }
        // Removed ProjectClosureComment to fix build issues
        // public DbSet<ProjectClosureComment> ProjectClosureComments { get; set; }

        // PM Workflow entities
        public DbSet<PMWorkflowStatus> PMWorkflowStatuses { get; set; }
        public DbSet<ChangeControlWorkflowHistory> ChangeControlWorkflowHistories { get; set; }
        public DbSet<ProjectClosureWorkflowHistory> ProjectClosureWorkflowHistories { get; set; }

        // Monthly Progress entities
        public DbSet<MonthlyProgress> MonthlyProgresses { get; set; }
        public DbSet<FinancialDetails> FinancialDetails { get; set; }
        public DbSet<ContractAndCost> ContractAndCosts { get; set; }
        public DbSet<CTCEAC> CTCEACs { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<ManpowerPlanning> ManpowerPlannings { get; set; }
        public DbSet<ProgressDeliverable> ProgressDeliverables { get; set; }
        public DbSet<ChangeOrder> ChangeOrders { get; set; }
        public DbSet<ProgrammeSchedule> ProgrammeSchedules { get; set; }
        public DbSet<EarlyWarning> EarlyWarnings { get; set; }
        public DbSet<LastMonthAction> LastMonthActions { get; set; }
        public DbSet<CurrentMonthAction> CurrentMonthActions { get; set; }
        public DbSet<BudgetTable> BudgetTables { get; set; }
        public DbSet<OriginalBudget> OriginalBudgets { get; set; }
        public DbSet<CurrentBudgetInMIS> CurrentBudgetInMIS { get; set; }
        public DbSet<PercentCompleteOnCosts> PercentCompleteOnCosts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure MonthlyProgress to Project relationship
            modelBuilder.Entity<MonthlyProgress>()
                .HasOne(mp => mp.Project)
                .WithMany()
                .HasForeignKey(mp => mp.ProjectId);

            // Configure one-to-one relationships with MonthlyProgress
            modelBuilder.Entity<MonthlyProgress>()
                .HasOne(mp => mp.FinancialDetails)
                .WithOne(fd => fd.MonthlyProgress)
                .HasForeignKey<FinancialDetails>(fd => fd.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasOne(mp => mp.ContractAndCost)
                .WithOne(cc => cc.MonthlyProgress)
                .HasForeignKey<ContractAndCost>(cc => cc.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasOne(mp => mp.CTCEAC)
                .WithOne(cte => cte.MonthlyProgress)
                .HasForeignKey<CTCEAC>(cte => cte.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasOne(mp => mp.Schedule)
                .WithOne(s => s.MonthlyProgress)
                .HasForeignKey<Schedule>(s => s.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasMany(mp => mp.ManpowerEntries)
                .WithOne(mpe => mpe.MonthlyProgress)
                .HasForeignKey(mpe => mpe.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasMany(mp => mp.ProgressDeliverables)
                .WithOne(pd => pd.MonthlyProgress)
                .HasForeignKey(pd => pd.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasMany(mp => mp.ChangeOrders)
                .WithOne(co => co.MonthlyProgress)
                .HasForeignKey(co => co.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasMany(mp => mp.LastMonthActions)
                .WithOne(lma => lma.MonthlyProgress)
                .HasForeignKey(lma => lma.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasMany(mp => mp.CurrentMonthActions)
                .WithOne(cma => cma.MonthlyProgress)
                .HasForeignKey(cma => cma.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasMany(mp => mp.ProgrammeSchedules)
                .WithOne(ps => ps.MonthlyProgress)
                .HasForeignKey(ps => ps.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasMany(mp => mp.EarlyWarnings)
                .WithOne(ew => ew.MonthlyProgress)
                .HasForeignKey(ew => ew.MonthlyProgressId);

            modelBuilder.Entity<MonthlyProgress>()
                .HasOne(mp => mp.BudgetTable)
                .WithOne(bt => bt.MonthlyProgress)
                .HasForeignKey<BudgetTable>(bt => bt.MonthlyProgressId);

            modelBuilder.Entity<BudgetTable>()
                .HasOne(bt => bt.OriginalBudget)
                .WithOne(ob => ob.BudgetTable)
                .HasForeignKey<OriginalBudget>(ob => ob.BudgetTableId);

            modelBuilder.Entity<BudgetTable>()
                .HasOne(bt => bt.CurrentBudgetInMIS)
                .WithOne(cb => cb.BudgetTable)
                .HasForeignKey<CurrentBudgetInMIS>(cb => cb.BudgetTableId);

            modelBuilder.Entity<BudgetTable>()
                .HasOne(pcc => pcc.PercentCompleteOnCosts)
                .WithOne(pcc => pcc.BudgetTable)
                .HasForeignKey<PercentCompleteOnCosts>(pcc => pcc.BudgetTableId);

            // Configure decimal precisions for Monthly Progress related entities
            modelBuilder.Entity<ContractAndCost>().Property(e => e.Percentage).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(e => e.ActualOdcs).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(e => e.ActualStaff).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(e => e.ActualSubtotal).HasPrecision(18, 2);

            modelBuilder.Entity<CurrentBudgetInMIS>().Property(e => e.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<CurrentBudgetInMIS>().Property(e => e.ProfitPercentage).HasPrecision(18, 2);
            modelBuilder.Entity<CurrentBudgetInMIS>().Property(e => e.RevenueFee).HasPrecision(18, 2);

            modelBuilder.Entity<FinancialDetails>().Property(e => e.BudgetOdcs).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(e => e.BudgetStaff).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(e => e.BudgetSubTotal).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(e => e.FeeTotal).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(e => e.Net).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(e => e.ServiceTax).HasPrecision(18, 2);

            modelBuilder.Entity<ManpowerPlanning>().Property(e => e.Balance).HasPrecision(18, 2);
            modelBuilder.Entity<ManpowerPlanning>().Property(e => e.Consumed).HasPrecision(18, 2);
            modelBuilder.Entity<ManpowerPlanning>().Property(e => e.NextMonthPlanning).HasPrecision(18, 2);
            modelBuilder.Entity<ManpowerPlanning>().Property(e => e.Planned).HasPrecision(18, 2);

            modelBuilder.Entity<MonthlyProgress>().Property(e => e.ManpowerTotal).HasPrecision(18, 2);

            modelBuilder.Entity<OriginalBudget>().Property(e => e.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<OriginalBudget>().Property(e => e.ProfitPercentage).HasPrecision(18, 2);
            modelBuilder.Entity<OriginalBudget>().Property(e => e.RevenueFee).HasPrecision(18, 2);

            modelBuilder.Entity<PercentCompleteOnCosts>().Property(e => e.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<PercentCompleteOnCosts>().Property(e => e.RevenueFee).HasPrecision(18, 2);

            modelBuilder.Entity<ProgressDeliverable>().Property(e => e.PaymentDue).HasPrecision(18, 2);

            modelBuilder.Entity<CTCEAC>().Property(e => e.CtcODC).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(e => e.CtcStaff).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(e => e.CtcSubtotal).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(e => e.GrossProfitPercentage).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(e => e.TotalEAC).HasPrecision(18, 2);

            modelBuilder.Entity<ChangeOrder>().Property(e => e.ContractTotal).HasPrecision(18, 2);
            modelBuilder.Entity<ChangeOrder>().Property(e => e.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<ChangeOrder>().Property(e => e.Fee).HasPrecision(18, 2);

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

            modelBuilder.Entity<OpportunityHistory>()
                .HasOne(oh => oh.Opportunity)
                .WithMany(o => o.OpportunityHistories)
                .HasForeignKey(oh => oh.OpportunityId);
            modelBuilder.Entity<OpportunityHistory>()
                .HasOne(oh => oh.ActionUser).WithMany(u => u.OpportunityHistories).HasForeignKey(oh => oh.ActionBy);
            modelBuilder.Entity<OpportunityHistory>().HasOne(oh => oh.Status).WithMany(s => s.OpportunityHistories).HasForeignKey(oh => oh.StatusId);

            modelBuilder.Entity<WBSHistory>()
                .HasOne(ph => ph.WBSTaskMonthlyHourHeader)
                .WithMany(p => p.WBSHistories)
                .HasForeignKey(ph => ph.WBSTaskMonthlyHourHeaderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WBSHistory>()
                .HasOne(ph => ph.ActionUser)
                .WithMany().HasForeignKey(ph => ph.ActionBy);

            modelBuilder.Entity<WBSHistory>()
                .Property(ph => ph.Comments).IsRequired(false);

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
                entity.Property(ut => ut.ResourceRoleId).IsRequired(false); // Explicitly configure ResourceRoleId

                // Configure relationships
                entity.HasOne(ut => ut.WBSTask)
                      .WithMany(t => t.UserWBSTasks)
                      .HasForeignKey(ut => ut.WBSTaskId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ut => ut.User)
                      .WithMany(u => u.UserWBSTasks)
                      .HasForeignKey(ut => ut.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(ut => ut.ResourceRole)
                      .WithMany()
                      .HasForeignKey(ut => ut.ResourceRoleId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure WorkBreakdownStructure entity
            modelBuilder.Entity<WorkBreakdownStructure>(entity =>
            {
                // Optional: Add index on ProjectId if frequent lookups by project are expected
                entity.HasIndex(w => w.ProjectId);
            });

            // Configure decimal precisions for Monthly Progress related entities
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.Percentage).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualOdcs).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualStaff).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualSubtotal).HasPrecision(18, 2);

            modelBuilder.Entity<CurrentBudgetInMIS>().Property(cb => cb.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<CurrentBudgetInMIS>().Property(cb => cb.ProfitPercentage).HasPrecision(18, 2);
            modelBuilder.Entity<CurrentBudgetInMIS>().Property(cb => cb.RevenueFee).HasPrecision(18, 2);

            modelBuilder.Entity<FinancialDetails>().Property(fd => fd.BudgetOdcs).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(fd => fd.BudgetStaff).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(fd => fd.BudgetSubTotal).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(fd => fd.FeeTotal).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(fd => fd.Net).HasPrecision(18, 2);
            modelBuilder.Entity<FinancialDetails>().Property(fd => fd.ServiceTax).HasPrecision(18, 2);

            modelBuilder.Entity<ManpowerPlanning>().Property(mp => mp.Balance).HasPrecision(18, 2);
            modelBuilder.Entity<ManpowerPlanning>().Property(mp => mp.Consumed).HasPrecision(18, 2);
            modelBuilder.Entity<ManpowerPlanning>().Property(mp => mp.NextMonthPlanning).HasPrecision(18, 2);
            modelBuilder.Entity<ManpowerPlanning>().Property(mp => mp.Planned).HasPrecision(18, 2);

            modelBuilder.Entity<MonthlyProgress>().Property(mp => mp.ManpowerTotal).HasPrecision(18, 2);

            modelBuilder.Entity<OriginalBudget>().Property(ob => ob.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<OriginalBudget>().Property(ob => ob.ProfitPercentage).HasPrecision(18, 2);
            modelBuilder.Entity<OriginalBudget>().Property(ob => ob.RevenueFee).HasPrecision(18, 2);

            modelBuilder.Entity<PercentCompleteOnCosts>().Property(pcc => pcc.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<PercentCompleteOnCosts>().Property(pcc => pcc.RevenueFee).HasPrecision(18, 2);

            modelBuilder.Entity<ProgressDeliverable>().Property(pd => pd.PaymentDue).HasPrecision(18, 2);

            modelBuilder.Entity<CTCEAC>().Property(cte => cte.CtcODC).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.CtcStaff).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.CtcSubtotal).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.GrossProfitPercentage).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.TotalEAC).HasPrecision(18, 2);

            modelBuilder.Entity<ChangeOrder>().Property(co => co.ContractTotal).HasPrecision(18, 2);
            modelBuilder.Entity<ChangeOrder>().Property(co => co.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<ChangeOrder>().Property(co => co.Fee).HasPrecision(18, 2);

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

                // Configure relationship with PMWorkflowStatus - Use Restrict to prevent cascade delete cycles
                entity.HasOne(cc => cc.WorkflowStatus)
                      .WithMany()
                      .HasForeignKey(cc => cc.WorkflowStatusId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure ProjectClosure entity
            modelBuilder.Entity<ProjectClosure>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Configure string properties with appropriate lengths
                entity.Property(e => e.ClientFeedback).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.SuccessCriteria).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ClientExpectations).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.OtherStakeholders).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.EnvIssues).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.EnvManagement).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ThirdPartyIssues).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ThirdPartyManagement).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.RiskIssues).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.RiskManagement).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.KnowledgeGoals).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.BaselineComparison).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.DelayedDeliverables).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.UnforeseeableDelays).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.BudgetEstimate).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ProfitTarget).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ChangeOrders).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.CloseOutBudget).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ResourceAvailability).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.VendorFeedback).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ProjectTeamFeedback).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.DesignOutputs).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ProjectReviewMeetings).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ClientDesignReviews).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.InternalReporting).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ClientReporting).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.InternalMeetings).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ClientMeetings).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ExternalMeetings).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.PlanUpToDate).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.PlanUseful).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.Hindrances).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ClientPayment).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.PlanningIssues).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.PlanningLessons).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.BriefAims).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.DesignReviewOutputs).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ConstructabilityReview).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.DesignReview).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.TechnicalRequirements).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.InnovativeIdeas).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.SuitableOptions).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.AdditionalInformation).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.DeliverableExpectations).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.StakeholderInvolvement).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.KnowledgeGoalsAchieved).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.TechnicalToolsDissemination).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.SpecialistKnowledgeValue).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.OtherComments).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.TargetCostAccuracy).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ChangeControlReview).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.CompensationEvents).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ExpenditureProfile).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.HealthSafetyConcerns).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ProgrammeRealistic).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ProgrammeUpdates).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.RequiredQuality).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.OperationalRequirements).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ConstructionInvolvement).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.Efficiencies).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.MaintenanceAgreements).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.AsBuiltManuals).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.HsFileForwarded).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.Variations).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.TechnoLegalIssues).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.ConstructionOther).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.Positives).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.LessonsLearned).HasMaxLength(1000).IsRequired(false);
                entity.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.UpdatedBy).HasMaxLength(100).IsRequired(false);

                // Create index on ProjectId for faster lookups
                entity.HasIndex(e => e.ProjectId);

                // Configure relationship with Project
                entity.HasOne(pc => pc.Project)
                      .WithMany()
                      .HasForeignKey(pc => pc.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configure relationship with PMWorkflowStatus - Use Restrict to prevent cascade delete cycles
                entity.HasOne(pc => pc.WorkflowStatus)
                      .WithMany()
                      .HasForeignKey(pc => pc.WorkflowStatusId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure ChangeControlWorkflowHistory entity
            modelBuilder.Entity<ChangeControlWorkflowHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).IsRequired();
                entity.Property(e => e.Comments).IsRequired(false);

                // Create indexes for faster lookups
                entity.HasIndex(e => e.ChangeControlId);
                entity.HasIndex(e => e.StatusId);
                entity.HasIndex(e => e.ActionBy);

                // Configure relationship with ChangeControl
                entity.HasOne(h => h.ChangeControl)
                      .WithMany(h => h.WorkflowHistories)
                      .HasForeignKey(h => h.ChangeControlId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configure relationship with PMWorkflowStatus - Use Restrict to prevent cascade delete cycles
                entity.HasOne(h => h.Status)
                      .WithMany()
                      .HasForeignKey(h => h.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure relationship with User (ActionBy)
                entity.HasOne(h => h.ActionUser)
                      .WithMany()
                      .HasForeignKey(h => h.ActionBy)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure relationship with User (AssignedTo)
                entity.HasOne(h => h.AssignedTo)
                      .WithMany()
                      .HasForeignKey(h => h.AssignedToId)
                      .OnDelete(DeleteBehavior.Restrict)
                      .IsRequired(false);
            });

            // Configure ProjectClosureWorkflowHistory entity
            modelBuilder.Entity<ProjectClosureWorkflowHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).IsRequired();
                entity.Property(e => e.Comments).IsRequired(false);

                // Create indexes for faster lookups
                entity.HasIndex(e => e.ProjectClosureId);
                entity.HasIndex(e => e.StatusId);
                entity.HasIndex(e => e.ActionBy);

                // Configure relationship with ProjectClosure
                entity.HasOne(h => h.ProjectClosure)
                      .WithMany(h => h.WorkflowHistories)
                      .HasForeignKey(h => h.ProjectClosureId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configure relationship with PMWorkflowStatus - Use Restrict to prevent cascade delete cycles
                entity.HasOne(h => h.Status)
                      .WithMany()
                      .HasForeignKey(h => h.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure relationship with User (ActionBy)
                entity.HasOne(h => h.ActionUser)
                      .WithMany()
                      .HasForeignKey(h => h.ActionBy)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure relationship with User (AssignedTo)
                entity.HasOne(h => h.AssignedTo)
                      .WithMany()
                      .HasForeignKey(h => h.AssignedToId)
                      .OnDelete(DeleteBehavior.Restrict)
                      .IsRequired(false);
            });

            modelBuilder.Entity<WBSTaskMonthlyHour>()
                .HasOne(m => m.WBSTaskMonthlyHourHeader)
                .WithMany(h => h.MonthlyHours)
                .HasForeignKey(m => m.WBSTaskMonthlyHourHeaderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure JobStartFormHeader entity
            modelBuilder.Entity<JobStartFormHeader>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Create indexes for faster lookups
                entity.HasIndex(e => e.FormId);
                entity.HasIndex(e => e.ProjectId);
                entity.HasIndex(e => e.StatusId);

                // Configure relationship with JobStartForm
                entity.HasOne(h => h.JobStartForm)
                      .WithOne(f => f.Header)
                      .HasForeignKey<JobStartFormHeader>(h => h.FormId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configure relationship with Project
                entity.HasOne(h => h.Project)
                      .WithMany()
                      .HasForeignKey(h => h.ProjectId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure relationship with PMWorkflowStatus
                entity.HasOne(h => h.Status)
                      .WithMany()
                      .HasForeignKey(h => h.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure JobStartFormHistory entity
            modelBuilder.Entity<JobStartFormHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).IsRequired();
                entity.Property(e => e.Comments).IsRequired(false);

                // Create indexes for faster lookups
                entity.HasIndex(e => e.JobStartFormHeaderId);
                entity.HasIndex(e => e.StatusId);
                entity.HasIndex(e => e.ActionBy);

                // Configure relationship with JobStartFormHeader
                entity.HasOne(h => h.JobStartFormHeader)
                      .WithMany(h => h.JobStartFormHistories)
                      .HasForeignKey(h => h.JobStartFormHeaderId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configure relationship with PMWorkflowStatus
                entity.HasOne(h => h.Status)
                      .WithMany()
                      .HasForeignKey(h => h.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure relationship with User (ActionBy)
                entity.HasOne(h => h.ActionUser)
                      .WithMany()
                      .HasForeignKey(h => h.ActionBy)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure relationship with User (AssignedTo)
                entity.HasOne(h => h.AssignedTo)
                      .WithMany()
                      .HasForeignKey(h => h.AssignedToId)
                      .OnDelete(DeleteBehavior.Restrict)
                      .IsRequired(false);
            });
            // Removed ProjectClosureComment entity configuration to fix build issues
            /*
            modelBuilder.Entity<ProjectClosureComment>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Configure string properties
                entity.Property(e => e.Type).HasMaxLength(20).IsRequired();
                entity.Property(e => e.Comment).IsRequired();
                entity.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired(false);
                entity.Property(e => e.UpdatedBy).HasMaxLength(100).IsRequired(false);

                // Create index on ProjectClosureId for faster lookups
                entity.HasIndex(e => e.ProjectClosureId);

                // Configure relationship with ProjectClosure
                entity.HasOne(pcc => pcc.ProjectClosure)
                      .WithMany(pc => pc.Comments)
                      .HasForeignKey(pcc => pcc.ProjectClosureId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            */

            // Seed data for OpportunityStatuses
            modelBuilder.Entity<OpportunityStatus>().HasData(
                new OpportunityStatus { Id = 1, Status = "Initial" },
                new OpportunityStatus { Id = 2, Status = "Sent for Review" },
                new OpportunityStatus { Id = 3, Status = "Review Changes" },
                new OpportunityStatus { Id = 4, Status = "Sent for Approval" },
                new OpportunityStatus { Id = 5, Status = "Approval Changes" },
                new OpportunityStatus { Id = 6, Status = "Approved" }
            );

            // Seed data for PMWorkflowStatuses
            modelBuilder.Entity<PMWorkflowStatus>().HasData(
                new PMWorkflowStatus { Id = 1, Status = "Initial" },
                new PMWorkflowStatus { Id = 2, Status = "Sent for Review" },
                new PMWorkflowStatus { Id = 3, Status = "Review Changes" },
                new PMWorkflowStatus { Id = 4, Status = "Sent for Approval" },
                new PMWorkflowStatus { Id = 5, Status = "Approval Changes" },
                new PMWorkflowStatus { Id = 6, Status = "Approved" }
            );
        }
    }
}
