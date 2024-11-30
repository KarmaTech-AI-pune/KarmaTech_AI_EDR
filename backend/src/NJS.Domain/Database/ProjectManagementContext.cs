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
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<FeasibilityStudy> FeasibilityStudies { get; set; }
        public DbSet<GoNoGoDecision> GoNoGoDecisions { get; set; }
        public DbSet<WorkBreakdownStructure> WorkBreakdownStructures { get; set; }
        public DbSet<WBSTask> WBSTasks { get; set; }
        public DbSet<UserWBSTask> UserWBSTasks { get; set; }
        public DbSet<OpportunityTracking> OpportunityTrackings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure decimal precisions
            modelBuilder.Entity<FeasibilityStudy>().Property(f => f.ProbabilityAssessment).HasPrecision(18, 2);
            modelBuilder.Entity<FeasibilityStudy>().Property(f => f.FinancialInformation).HasPrecision(18, 2);
            modelBuilder.Entity<Project>().Property(f => f.EstimatedCost).HasPrecision(18, 2);
            modelBuilder.Entity<WBSTask>().Property(f => f.Budget).HasPrecision(18, 2);
            modelBuilder.Entity<User>().Property(f => f.Avatar).IsRequired(false);
            
            // Configure OpportunityTracking decimal precisions
            modelBuilder.Entity<OpportunityTracking>()
                .Property(o => o.BidFees)
                .HasPrecision(18, 2);
            modelBuilder.Entity<OpportunityTracking>()
                .Property(o => o.EMD)
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

            // Seed Projects
            modelBuilder.Entity<Project>().HasData(
                new Project {
                    Id = 1,
                    Name = "City Water Supply Upgrade",
                    ClientName = "Metropolis Municipality",
                    ClientSector = "Government",
                    Sector = "Water",
                    EstimatedCost = 5000000,
                    StartDate = new DateTime(2023, 1, 1),
                    EndDate = new DateTime(2024, 12, 31),
                    Status = ProjectStatus.InProgress,
                    Progress = 65,
                    ContractType = "EPC",
                    Currency = "INR",
                    CreatedAt = new DateTime(2022, 12, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 2,
                    Name = "Rural Sanitation Initiative",
                    ClientName = "State Rural Development Dept",
                    ClientSector = "Government",
                    Sector = "Sanitation",
                    EstimatedCost = 2000000,
                    StartDate = new DateTime(2023, 3, 15),
                    EndDate = new DateTime(2025, 3, 14),
                    Status = ProjectStatus.Opportunity,
                    Progress = 25,
                    ContractType = "Design-Build",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 2, 15),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 3,
                    Name = "Industrial Park Drainage System",
                    ClientName = "Industrial Development Corp",
                    ClientSector = "Private",
                    Sector = "Industrial",
                    EstimatedCost = 3500000,
                    StartDate = new DateTime(2022, 7, 1),
                    EndDate = new DateTime(2023, 12, 31),
                    Status = ProjectStatus.Opportunity,
                    Progress = 100,
                    ContractType = "Turnkey",
                    Currency = "INR",
                    CreatedAt = new DateTime(2022, 6, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 4,
                    Name = "Smart City Water Management",
                    ClientName = "Smart City Development Authority",
                    ClientSector = "Government",
                    Sector = "Smart City",
                    EstimatedCost = 7500000,
                    Status = ProjectStatus.DecisionPending,
                    Progress = 0,
                    ContractType = "EPC",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 11, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 5,
                    Name = "Coastal Zone Protection",
                    ClientName = "Maritime Development Board",
                    ClientSector = "Government",
                    Sector = "Coastal",
                    EstimatedCost = 4500000,
                    StartDate = new DateTime(2023, 6, 1),
                    EndDate = new DateTime(2025, 5, 31),
                    Status = ProjectStatus.Cancelled,
                    Progress = 45,
                    ContractType = "Design-Build",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 5, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 6,
                    Name = "Urban Flood Management",
                    ClientName = "City Municipal Corporation",
                    ClientSector = "Government",
                    Sector = "Urban Infrastructure",
                    EstimatedCost = 3200000,
                    Status = ProjectStatus.DecisionPending,
                    Progress = 0,
                    ContractType = "EPC",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 11, 15),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 7,
                    Name = "Pune City Water Supply Upgrade",
                    ClientName = "Municipality",
                    ClientSector = "Government",
                    Sector = "Water",
                    EstimatedCost = 600000,
                    StartDate = new DateTime(2023, 1, 1),
                    EndDate = new DateTime(2024, 12, 31),
                    Status = ProjectStatus.InProgress,
                    Progress = 65,
                    ContractType = "EPC",
                    Currency = "INR",
                    CreatedAt = new DateTime(2022, 12, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 8,
                    Name = "Rural Initiative",
                    ClientName = "Maharashtra Rural Development Dept",
                    ClientSector = "Government",
                    Sector = "Sanitation",
                    EstimatedCost = 2000000,
                    StartDate = new DateTime(2023, 3, 15),
                    EndDate = new DateTime(2025, 3, 14),
                    Status = ProjectStatus.BidSubmitted,
                    Progress = 25,
                    ContractType = "Design-Build",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 2, 15),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 9,
                    Name = "Industrial Park System",
                    ClientName = "Industrial Development Corp",
                    ClientSector = "Private",
                    Sector = "Industrial",
                    EstimatedCost = 3500000,
                    StartDate = new DateTime(2022, 7, 1),
                    EndDate = new DateTime(2023, 12, 31),
                    Status = ProjectStatus.BidSubmitted,
                    Progress = 100,
                    ContractType = "Turnkey",
                    Currency = "INR",
                    CreatedAt = new DateTime(2022, 6, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 10,
                    Name = "City Water Management 2",
                    ClientName = "Smart City Development Authority",
                    ClientSector = "Government",
                    Sector = "Smart City",
                    EstimatedCost = 7500000,
                    Status = ProjectStatus.BidRejected,
                    Progress = 0,
                    ContractType = "EPC",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 11, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 11,
                    Name = "Coastal Protection 2",
                    ClientName = "Maritime Development Board",
                    ClientSector = "Government",
                    Sector = "Coastal",
                    EstimatedCost = 4500000,
                    StartDate = new DateTime(2023, 6, 1),
                    EndDate = new DateTime(2025, 5, 31),
                    Status = ProjectStatus.BidAccepted,
                    Progress = 45,
                    ContractType = "Design-Build",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 5, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 12,
                    Name = "Urban Management",
                    ClientName = "City Municipal Corporation",
                    ClientSector = "Government",
                    Sector = "Urban Infrastructure",
                    EstimatedCost = 3200000,
                    Status = ProjectStatus.BidAccepted,
                    Progress = 0,
                    ContractType = "EPC",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 11, 15),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 13,
                    Name = "Urban Management 23",
                    ClientName = "City Municipal Corporation",
                    ClientSector = "Government",
                    Sector = "Urban Infrastructure",
                    EstimatedCost = 3900000,
                    Status = ProjectStatus.Completed,
                    Progress = 0,
                    ContractType = "EPC",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 11, 15),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 14,
                    Name = "Mega Industrial Park",
                    ClientName = "State Industrial Development Corp",
                    ClientSector = "Government",
                    Sector = "Industrial",
                    EstimatedCost = 12500000,
                    Status = ProjectStatus.Opportunity,
                    Progress = 0,
                    ContractType = "EPC",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 12, 1),
                    CreatedBy = "System"
                },
                new Project {
                    Id = 15,
                    Name = "Expressway Stormwater Drainage",
                    ClientName = "National Highway Authority",
                    ClientSector = "Government",
                    Sector = "Transportation",
                    EstimatedCost = 7800000,
                    Status = ProjectStatus.Opportunity,
                    Progress = 0,
                    ContractType = "Design-Build",
                    Currency = "INR",
                    CreatedAt = new DateTime(2023, 12, 5),
                    CreatedBy = "System"
                }
        
            );

            // Seed GoNoGoDecisions
            modelBuilder.Entity<GoNoGoDecision>().HasData(
                new GoNoGoDecision {
                    Id = 1,
                    ProjectId = 1,
                    BidType = "Lumpsum",
                    Sector = "Water",
                    TenderFee = 5000,
                    EMDAmount = 100000,
                    MarketingPlanScore = 8,
                    MarketingPlanComments = "Strong marketing strategy in water sector",
                    ClientRelationshipScore = 7,
                    ClientRelationshipComments = "Good relationship with municipality",
                    ProjectKnowledgeScore = 8,
                    ProjectKnowledgeComments = "Extensive experience in water supply projects",
                    TechnicalEligibilityScore = 9,
                    TechnicalEligibilityComments = "Meets all technical requirements",
                    FinancialEligibilityScore = 8,
                    FinancialEligibilityComments = "Strong financial position",
                    StaffAvailabilityScore = 7,
                    StaffAvailabilityComments = "Required staff available",
                    CompetitionAssessmentScore = 8,
                    CompetitionAssessmentComments = "Limited competition in this sector",
                    CompetitivePositionScore = 8,
                    CompetitivePositionComments = "Strong market position",
                    FutureWorkPotentialScore = 9,
                    FutureWorkPotentialComments = "High potential for similar projects",
                    ProfitabilityScore = 8,
                    ProfitabilityComments = "Good profit margins expected",
                    ResourceAvailabilityScore = 7,
                    ResourceAvailabilityComments = "Resources can be allocated",
                    BidScheduleScore = 8,
                    BidScheduleComments = "Timeline is achievable",
                    TotalScore = 95,
                    Status = GoNoGoStatus.Green,
                    DecisionComments = "Project aligns with our expertise",
                    CompletedDate = new DateTime(2022, 11, 15),
                    CompletedBy = "System",
                    CreatedAt = new DateTime(2022, 11, 15),
                    CreatedBy = "System"
                },
                
                // For Project 4 (DecisionPending)
                new GoNoGoDecision {
                    Id = 2,
                    ProjectId = 4,
                    BidType = "EPC",
                    Sector = "Smart City",
                    TenderFee = 7500,
                    EMDAmount = 150000,
                    MarketingPlanScore = 7,
                    MarketingPlanComments = "Developing marketing strategy",
                    ClientRelationshipScore = 8,
                    ClientRelationshipComments = "Strong relationship with authority",
                    ProjectKnowledgeScore = 7,
                    ProjectKnowledgeComments = "Good understanding of requirements",
                    TechnicalEligibilityScore = 8,
                    TechnicalEligibilityComments = "Meets technical criteria",
                    FinancialEligibilityScore = 8,
                    FinancialEligibilityComments = "Financially capable",
                    StaffAvailabilityScore = 6,
                    StaffAvailabilityComments = "Some resource allocation needed",
                    CompetitionAssessmentScore = 7,
                    CompetitionAssessmentComments = "Moderate competition",
                    CompetitivePositionScore = 7,
                    CompetitivePositionComments = "Good market position",
                    FutureWorkPotentialScore = 8,
                    FutureWorkPotentialComments = "Potential for future smart city projects",
                    ProfitabilityScore = 7,
                    ProfitabilityComments = "Acceptable profit margins",
                    ResourceAvailabilityScore = 6,
                    ResourceAvailabilityComments = "Resource planning required",
                    BidScheduleScore = 7,
                    BidScheduleComments = "Timeline manageable",
                    TotalScore = 86,
                    Status = GoNoGoStatus.Amber,
                    DecisionComments = "Proceed with careful resource planning",
                    CompletedDate = new DateTime(2023, 10, 15),
                    CompletedBy = "System",
                    CreatedAt = new DateTime(2023, 10, 15),
                    CreatedBy = "System"
                },

                // For Project 5 (Cancelled)
                new GoNoGoDecision {
                    Id = 3,
                    ProjectId = 5,
                    BidType = "Design-Build",
                    Sector = "Coastal",
                    TenderFee = 4500,
                    EMDAmount = 90000,
                    MarketingPlanScore = 5,
                    MarketingPlanComments = "Limited market presence in coastal sector",
                    ClientRelationshipScore = 6,
                    ClientRelationshipComments = "New client relationship",
                    ProjectKnowledgeScore = 5,
                    ProjectKnowledgeComments = "Limited experience in coastal projects",
                    TechnicalEligibilityScore = 6,
                    TechnicalEligibilityComments = "Some technical gaps identified",
                    FinancialEligibilityScore = 7,
                    FinancialEligibilityComments = "Financial requirements met",
                    StaffAvailabilityScore = 4,
                    StaffAvailabilityComments = "Resource constraints identified",
                    CompetitionAssessmentScore = 5,
                    CompetitionAssessmentComments = "Strong competition in sector",
                    CompetitivePositionScore = 5,
                    CompetitivePositionComments = "Limited competitive advantage",
                    FutureWorkPotentialScore = 6,
                    FutureWorkPotentialComments = "Moderate future potential",
                    ProfitabilityScore = 5,
                    ProfitabilityComments = "Low profit margins expected",
                    ResourceAvailabilityScore = 4,
                    ResourceAvailabilityComments = "Significant resource gaps",
                    BidScheduleScore = 6,
                    BidScheduleComments = "Timeline challenging",
                    TotalScore = 64,
                    Status = GoNoGoStatus.Red,
                    DecisionComments = "Project risks outweigh potential benefits",
                    CompletedDate = new DateTime(2023, 5, 15),
                    CompletedBy = "System",
                    CreatedAt = new DateTime(2023, 5, 15),
                    CreatedBy = "System"
                }
                // Truncated for brevity, but would include all Go/No Go decisions
            );

            // Seed OpportunityTrackings
            modelBuilder.Entity<OpportunityTracking>().HasData(
                new OpportunityTracking {
                    Id = 1,
                    ProjectId = 2,
                    Stage = "B",
                    StrategicRanking = "H",
                    BidFees = 75000,
                    EMD = 150000,
                    FormOfEMD = "Bank Guarantee",
                    BidManager = "John Smith",
                    ContactPersonAtClient = "Rajesh Kumar",
                    DateOfSubmission = new DateTime(2023, 12, 15),
                    PercentageChanceOfProjectHappening = 75.5m,
                    PercentageChanceOfNJSSuccess = 65.0m,
                    LikelyCompetition = "L&T, HCC, Gammon",
                    GrossRevenue = 7500000,
                    NetNJSRevenue = 6000000,
                    FollowUpComments = "Client very interested in smart solutions",
                    Notes = "Need to focus on IoT integration",
                    ProbableQualifyingCriteria = "Similar project experience, Local presence",
                    Month = 11,
                    Year = 2023,
                    TrackedBy = "System",
                    CreatedAt = new DateTime(2023, 11, 1),
                    CreatedBy = "System",
                    LastModifiedAt = new DateTime(2023, 11, 15),
                    LastModifiedBy = "System"
                },
                new OpportunityTracking {
                    Id = 2,
                    ProjectId = 3,
                    Stage = "A",
                    StrategicRanking = "M",
                    BidFees = 50000,
                    EMD = 100000,
                    FormOfEMD = "Bank Draft",
                    BidManager = "Sarah Johnson",
                    ContactPersonAtClient = "Amit Patel",
                    DateOfSubmission = new DateTime(2023, 12, 30),
                    PercentageChanceOfProjectHappening = 60.0m,
                    PercentageChanceOfNJSSuccess = 55.0m,
                    LikelyCompetition = "Tata Projects, SPML Infra",
                    GrossRevenue = 3200000,
                    NetNJSRevenue = 2500000,
                    FollowUpComments = "Technical presentation scheduled",
                    Notes = "Focus on flood prediction systems",
                    ProbableQualifyingCriteria = "Similar project experience, Local presence",
                    Month = 11,
                    Year = 2023,
                    TrackedBy = "System",
                    CreatedAt = new DateTime(2023, 11, 15),
                    CreatedBy = "System",
                    LastModifiedAt = new DateTime(2023, 11, 20),
                    LastModifiedBy = "System"
                },
                new OpportunityTracking {
                    Id = 3,
                    ProjectId = 13,
                    Stage = "B",
                    StrategicRanking = "M",
                    BidFees = 50000,
                    EMD = 100000,
                    FormOfEMD = "Bank Draft",
                    BidManager = "John Johnson",
                    ContactPersonAtClient = "Amita Patel",
                    DateOfSubmission = new DateTime(2023, 12, 30),
                    PercentageChanceOfProjectHappening = 60.0m,
                    PercentageChanceOfNJSSuccess = 55.0m,
                    LikelyCompetition = "Tata Projects, SPML Infra",
                    GrossRevenue = 3200000,
                    NetNJSRevenue = 2500000,
                    FollowUpComments = "Technical presentation scheduled",
                    Notes = "Focus on flood prediction systems",
                    ProbableQualifyingCriteria = "Similar project experience, Local presence",
                    Month = 11,
                    Year = 2023,
                    TrackedBy = "System",
                    CreatedAt = new DateTime(2023, 11, 15),
                    CreatedBy = "System",
                    LastModifiedAt = new DateTime(2023, 11, 20),
                    LastModifiedBy = "System"
                },
                new OpportunityTracking {
                    Id = 4,
                    ProjectId = 15,
                    Stage = "A",
                    StrategicRanking = "M",
                    BidFees = 50000,
                    EMD = 100000,
                    FormOfEMD = "Bank Draft",
                    BidManager = "Sarah Johnson",
                    ContactPersonAtClient = "Amit Patel",
                    DateOfSubmission = new DateTime(2023, 12, 30),
                    PercentageChanceOfProjectHappening = 60.0m,
                    PercentageChanceOfNJSSuccess = 55.0m,
                    LikelyCompetition = "Tata Projects, SPML Infra, ABC",
                    GrossRevenue = 3200000,
                    NetNJSRevenue = 2500000,
                    FollowUpComments = "Technical presentation scheduled",
                    Notes = "Focus on flood prediction systems",
                    ProbableQualifyingCriteria = "Similar project experience, Local presence",
                    Month = 11,
                    Year = 2023,
                    TrackedBy = "System",
                    CreatedAt = new DateTime(2023, 11, 15),
                    CreatedBy = "System",
                    LastModifiedAt = new DateTime(2023, 11, 20),
                    LastModifiedBy = "System"
                }
            );
        }
    }
}
