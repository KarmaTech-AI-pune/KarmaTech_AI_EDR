using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class SeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ClientSector = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Sector = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CapitalValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Progress = table.Column<int>(type: "int", nullable: false),
                    DurationInMonths = table.Column<int>(type: "int", nullable: true),
                    FundingStream = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContractType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeasibilityStudies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    ProjectDetails = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StrategicRanking = table.Column<int>(type: "int", nullable: false),
                    FinancialInformation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    StudyDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProbabilityAssessment = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CompetitionAnalysis = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FundingStream = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContractType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QualifyingCriteria = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeasibilityStudies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeasibilityStudies_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GoNoGoDecisions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    BidType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Sector = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TenderFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EMDAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MarketingPlanScore = table.Column<int>(type: "int", nullable: false),
                    MarketingPlanComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ClientRelationshipScore = table.Column<int>(type: "int", nullable: false),
                    ClientRelationshipComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ProjectKnowledgeScore = table.Column<int>(type: "int", nullable: false),
                    ProjectKnowledgeComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TechnicalEligibilityScore = table.Column<int>(type: "int", nullable: false),
                    TechnicalEligibilityComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FinancialEligibilityScore = table.Column<int>(type: "int", nullable: false),
                    FinancialEligibilityComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    StaffAvailabilityScore = table.Column<int>(type: "int", nullable: false),
                    StaffAvailabilityComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CompetitionAssessmentScore = table.Column<int>(type: "int", nullable: false),
                    CompetitionAssessmentComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CompetitivePositionScore = table.Column<int>(type: "int", nullable: false),
                    CompetitivePositionComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FutureWorkPotentialScore = table.Column<int>(type: "int", nullable: false),
                    FutureWorkPotentialComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ProfitabilityScore = table.Column<int>(type: "int", nullable: false),
                    ProfitabilityComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ResourceAvailabilityScore = table.Column<int>(type: "int", nullable: false),
                    ResourceAvailabilityComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    BidScheduleScore = table.Column<int>(type: "int", nullable: false),
                    BidScheduleComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TotalScore = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DecisionComments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReviewedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ActionPlan = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoNoGoDecisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoNoGoDecisions_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityTrackings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    Stage = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    StrategicRanking = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    BidFees = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EMD = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FormOfEMD = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    BidManager = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContactPersonAtClient = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DateOfSubmission = table.Column<DateTime>(type: "date", nullable: true),
                    PercentageChanceOfProjectHappening = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    PercentageChanceOfNJSSuccess = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    LikelyCompetition = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DateOfResult = table.Column<DateTime>(type: "date", nullable: true),
                    GrossRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    NetNJSRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FollowUpComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProbableQualifyingCriteria = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    TrackedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityTrackings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityTrackings_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WorkBreakdownStructures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Structure = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkBreakdownStructures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkBreakdownStructures_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Budget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Resources = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkBreakdownStructureId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTasks_WorkBreakdownStructures_WorkBreakdownStructureId",
                        column: x => x.WorkBreakdownStructureId,
                        principalTable: "WorkBreakdownStructures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserWBSTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    WBSTaskId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWBSTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserWBSTasks_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserWBSTasks_WBSTasks_WBSTaskId",
                        column: x => x.WBSTaskId,
                        principalTable: "WBSTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "CapitalValue", "ClientName", "ClientSector", "ContractType", "CreatedAt", "CreatedBy", "Currency", "DurationInMonths", "EndDate", "EstimatedCost", "FundingStream", "LastModifiedAt", "LastModifiedBy", "Name", "Progress", "Sector", "StartDate", "Status" },
                values: new object[,]
                {
                    { 1, null, "Metropolis Municipality", "Government", "EPC", new DateTime(2022, 12, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, new DateTime(2024, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 5000000m, null, null, null, "City Water Supply Upgrade", 65, "Water", new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 6 },
                    { 2, null, "State Rural Development Dept", "Government", "Design-Build", new DateTime(2023, 2, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, new DateTime(2025, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 2000000m, null, null, null, "Rural Sanitation Initiative", 25, "Sanitation", new DateTime(2023, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 3, null, "Industrial Development Corp", "Private", "Turnkey", new DateTime(2022, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, new DateTime(2023, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 3500000m, null, null, null, "Industrial Park Drainage System", 100, "Industrial", new DateTime(2022, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 4, null, "Smart City Development Authority", "Government", "EPC", new DateTime(2023, 11, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, null, 7500000m, null, null, null, "Smart City Water Management", 0, "Smart City", null, 1 },
                    { 5, null, "Maritime Development Board", "Government", "Design-Build", new DateTime(2023, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, new DateTime(2025, 5, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 4500000m, null, null, null, "Coastal Zone Protection", 45, "Coastal", new DateTime(2023, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2 },
                    { 6, null, "City Municipal Corporation", "Government", "EPC", new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, null, 3200000m, null, null, null, "Urban Flood Management", 0, "Urban Infrastructure", null, 1 },
                    { 7, null, "Municipality", "Government", "EPC", new DateTime(2022, 12, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, new DateTime(2024, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 600000m, null, null, null, "Pune City Water Supply Upgrade", 65, "Water", new DateTime(2023, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 6 },
                    { 8, null, "Maharashtra Rural Development Dept", "Government", "Design-Build", new DateTime(2023, 2, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, new DateTime(2025, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 2000000m, null, null, null, "Rural Initiative", 25, "Sanitation", new DateTime(2023, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 3 },
                    { 9, null, "Industrial Development Corp", "Private", "Turnkey", new DateTime(2022, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, new DateTime(2023, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 3500000m, null, null, null, "Industrial Park System", 100, "Industrial", new DateTime(2022, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3 },
                    { 10, null, "Smart City Development Authority", "Government", "EPC", new DateTime(2023, 11, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, null, 7500000m, null, null, null, "City Water Management 2", 0, "Smart City", null, 4 },
                    { 11, null, "Maritime Development Board", "Government", "Design-Build", new DateTime(2023, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, new DateTime(2025, 5, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), 4500000m, null, null, null, "Coastal Protection 2", 45, "Coastal", new DateTime(2023, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 5 },
                    { 12, null, "City Municipal Corporation", "Government", "EPC", new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, null, 3200000m, null, null, null, "Urban Management", 0, "Urban Infrastructure", null, 5 },
                    { 13, null, "City Municipal Corporation", "Government", "EPC", new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, null, 3900000m, null, null, null, "Urban Management 23", 0, "Urban Infrastructure", null, 7 },
                    { 14, null, "State Industrial Development Corp", "Government", "EPC", new DateTime(2023, 12, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, null, 12500000m, null, null, null, "Mega Industrial Park", 0, "Industrial", null, 0 },
                    { 15, null, "National Highway Authority", "Government", "Design-Build", new DateTime(2023, 12, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "INR", null, null, 7800000m, null, null, null, "Expressway Stormwater Drainage", 0, "Transportation", null, 0 }
                });

            migrationBuilder.InsertData(
                table: "GoNoGoDecisions",
                columns: new[] { "Id", "ActionPlan", "ApprovedBy", "ApprovedDate", "BidScheduleComments", "BidScheduleScore", "BidType", "ClientRelationshipComments", "ClientRelationshipScore", "CompetitionAssessmentComments", "CompetitionAssessmentScore", "CompetitivePositionComments", "CompetitivePositionScore", "CompletedBy", "CompletedDate", "CreatedAt", "CreatedBy", "DecisionComments", "EMDAmount", "FinancialEligibilityComments", "FinancialEligibilityScore", "FutureWorkPotentialComments", "FutureWorkPotentialScore", "LastModifiedAt", "LastModifiedBy", "MarketingPlanComments", "MarketingPlanScore", "ProfitabilityComments", "ProfitabilityScore", "ProjectId", "ProjectKnowledgeComments", "ProjectKnowledgeScore", "ResourceAvailabilityComments", "ResourceAvailabilityScore", "ReviewedBy", "ReviewedDate", "Sector", "StaffAvailabilityComments", "StaffAvailabilityScore", "Status", "TechnicalEligibilityComments", "TechnicalEligibilityScore", "TenderFee", "TotalScore" },
                values: new object[,]
                {
                    { 1, null, null, null, "Timeline is achievable", 8, "Lumpsum", "Good relationship with municipality", 7, "Limited competition in this sector", 8, "Strong market position", 8, "System", new DateTime(2022, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2022, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "Project aligns with our expertise", 100000m, "Strong financial position", 8, "High potential for similar projects", 9, null, null, "Strong marketing strategy in water sector", 8, "Good profit margins expected", 8, 1, "Extensive experience in water supply projects", 8, "Resources can be allocated", 7, null, null, "Water", "Required staff available", 7, 0, "Meets all technical requirements", 9, 5000m, 95 },
                    { 2, null, null, null, "Timeline manageable", 7, "EPC", "Strong relationship with authority", 8, "Moderate competition", 7, "Good market position", 7, "System", new DateTime(2023, 10, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2023, 10, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "Proceed with careful resource planning", 150000m, "Financially capable", 8, "Potential for future smart city projects", 8, null, null, "Developing marketing strategy", 7, "Acceptable profit margins", 7, 4, "Good understanding of requirements", 7, "Resource planning required", 6, null, null, "Smart City", "Some resource allocation needed", 6, 1, "Meets technical criteria", 8, 7500m, 86 },
                    { 3, null, null, null, "Timeline challenging", 6, "Design-Build", "New client relationship", 6, "Strong competition in sector", 5, "Limited competitive advantage", 5, "System", new DateTime(2023, 5, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2023, 5, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "Project risks outweigh potential benefits", 90000m, "Financial requirements met", 7, "Moderate future potential", 6, null, null, "Limited market presence in coastal sector", 5, "Low profit margins expected", 5, 5, "Limited experience in coastal projects", 5, "Significant resource gaps", 4, null, null, "Coastal", "Resource constraints identified", 4, 2, "Some technical gaps identified", 6, 4500m, 64 }
                });

            migrationBuilder.InsertData(
                table: "OpportunityTrackings",
                columns: new[] { "Id", "BidFees", "BidManager", "ContactPersonAtClient", "CreatedAt", "CreatedBy", "DateOfResult", "DateOfSubmission", "EMD", "FollowUpComments", "FormOfEMD", "GrossRevenue", "LastModifiedAt", "LastModifiedBy", "LikelyCompetition", "Month", "NetNJSRevenue", "Notes", "PercentageChanceOfNJSSuccess", "PercentageChanceOfProjectHappening", "ProbableQualifyingCriteria", "ProjectId", "Stage", "StrategicRanking", "TrackedBy", "Year" },
                values: new object[,]
                {
                    { 1, 75000m, "John Smith", "Rajesh Kumar", new DateTime(2023, 11, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", null, new DateTime(2023, 12, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 150000m, "Client very interested in smart solutions", "Bank Guarantee", 7500000m, new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "L&T, HCC, Gammon", 11, 6000000m, "Need to focus on IoT integration", 65.0m, 75.5m, "Similar project experience, Local presence", 2, "B", "H", "System", 2023 },
                    { 2, 50000m, "Sarah Johnson", "Amit Patel", new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", null, new DateTime(2023, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 100000m, "Technical presentation scheduled", "Bank Draft", 3200000m, new DateTime(2023, 11, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "Tata Projects, SPML Infra", 11, 2500000m, "Focus on flood prediction systems", 55.0m, 60.0m, "Similar project experience, Local presence", 3, "A", "M", "System", 2023 },
                    { 3, 50000m, "John Johnson", "Amita Patel", new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", null, new DateTime(2023, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 100000m, "Technical presentation scheduled", "Bank Draft", 3200000m, new DateTime(2023, 11, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "Tata Projects, SPML Infra", 11, 2500000m, "Focus on flood prediction systems", 55.0m, 60.0m, "Similar project experience, Local presence", 13, "B", "M", "System", 2023 },
                    { 4, 50000m, "Sarah Johnson", "Amit Patel", new DateTime(2023, 11, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", null, new DateTime(2023, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 100000m, "Technical presentation scheduled", "Bank Draft", 3200000m, new DateTime(2023, 11, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "System", "Tata Projects, SPML Infra, ABC", 11, 2500000m, "Focus on flood prediction systems", 55.0m, 60.0m, "Similar project experience, Local presence", 15, "A", "M", "System", 2023 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_FeasibilityStudies_ProjectId",
                table: "FeasibilityStudies",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisions_ProjectId",
                table: "GoNoGoDecisions",
                column: "ProjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTrackings_ProjectId",
                table: "OpportunityTrackings",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTasks_UserId",
                table: "UserWBSTasks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTasks_WBSTaskId",
                table: "UserWBSTasks",
                column: "WBSTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTasks_WorkBreakdownStructureId",
                table: "WBSTasks",
                column: "WorkBreakdownStructureId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkBreakdownStructures_ProjectId",
                table: "WorkBreakdownStructures",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "FeasibilityStudies");

            migrationBuilder.DropTable(
                name: "GoNoGoDecisions");

            migrationBuilder.DropTable(
                name: "OpportunityTrackings");

            migrationBuilder.DropTable(
                name: "UserWBSTasks");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "WBSTasks");

            migrationBuilder.DropTable(
                name: "WorkBreakdownStructures");

            migrationBuilder.DropTable(
                name: "Projects");
        }
    }
}
