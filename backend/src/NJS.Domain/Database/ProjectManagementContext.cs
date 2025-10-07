using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;
using NJS.Domain.Services;

namespace NJS.Domain.Database
{
    public class ProjectManagementContext : IdentityDbContext<User, Role, string>
    {
        public int? TenantId { get; private set; }
        private readonly ICurrentTenantService _currentTenantService;
        public string CurrentTenantConnectionString { get; set; }


        public ProjectManagementContext(
            DbContextOptions<ProjectManagementContext> options,
            ICurrentTenantService currentTenantService
           ) : base(options)
        {
            _currentTenantService = currentTenantService;
            TenantId = _currentTenantService?.TenantId ?? 1;
            CurrentTenantConnectionString = _currentTenantService?.ConnectionString;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!string.IsNullOrEmpty(CurrentTenantConnectionString))
            {
                optionsBuilder.UseSqlServer(CurrentTenantConnectionString);
            }
            base.OnConfiguring(optionsBuilder);
        }



        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                    case EntityState.Modified:
                        entry.Entity.TenantId = TenantId.Value;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }

        // Tenant-specific tables only
        public DbSet<BidPreparation> BidPreparations { get; set; }
        public DbSet<BidVersionHistory> BidVersionHistories { get; set; }
        public DbSet<Project> Projects { get; set; }
        public new DbSet<User> Users { get; set; }
        public new DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<GoNoGoDecision> GoNoGoDecisions { get; set; }
        public DbSet<WorkBreakdownStructure> WorkBreakdownStructures { get; set; }
        public DbSet<WBSTask> WBSTasks { get; set; }
        public DbSet<WBSTaskPlannedHourHeader> WBSTaskPlannedHourHeaders { get; set; } // Added
        public DbSet<WBSTaskPlannedHour> WBSTaskPlannedHours { get; set; } // Added
        public DbSet<UserWBSTask> UserWBSTasks { get; set; }
        public DbSet<WBSOption> WBSOptions { get; set; }
        public DbSet<OpportunityTracking> OpportunityTrackings { get; set; }
        public DbSet<ProjectResource> ProjectResources { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<OpportunityStatus> OpportunityStatuses { get; set; }
        public DbSet<OpportunityHistory> OpportunityHistories { get; set; }
        public DbSet<WBSHistory> WBSHistories { get; set; }

        // WBS Versioning entities
        public DbSet<WBSVersionHistory> WBSVersionHistories { get; set; }

        public DbSet<MeasurementUnit> MeasurementUnits { get; set; }
        public DbSet<WBSTaskVersionHistory> WBSTaskVersionHistories { get; set; }
        public DbSet<WBSVersionWorkflowHistory> WBSVersionWorkflowHistories { get; set; }
        public DbSet<WBSTaskPlannedHourVersionHistory> WBSTaskPlannedHourVersionHistories { get; set; }
        public DbSet<UserWBSTaskVersionHistory> UserWBSTaskVersionHistories { get; set; }

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
        public DbSet<Cashflow> Cashflows { get; set; }

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
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<TwoFactorCode> TwoFactorCodes { get; set; }
        public DbSet<SprintTask> SprintTasks { get; set; }
        public DbSet<SprintSubtask> SprintSubtasks { get; set; }
        public DbSet<SprintPlan> SprintPlans { get; set; }

        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<CreateAccount> CreateAccounts { get; set; }
        public DbSet<Feature> Features { get; set; }

        public DbSet<SubscriptionPlanFeature> SubscriptionPlanFeatures { get; set; }

        // Main Projects (tenant-based) - Note: This was already defined above


        public DbSet<TodoNewTeamMember> TodoNewTeamMembers { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);



            // TodoNewSubtask assignee/reporter fields are regular strings, no foreign key relationships

            modelBuilder.Entity<Project>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ChangeControl>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<CheckReview>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<CorrespondenceInward>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<CorrespondenceOutward>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<GoNoGoDecision>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<InputRegister>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<JobStartForm>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<JobStartFormHeader>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<MonthlyProgress>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ProjectClosure>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ProjectResource>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<WBSTaskPlannedHourHeader>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<WorkBreakdownStructure>().HasQueryFilter(p => p.TenantId == TenantId);
            // Add other entities that need to be filtered by TenantId here
            modelBuilder.Entity<BudgetTable>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<CTCEAC>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ChangeControlWorkflowHistory>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ChangeOrder>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ContractAndCost>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<CurrentMonthAction>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<EarlyWarning>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<FinancialDetails>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<JobStartFormHistory>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<JobStartFormResource>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<JobStartFormSelection>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<LastMonthAction>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ManpowerPlanning>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ProgrammeSchedule>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ProgressDeliverable>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<ProjectClosureWorkflowHistory>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<Schedule>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<WBSHistory>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<WBSTask>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<WBSTaskPlannedHour>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<WBSVersionHistory>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<OriginalBudget>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<CurrentBudgetInMIS>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<PercentCompleteOnCosts>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<UserWBSTask>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<WBSTaskVersionHistory>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<WBSVersionWorkflowHistory>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<UserWBSTaskVersionHistory>().HasQueryFilter(p => p.TenantId == TenantId);
            modelBuilder.Entity<MeasurementUnit>().HasQueryFilter(p => TenantId == null || p.TenantId == TenantId);

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
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.PriorCumulativeOdc).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.PriorCumulativeStaff).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.PriorCumulativeTotal).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualOdc).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualStaff).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualSubtotal).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.TotalCumulativeOdc).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.TotalCumulativeStaff).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.TotalCumulativeCost).HasPrecision(18, 2);

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
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.ActualctcODC).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.ActualCtcStaff).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.ActualCtcSubtotal).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.EacOdc).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.EacStaff).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.GrossProfitPercentage).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.TotalEAC).HasPrecision(18, 2);

            modelBuilder.Entity<ChangeOrder>().Property(co => co.ContractTotal).HasPrecision(18, 2);
            modelBuilder.Entity<ChangeOrder>().Property(co => co.Cost).HasPrecision(18, 2);
            modelBuilder.Entity<ChangeOrder>().Property(co => co.Fee).HasPrecision(18, 2);

            modelBuilder.Entity<Feature>().Property(f => f.PriceINR).HasPrecision(18, 2);
            modelBuilder.Entity<Feature>().Property(f => f.PriceUSD).HasPrecision(18, 2);

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
            modelBuilder.Entity<Project>().Property(f => f.EstimatedProjectCost).HasPrecision(18, 2);
            modelBuilder.Entity<Project>().Property(f => f.EstimatedProjectFee).HasPrecision(18, 2);
            modelBuilder.Entity<User>().Property(f => f.Avatar).IsRequired(false);
            modelBuilder.Entity<Role>().ToTable("AspNetRoles");
            modelBuilder.Entity<Permission>().ToTable("Permissions");

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
            //modelBuilder.Entity<OpportunityHistory>()
            //.HasOne(oh => oh.ActionUser).WithMany(u => u.OpportunityHistories).HasForeignKey(oh => oh.ActionBy);
            modelBuilder.Entity<OpportunityHistory>().HasOne(oh => oh.Status).WithMany(s => s.OpportunityHistories).HasForeignKey(oh => oh.StatusId);

            modelBuilder.Entity<WBSHistory>()
                .HasOne(ph => ph.WBSTaskPlannedHourHeader)
                .WithMany(p => p.WBSHistories)
                .HasForeignKey(ph => ph.WBSTaskPlannedHourHeaderId)
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
                entity.Property(e => e.ParentValue).HasColumnType("nvarchar(max)");
                entity.Property(e => e.FormType).IsRequired();

                // Create index on Level for faster lookups
                entity.HasIndex(e => e.Level);

                // Removed index on ParentValue. SQL Server does not allow standard indexes on nvarchar(max) columns,
                // especially when they contain JSON arrays, which is the intended use for this column.
                // Hierarchical queries will need to parse the JSON in the application or use database-specific JSON functions.

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
                  .OnDelete(DeleteBehavior.Restrict); // Changed to Restrict to break cascade cycle

                // Configure relationship with WBSTaskPlannedHour
                entity.HasMany(t => t.PlannedHours) // Assuming WBSTask has a collection of PlannedHours
                      .WithOne(ph => ph.WBSTask)
                      .HasForeignKey(ph => ph.WBSTaskId)
                      .OnDelete(DeleteBehavior.Restrict); // Changed to Restrict to break cascade cycle
            });

            // Configure JobStartForm entity
            modelBuilder.Entity<JobStartForm>(entity =>
            {
                entity.HasKey(e => e.FormId);

                entity.Property(e => e.GrandTotal).HasPrecision(18, 2);
                entity.Property(e => e.Profit).HasPrecision(18, 2);
                entity.Property(e => e.ProfitPercentage).HasPrecision(18, 2);
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

                // Configure relationships with version history
                entity.HasMany(w => w.VersionHistory)
                      .WithOne(v => v.WorkBreakdownStructure)
                      .HasForeignKey(v => v.WorkBreakdownStructureId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configure navigation properties for version management
                entity.HasOne(w => w.LatestVersion)
                      .WithMany()
                      .HasForeignKey(w => w.LatestVersionHistoryId)
                      .OnDelete(DeleteBehavior.NoAction)
                      .IsRequired(false);

                entity.HasOne(w => w.ActiveVersion)
                      .WithMany()
                      .HasForeignKey(w => w.ActiveVersionHistoryId)
                      .OnDelete(DeleteBehavior.NoAction)
                      .IsRequired(false);
            });

            // Configure WBS Version History entity
            modelBuilder.Entity<WBSVersionHistory>(entity =>
            {
                entity.Property(v => v.Version).HasMaxLength(20).IsRequired();
                entity.Property(v => v.Comments).HasMaxLength(1000);

                // Configure relationships
                entity.HasOne(v => v.Status)
                      .WithMany()
                      .HasForeignKey(v => v.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(v => v.CreatedByUser)
                      .WithMany()
                      .HasForeignKey(v => v.CreatedBy)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(v => v.ApprovedByUser)
                      .WithMany()
                      .HasForeignKey(v => v.ApprovedBy)
                      .OnDelete(DeleteBehavior.Restrict);

                // Indexes for performance
                entity.HasIndex(v => v.WorkBreakdownStructureId);
                entity.HasIndex(v => v.Version);
                entity.HasIndex(v => v.IsActive);
                entity.HasIndex(v => v.IsLatest);
                entity.HasIndex(v => v.CreatedAt);
            });

            // Configure WBS Task Version History entity
            modelBuilder.Entity<WBSTaskVersionHistory>(entity =>
            {
                entity.Property(t => t.EstimatedBudget).HasPrecision(18, 2);
                entity.Property(t => t.Title).HasMaxLength(255).IsRequired();
                entity.Property(t => t.Description).HasMaxLength(1000);

                // Configure self-referencing relationship for hierarchy
                entity.HasOne(t => t.Parent)
                      .WithMany(t => t.Children)
                      .HasForeignKey(t => t.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure relationship with WBS Version History
                entity.HasOne(t => t.WBSVersionHistory)
                      .WithMany(v => v.TaskVersions)
                      .HasForeignKey(t => t.WBSVersionHistoryId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Indexes for performance
                entity.HasIndex(t => t.WBSVersionHistoryId);
                entity.HasIndex(t => t.OriginalTaskId);
                entity.HasIndex(t => t.ParentId);
                entity.HasIndex(t => t.DisplayOrder);
            });

            // Configure WBS Version Workflow History entity
            modelBuilder.Entity<WBSVersionWorkflowHistory>(entity =>
            {
                entity.Property(h => h.Action).HasMaxLength(100);
                entity.Property(h => h.Comments).HasMaxLength(1000);

                // Configure relationships
                entity.HasOne(h => h.Status)
                      .WithMany()
                      .HasForeignKey(h => h.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(h => h.ActionUser)
                      .WithMany()
                      .HasForeignKey(h => h.ActionBy)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(h => h.AssignedTo)
                      .WithMany()
                      .HasForeignKey(h => h.AssignedToId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Indexes for performance
                entity.HasIndex(h => h.WBSVersionHistoryId);
                entity.HasIndex(h => h.ActionDate);
            });

            // Configure WBS Task Planned Hour Version History entity
            modelBuilder.Entity<WBSTaskPlannedHourVersionHistory>(entity =>
            {
                entity.Property(ph => ph.Year).HasMaxLength(4).IsRequired();
                entity.Property(ph => ph.Month).HasMaxLength(20).IsRequired();
                entity.Property(ph => ph.CreatedBy).HasMaxLength(100);

                // Configure relationship with WBS Task Version History
                entity.HasOne(ph => ph.WBSTaskVersionHistory)
                      .WithMany(t => t.PlannedHours)
                      .HasForeignKey(ph => ph.WBSTaskVersionHistoryId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Indexes for performance
                entity.HasIndex(ph => ph.WBSTaskVersionHistoryId);
            });

            // Configure User WBS Task Version History entity
            modelBuilder.Entity<UserWBSTaskVersionHistory>(entity =>
            {
                entity.Property(ut => ut.CostRate).HasPrecision(18, 2);
                entity.Property(ut => ut.TotalCost).HasPrecision(18, 2);
                entity.Property(ut => ut.Name).HasMaxLength(255);
                entity.Property(ut => ut.Unit).HasMaxLength(50);
                entity.Property(ut => ut.CreatedBy).HasMaxLength(100);
                entity.Property(ut => ut.ResourceRoleId).IsRequired(false);

                // Configure relationships
                entity.HasOne(ut => ut.WBSTaskVersionHistory)
                      .WithMany(t => t.UserAssignments)
                      .HasForeignKey(ut => ut.WBSTaskVersionHistoryId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ut => ut.User)
                      .WithMany()
                      .HasForeignKey(ut => ut.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(ut => ut.ResourceRole)
                      .WithMany()
                      .HasForeignKey(ut => ut.ResourceRoleId)
                      .OnDelete(DeleteBehavior.SetNull);

                // Indexes for performance
                entity.HasIndex(ut => ut.WBSTaskVersionHistoryId);
                entity.HasIndex(ut => ut.UserId);
            });

            // Configure decimal precisions for Monthly Progress related entities
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.PriorCumulativeOdc).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.PriorCumulativeStaff).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.PriorCumulativeTotal).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualOdc).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualStaff).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.ActualSubtotal).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.TotalCumulativeOdc).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.TotalCumulativeStaff).HasPrecision(18, 2);
            modelBuilder.Entity<ContractAndCost>().Property(cc => cc.TotalCumulativeCost).HasPrecision(18, 2);

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
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.ActualctcODC).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.ActualCtcStaff).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.ActualCtcSubtotal).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.EacOdc).HasPrecision(18, 2);
            modelBuilder.Entity<CTCEAC>().Property(cte => cte.EacStaff).HasPrecision(18, 2);
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
                      .OnDelete(DeleteBehavior.NoAction)
                      .IsRequired();

                // Configure relationship with PMWorkflowStatus - Use NO ACTION to prevent cascade delete cycles
                entity.HasOne(cc => cc.WorkflowStatus)
                      .WithMany()
                      .HasForeignKey(cc => cc.WorkflowStatusId)
                      .OnDelete(DeleteBehavior.NoAction)
                      .IsRequired();
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

                // ChangeControl → WorkflowHistories: Cascade (primary deletion path)
                entity.HasOne(h => h.ChangeControl)
                      .WithMany(h => h.WorkflowHistories)
                      .HasForeignKey(h => h.ChangeControlId)
                      .OnDelete(DeleteBehavior.Cascade);

                // PMWorkflowStatus: NO ACTION (prevent multiple cascade paths)
                entity.HasOne(h => h.Status)
                      .WithMany()
                      .HasForeignKey(h => h.StatusId)
                      .OnDelete(DeleteBehavior.NoAction)
                      .IsRequired();

                // User (ActionBy): NO ACTION (prevent multiple cascade paths)
                entity.HasOne(h => h.ActionUser)
                      .WithMany()
                      .HasForeignKey(h => h.ActionBy)
                      .OnDelete(DeleteBehavior.NoAction)
                      .IsRequired();

                // User (AssignedTo): NO ACTION, optional (prevent multiple cascade paths)
                entity.HasOne(h => h.AssignedTo)
                      .WithMany()
                      .HasForeignKey(h => h.AssignedToId)
                      .OnDelete(DeleteBehavior.NoAction)
                      .IsRequired(false);
            });

            // Configure ChangeControlWorkflowHistory entity
            //modelBuilder.Entity<ChangeControlWorkflowHistory>(entity =>
            //{
            //    entity.HasKey(e => e.Id);
            //    entity.Property(e => e.Action).IsRequired();
            //    entity.Property(e => e.Comments).IsRequired(false);

            //    // Create indexes for faster lookups
            //    entity.HasIndex(e => e.ChangeControlId);
            //    entity.HasIndex(e => e.StatusId);
            //    entity.HasIndex(e => e.ActionBy);

            //    // Configure relationship with ChangeControl
            //    entity.HasOne(h => h.ChangeControl)
            //          .WithMany(h => h.WorkflowHistories)
            //          .HasForeignKey(h => h.ChangeControlId)
            //          .OnDelete(DeleteBehavior.Restrict);

            //    // Configure relationship with PMWorkflowStatus - Use Restrict to prevent cascade delete cycles
            //    entity.HasOne(h => h.Status)
            //          .WithMany()
            //          .HasForeignKey(h => h.StatusId)
            //          .OnDelete(DeleteBehavior.Restrict);

            //    // Configure relationship with User (ActionBy)
            //    entity.HasOne(h => h.ActionUser)
            //          .WithMany()
            //          .HasForeignKey(h => h.ActionBy)
            //          .OnDelete(DeleteBehavior.Restrict);

            //    // Configure relationship with User (AssignedTo)
            //    entity.HasOne(h => h.AssignedTo)
            //          .WithMany()
            //          .HasForeignKey(h => h.AssignedToId)
            //          .OnDelete(DeleteBehavior.Restrict)
            //          .IsRequired(false);
            //});

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

            modelBuilder.Entity<WBSTaskPlannedHour>()
                .HasOne(m => m.WBSTaskPlannedHourHeader)
                .WithMany(h => h.PlannedHours)
                .HasForeignKey(m => m.WBSTaskPlannedHourHeaderId)
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


            // Configure AuditLog entity
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EntityName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Action).HasMaxLength(50).IsRequired();
                entity.Property(e => e.EntityId).IsRequired();
                entity.Property(e => e.OldValues).IsRequired();
                entity.Property(e => e.NewValues).IsRequired();
                entity.Property(e => e.ChangedBy).HasMaxLength(100).IsRequired();
                entity.Property(e => e.ChangedAt).IsRequired();
                entity.Property(e => e.Reason).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.IpAddress).HasMaxLength(50).IsRequired(false);
                entity.Property(e => e.UserAgent).HasMaxLength(500).IsRequired(false);

                // Create indexes for better performance
                entity.HasIndex(e => e.EntityName);
                entity.HasIndex(e => e.EntityId);
                entity.HasIndex(e => e.ChangedBy);
                entity.HasIndex(e => e.ChangedAt);
                entity.HasIndex(e => new { e.EntityName, e.EntityId });
            });

            modelBuilder.Entity<SubscriptionPlanFeature>()
                .HasKey(spf => spf.Id);

            modelBuilder.Entity<SubscriptionPlanFeature>()
                .HasOne(spf => spf.SubscriptionPlan)
                .WithMany(sp => sp.SubscriptionPlanFeatures)
                .HasForeignKey(spf => spf.SubscriptionPlanId);

            modelBuilder.Entity<SubscriptionPlanFeature>()
                .HasOne(spf => spf.Feature)
                .WithMany(f => f.SubscriptionPlanFeatures)
                .HasForeignKey(spf => spf.FeatureId);


        }

    }

}
