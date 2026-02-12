using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NJS.Domain.Migrations.SqlServer.TenantDb
{
    /// <inheritdoc />
    public partial class InitialTenantDbMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MinRate = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    IsResourceRole = table.Column<bool>(type: "boolean", nullable: true),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    NormalizedName = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Avatar = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    StandardRate = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    IsConsultant = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: true),
                    NormalizedUserName = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    NormalizedEmail = table.Column<string>(type: "text", nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Features",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Features", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityStatus", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PMWorkflowStatus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PMWorkflowStatus", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Program",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Program", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MonthlyPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    YearlyPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MaxUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxProjects = table.Column<int>(type: "integer", nullable: false),
                    MaxStorageGB = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    StripePriceId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WBSOption",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    ParentId = table.Column<int>(type: "integer", nullable: true),
                    FormType = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSOption", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityTracking",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    BidNumber = table.Column<string>(type: "text", nullable: true),
                    StrategicRanking = table.Column<string>(type: "text", nullable: false),
                    BidFees = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    Emd = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    FormOfEMD = table.Column<string>(type: "text", nullable: true),
                    BidManagerId = table.Column<string>(type: "text", nullable: true),
                    ReviewManagerId = table.Column<string>(type: "text", nullable: true),
                    ApprovalManagerId = table.Column<string>(type: "text", nullable: true),
                    ContactPersonAtClient = table.Column<string>(type: "text", nullable: true),
                    DateOfSubmission = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PercentageChanceOfProjectHappening = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    PercentageChanceOfNJSSuccess = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    LikelyCompetition = table.Column<string>(type: "text", nullable: true),
                    GrossRevenue = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    NetNJSRevenue = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    FollowUpComments = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ProbableQualifyingCriteria = table.Column<string>(type: "text", nullable: true),
                    Operation = table.Column<string>(type: "text", nullable: false),
                    WorkName = table.Column<string>(type: "text", nullable: false),
                    Client = table.Column<string>(type: "text", nullable: false),
                    ClientSector = table.Column<string>(type: "text", nullable: false),
                    LikelyStartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Stage = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    CapitalValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DurationOfProject = table.Column<int>(type: "integer", nullable: false),
                    FundingStream = table.Column<string>(type: "text", nullable: false),
                    ContractType = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityTracking", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityTracking_AspNetUsers_ApprovalManagerId",
                        column: x => x.ApprovalManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpportunityTracking_AspNetUsers_BidManagerId",
                        column: x => x.BidManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpportunityTracking_AspNetUsers_ReviewManagerId",
                        column: x => x.ReviewManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RolePermission",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: false),
                    PermissionId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermission", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermission_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermission_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Project",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    ClientName = table.Column<string>(type: "text", nullable: true),
                    ProjectNo = table.Column<int>(type: "integer", nullable: true),
                    TypeOfClient = table.Column<string>(type: "text", nullable: true),
                    ProjectManagerId = table.Column<string>(type: "text", nullable: true),
                    SeniorProjectManagerId = table.Column<string>(type: "text", nullable: true),
                    RegionalManagerId = table.Column<string>(type: "text", nullable: true),
                    Office = table.Column<string>(type: "text", nullable: true),
                    Region = table.Column<string>(type: "text", nullable: true),
                    TypeOfJob = table.Column<string>(type: "text", nullable: true),
                    Sector = table.Column<string>(type: "text", nullable: true),
                    FeeType = table.Column<string>(type: "text", nullable: true),
                    EstimatedProjectCost = table.Column<decimal>(type: "numeric", nullable: true),
                    EstimatedProjectFee = table.Column<decimal>(type: "numeric", nullable: true),
                    Percentage = table.Column<decimal>(type: "numeric", nullable: true),
                    Details = table.Column<string>(type: "text", nullable: true),
                    Priority = table.Column<string>(type: "text", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CapitalValue = table.Column<decimal>(type: "numeric", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Progress = table.Column<int>(type: "integer", nullable: false),
                    DurationInMonths = table.Column<int>(type: "integer", nullable: true),
                    FundingStream = table.Column<string>(type: "text", nullable: true),
                    ContractType = table.Column<string>(type: "text", nullable: true),
                    LetterOfAcceptance = table.Column<bool>(type: "boolean", nullable: true),
                    OpportunityTrackingId = table.Column<int>(type: "integer", nullable: true),
                    ProgramId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Project", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Project_AspNetUsers_ProjectManagerId",
                        column: x => x.ProjectManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Project_AspNetUsers_RegionalManagerId",
                        column: x => x.RegionalManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Project_AspNetUsers_SeniorProjectManagerId",
                        column: x => x.SeniorProjectManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Project_Program_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "Program",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlanFeatures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubscriptionPlanId = table.Column<int>(type: "integer", nullable: false),
                    FeatureId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPlanFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionPlanFeatures_Features_FeatureId",
                        column: x => x.FeatureId,
                        principalTable: "Features",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubscriptionPlanFeatures_SubscriptionPlans_SubscriptionPlan~",
                        column: x => x.SubscriptionPlanId,
                        principalTable: "SubscriptionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Domain = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ContactEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ContactPhone = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    TrialEndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    SubscriptionEndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    StripeCustomerId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    StripeSubscriptionId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SubscriptionPlanId = table.Column<int>(type: "integer", nullable: true),
                    MaxUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxProjects = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsIsolated = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tenants_SubscriptionPlans_SubscriptionPlanId",
                        column: x => x.SubscriptionPlanId,
                        principalTable: "SubscriptionPlans",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OpportunityHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    OpportunityId = table.Column<int>(type: "integer", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: true),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ActionBy = table.Column<string>(type: "text", nullable: true),
                    AssignedToId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityHistory_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpportunityHistory_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpportunityHistory_OpportunityStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "OpportunityStatus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OpportunityHistory_OpportunityTracking_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "OpportunityTracking",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChangeControl",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    SrNo = table.Column<int>(type: "integer", nullable: false),
                    DateLogged = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Originator = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CostImpact = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    TimeImpact = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ResourcesImpact = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    QualityImpact = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ChangeOrderStatus = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ClientApprovalStatus = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ClaimSituation = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    WorkflowStatusId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeControl", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeControl_PMWorkflowStatus_WorkflowStatusId",
                        column: x => x.WorkflowStatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChangeControl_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectClosures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    ClientFeedback = table.Column<string>(type: "text", nullable: true),
                    SuccessCriteria = table.Column<string>(type: "text", nullable: true),
                    ClientExpectations = table.Column<string>(type: "text", nullable: true),
                    OtherStakeholders = table.Column<string>(type: "text", nullable: true),
                    EnvIssues = table.Column<string>(type: "text", nullable: true),
                    EnvManagement = table.Column<string>(type: "text", nullable: true),
                    ThirdPartyIssues = table.Column<string>(type: "text", nullable: true),
                    ThirdPartyManagement = table.Column<string>(type: "text", nullable: true),
                    RiskIssues = table.Column<string>(type: "text", nullable: true),
                    RiskManagement = table.Column<string>(type: "text", nullable: true),
                    KnowledgeGoals = table.Column<string>(type: "text", nullable: true),
                    BaselineComparison = table.Column<string>(type: "text", nullable: true),
                    DelayedDeliverables = table.Column<string>(type: "text", nullable: true),
                    UnforeseeableDelays = table.Column<string>(type: "text", nullable: true),
                    BudgetEstimate = table.Column<string>(type: "text", nullable: true),
                    ProfitTarget = table.Column<string>(type: "text", nullable: true),
                    ChangeOrders = table.Column<string>(type: "text", nullable: true),
                    CloseOutBudget = table.Column<string>(type: "text", nullable: true),
                    ResourceAvailability = table.Column<string>(type: "text", nullable: true),
                    VendorFeedback = table.Column<string>(type: "text", nullable: true),
                    ProjectTeamFeedback = table.Column<string>(type: "text", nullable: true),
                    DesignOutputs = table.Column<string>(type: "text", nullable: true),
                    ProjectReviewMeetings = table.Column<string>(type: "text", nullable: true),
                    ClientDesignReviews = table.Column<string>(type: "text", nullable: true),
                    InternalReporting = table.Column<string>(type: "text", nullable: true),
                    ClientReporting = table.Column<string>(type: "text", nullable: true),
                    InternalMeetings = table.Column<string>(type: "text", nullable: true),
                    ClientMeetings = table.Column<string>(type: "text", nullable: true),
                    ExternalMeetings = table.Column<string>(type: "text", nullable: true),
                    PlanUpToDate = table.Column<string>(type: "text", nullable: true),
                    PlanUseful = table.Column<string>(type: "text", nullable: true),
                    Hindrances = table.Column<string>(type: "text", nullable: true),
                    ClientPayment = table.Column<string>(type: "text", nullable: true),
                    PlanningIssues = table.Column<string>(type: "text", nullable: true),
                    PlanningLessons = table.Column<string>(type: "text", nullable: true),
                    BriefAims = table.Column<string>(type: "text", nullable: true),
                    DesignReviewOutputs = table.Column<string>(type: "text", nullable: true),
                    ConstructabilityReview = table.Column<string>(type: "text", nullable: true),
                    DesignReview = table.Column<string>(type: "text", nullable: true),
                    TechnicalRequirements = table.Column<string>(type: "text", nullable: true),
                    InnovativeIdeas = table.Column<string>(type: "text", nullable: true),
                    SuitableOptions = table.Column<string>(type: "text", nullable: true),
                    AdditionalInformation = table.Column<string>(type: "text", nullable: true),
                    DeliverableExpectations = table.Column<string>(type: "text", nullable: true),
                    StakeholderInvolvement = table.Column<string>(type: "text", nullable: true),
                    KnowledgeGoalsAchieved = table.Column<string>(type: "text", nullable: true),
                    TechnicalToolsDissemination = table.Column<string>(type: "text", nullable: true),
                    SpecialistKnowledgeValue = table.Column<string>(type: "text", nullable: true),
                    OtherComments = table.Column<string>(type: "text", nullable: true),
                    TargetCostAccuracyValue = table.Column<bool>(type: "boolean", nullable: true),
                    TargetCostAccuracy = table.Column<string>(type: "text", nullable: true),
                    ChangeControlReviewValue = table.Column<bool>(type: "boolean", nullable: true),
                    ChangeControlReview = table.Column<string>(type: "text", nullable: true),
                    CompensationEventsValue = table.Column<bool>(type: "boolean", nullable: true),
                    CompensationEvents = table.Column<string>(type: "text", nullable: true),
                    ExpenditureProfileValue = table.Column<bool>(type: "boolean", nullable: true),
                    ExpenditureProfile = table.Column<string>(type: "text", nullable: true),
                    HealthSafetyConcernsValue = table.Column<bool>(type: "boolean", nullable: true),
                    HealthSafetyConcerns = table.Column<string>(type: "text", nullable: true),
                    ProgrammeRealisticValue = table.Column<bool>(type: "boolean", nullable: true),
                    ProgrammeRealistic = table.Column<string>(type: "text", nullable: true),
                    ProgrammeUpdatesValue = table.Column<bool>(type: "boolean", nullable: true),
                    ProgrammeUpdates = table.Column<string>(type: "text", nullable: true),
                    RequiredQualityValue = table.Column<bool>(type: "boolean", nullable: true),
                    RequiredQuality = table.Column<string>(type: "text", nullable: true),
                    OperationalRequirementsValue = table.Column<bool>(type: "boolean", nullable: true),
                    OperationalRequirements = table.Column<string>(type: "text", nullable: true),
                    ConstructionInvolvementValue = table.Column<bool>(type: "boolean", nullable: true),
                    ConstructionInvolvement = table.Column<string>(type: "text", nullable: true),
                    EfficienciesValue = table.Column<bool>(type: "boolean", nullable: true),
                    Efficiencies = table.Column<string>(type: "text", nullable: true),
                    MaintenanceAgreementsValue = table.Column<bool>(type: "boolean", nullable: true),
                    MaintenanceAgreements = table.Column<string>(type: "text", nullable: true),
                    AsBuiltManualsValue = table.Column<bool>(type: "boolean", nullable: true),
                    AsBuiltManuals = table.Column<string>(type: "text", nullable: true),
                    HsFileForwardedValue = table.Column<bool>(type: "boolean", nullable: true),
                    HsFileForwarded = table.Column<string>(type: "text", nullable: true),
                    Variations = table.Column<string>(type: "text", nullable: true),
                    TechnoLegalIssues = table.Column<string>(type: "text", nullable: true),
                    ConstructionOther = table.Column<string>(type: "text", nullable: true),
                    Positives = table.Column<string>(type: "text", nullable: true),
                    LessonsLearned = table.Column<string>(type: "text", nullable: true),
                    WorkflowStatusId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectClosures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectClosures_PMWorkflowStatus_WorkflowStatusId",
                        column: x => x.WorkflowStatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectClosures_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectResource",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ProjectRate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AllocationPercentage = table.Column<double>(type: "double precision", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectResource", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectResource_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectResource_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintWbsPlan",
                columns: table => new
                {
                    SprintWbsPlanId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    WBSTaskId = table.Column<int>(type: "integer", nullable: true),
                    WBSTaskName = table.Column<string>(type: "text", nullable: true),
                    ParentWBSTaskId = table.Column<int>(type: "integer", nullable: true),
                    AssignedUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    AssignedUserName = table.Column<string>(type: "text", nullable: true),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: true),
                    RoleName = table.Column<string>(type: "text", nullable: true),
                    MonthYear = table.Column<string>(type: "text", nullable: true),
                    SprintNumber = table.Column<int>(type: "integer", nullable: false),
                    PlannedHours = table.Column<decimal>(type: "numeric", nullable: false),
                    RemainingHours = table.Column<decimal>(type: "numeric", nullable: false),
                    ProgramSequence = table.Column<int>(type: "integer", nullable: false),
                    IsConsumed = table.Column<bool>(type: "boolean", nullable: false),
                    AcceptanceCriteria = table.Column<string>(type: "text", nullable: true),
                    TaskDescription = table.Column<string>(type: "text", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintWbsPlan", x => x.SprintWbsPlanId);
                    table.ForeignKey(
                        name: "FK_SprintWbsPlan_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskPlannedHourHeader",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    TaskType = table.Column<int>(type: "integer", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    Version = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskPlannedHourHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHourHeader_PMWorkflowStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHourHeader_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantDatabases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    DatabaseName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ConnectionString = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastBackup = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantDatabases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantDatabases_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantUsers_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantUsers_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChangeControlWorkflowHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ChangeControlId = table.Column<int>(type: "integer", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ActionBy = table.Column<string>(type: "text", nullable: false),
                    AssignedToId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeControlWorkflowHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistory_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistory_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistory_ChangeControl_ChangeControlId",
                        column: x => x.ChangeControlId,
                        principalTable: "ChangeControl",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistory_PMWorkflowStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectClosureWorkflowHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ProjectClosureId = table.Column<int>(type: "integer", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ActionBy = table.Column<string>(type: "text", nullable: false),
                    AssignedToId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectClosureWorkflowHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistory_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistory_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistory_PMWorkflowStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistory_ProjectClosures_ProjectClosur~",
                        column: x => x.ProjectClosureId,
                        principalTable: "ProjectClosures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSTaskPlannedHourHeaderId = table.Column<int>(type: "integer", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: true),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ActionBy = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    AssignedToId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSHistory_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSHistory_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSHistory_PMWorkflowStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSHistory_WBSTaskPlannedHourHeader_WBSTaskPlannedHourHeade~",
                        column: x => x.WBSTaskPlannedHourHeaderId,
                        principalTable: "WBSTaskPlannedHourHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormHeaders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    StatusId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartFormHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobStartFormHeaders_PMWorkflowStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobStartFormHeaders_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    JobStartFormHeaderId = table.Column<int>(type: "integer", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: true),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ActionBy = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    AssignedToId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartFormHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobStartFormHistories_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobStartFormHistories_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobStartFormHistories_JobStartFormHeaders_JobStartFormHeade~",
                        column: x => x.JobStartFormHeaderId,
                        principalTable: "JobStartFormHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobStartFormHistories_PMWorkflowStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormResources",
                columns: table => new
                {
                    ResourceId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    WBSTaskId = table.Column<int>(type: "integer", nullable: true),
                    TaskType = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Units = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    BudgetedCost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    EmployeeName = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartFormResources", x => x.ResourceId);
                });

            migrationBuilder.CreateTable(
                name: "JobStartForms",
                columns: table => new
                {
                    FormId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    WorkBreakdownStructureId = table.Column<int>(type: "integer", nullable: true),
                    FormTitle = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    PreparedBy = table.Column<string>(type: "text", nullable: true),
                    TotalTimeCost = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalExpenses = table.Column<decimal>(type: "numeric", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ProjectFees = table.Column<decimal>(type: "numeric", nullable: false),
                    ServiceTaxPercentage = table.Column<decimal>(type: "numeric", nullable: false),
                    ServiceTaxAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalProjectFees = table.Column<decimal>(type: "numeric", nullable: false),
                    Profit = table.Column<decimal>(type: "numeric", nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartForms", x => x.FormId);
                    table.ForeignKey(
                        name: "FK_JobStartForms_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormSelections",
                columns: table => new
                {
                    SelectionId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    OptionCategory = table.Column<string>(type: "text", nullable: true),
                    OptionName = table.Column<string>(type: "text", nullable: true),
                    IsSelected = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartFormSelections", x => x.SelectionId);
                    table.ForeignKey(
                        name: "FK_JobStartFormSelections_JobStartForms_FormId",
                        column: x => x.FormId,
                        principalTable: "JobStartForms",
                        principalColumn: "FormId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserWBSTask",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSTaskId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    CostRate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: true),
                    TotalHours = table.Column<double>(type: "double precision", nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ResourceRoleId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWBSTask", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserWBSTask_AspNetRoles_ResourceRoleId",
                        column: x => x.ResourceRoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserWBSTask_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserWBSTaskVersionHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSTaskVersionHistoryId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    CostRate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Unit = table.Column<string>(type: "text", nullable: true),
                    TotalHours = table.Column<double>(type: "double precision", nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ResourceRoleId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWBSTaskVersionHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserWBSTaskVersionHistory_AspNetRoles_ResourceRoleId",
                        column: x => x.ResourceRoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserWBSTaskVersionHistory_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WBSHeader",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    Version = table.Column<string>(type: "text", nullable: true),
                    VersionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovalStatus = table.Column<int>(type: "integer", nullable: false),
                    LatestVersionHistoryId = table.Column<int>(type: "integer", nullable: true),
                    ActiveVersionHistoryId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSHeader_Project_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Project",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSVersionHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSHeaderId = table.Column<int>(type: "integer", nullable: false),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Comments = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsLatest = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSVersionHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSVersionHistory_AspNetUsers_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSVersionHistory_AspNetUsers_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSVersionHistory_PMWorkflowStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSVersionHistory_WBSHeader_WBSHeaderId",
                        column: x => x.WBSHeaderId,
                        principalTable: "WBSHeader",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WorkBreakdownStructure",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSHeaderId = table.Column<int>(type: "integer", nullable: false),
                    Structure = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkBreakdownStructure", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkBreakdownStructure_WBSHeader_WBSHeaderId",
                        column: x => x.WBSHeaderId,
                        principalTable: "WBSHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskVersionHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSVersionHistoryId = table.Column<int>(type: "integer", nullable: false),
                    OriginalTaskId = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    EstimatedBudget = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    TaskType = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskVersionHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskVersionHistory_WBSVersionHistory_WBSVersionHistoryId",
                        column: x => x.WBSVersionHistoryId,
                        principalTable: "WBSVersionHistory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSVersionWorkflowHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSVersionHistoryId = table.Column<int>(type: "integer", nullable: false),
                    StatusId = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: true),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ActionBy = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    AssignedToId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSVersionWorkflowHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSVersionWorkflowHistory_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSVersionWorkflowHistory_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSVersionWorkflowHistory_PMWorkflowStatus_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatus",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSVersionWorkflowHistory_WBSVersionHistory_WBSVersionHisto~",
                        column: x => x.WBSVersionHistoryId,
                        principalTable: "WBSVersionHistory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTask",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WorkBreakdownStructureId = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EstimatedBudget = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    TaskType = table.Column<int>(type: "integer", nullable: false),
                    WBSOptionId = table.Column<int>(type: "integer", nullable: false),
                    ParentId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTask", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTask_WBSOption_WBSOptionId",
                        column: x => x.WBSOptionId,
                        principalTable: "WBSOption",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WBSTask_WBSTask_ParentId",
                        column: x => x.ParentId,
                        principalTable: "WBSTask",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSTask_WorkBreakdownStructure_WorkBreakdownStructureId",
                        column: x => x.WorkBreakdownStructureId,
                        principalTable: "WorkBreakdownStructure",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskPlannedHourVersionHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSTaskVersionHistoryId = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: false),
                    Month = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PlannedHours = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskPlannedHourVersionHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHourVersionHistory_WBSTaskVersionHistory_WBST~",
                        column: x => x.WBSTaskVersionHistoryId,
                        principalTable: "WBSTaskVersionHistory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskPlannedHour",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    WBSTaskPlannedHourHeaderId = table.Column<int>(type: "integer", nullable: false),
                    WBSTaskId = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: false),
                    Month = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PlannedHours = table.Column<double>(type: "double precision", nullable: false),
                    ActualHours = table.Column<double>(type: "double precision", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskPlannedHour", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHour_WBSTaskPlannedHourHeader_WBSTaskPlannedH~",
                        column: x => x.WBSTaskPlannedHourHeaderId,
                        principalTable: "WBSTaskPlannedHourHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHour_WBSTask_WBSTaskId",
                        column: x => x.WBSTaskId,
                        principalTable: "WBSTask",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControl_ProjectId",
                table: "ChangeControl",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControl_WorkflowStatusId",
                table: "ChangeControl",
                column: "WorkflowStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistory_ActionBy",
                table: "ChangeControlWorkflowHistory",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistory_AssignedToId",
                table: "ChangeControlWorkflowHistory",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistory_ChangeControlId",
                table: "ChangeControlWorkflowHistory",
                column: "ChangeControlId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistory_StatusId",
                table: "ChangeControlWorkflowHistory",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormHeaders_FormId",
                table: "JobStartFormHeaders",
                column: "FormId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormHeaders_ProjectId",
                table: "JobStartFormHeaders",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormHeaders_StatusId",
                table: "JobStartFormHeaders",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormHistories_ActionBy",
                table: "JobStartFormHistories",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormHistories_AssignedToId",
                table: "JobStartFormHistories",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormHistories_JobStartFormHeaderId",
                table: "JobStartFormHistories",
                column: "JobStartFormHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormHistories_StatusId",
                table: "JobStartFormHistories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormResources_FormId",
                table: "JobStartFormResources",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartForms_ProjectId",
                table: "JobStartForms",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartForms_WorkBreakdownStructureId",
                table: "JobStartForms",
                column: "WorkBreakdownStructureId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormSelections_FormId",
                table: "JobStartFormSelections",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityHistory_ActionBy",
                table: "OpportunityHistory",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityHistory_AssignedToId",
                table: "OpportunityHistory",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityHistory_OpportunityId",
                table: "OpportunityHistory",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityHistory_StatusId",
                table: "OpportunityHistory",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTracking_ApprovalManagerId",
                table: "OpportunityTracking",
                column: "ApprovalManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTracking_BidManagerId",
                table: "OpportunityTracking",
                column: "BidManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTracking_ReviewManagerId",
                table: "OpportunityTracking",
                column: "ReviewManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Project_ProgramId",
                table: "Project",
                column: "ProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_Project_ProjectManagerId",
                table: "Project",
                column: "ProjectManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Project_RegionalManagerId",
                table: "Project",
                column: "RegionalManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Project_SeniorProjectManagerId",
                table: "Project",
                column: "SeniorProjectManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosures_ProjectId",
                table: "ProjectClosures",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosures_WorkflowStatusId",
                table: "ProjectClosures",
                column: "WorkflowStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistory_ActionBy",
                table: "ProjectClosureWorkflowHistory",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistory_AssignedToId",
                table: "ProjectClosureWorkflowHistory",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistory_ProjectClosureId",
                table: "ProjectClosureWorkflowHistory",
                column: "ProjectClosureId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistory_StatusId",
                table: "ProjectClosureWorkflowHistory",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectResource_ProjectId",
                table: "ProjectResource",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectResource_UserId",
                table: "ProjectResource",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermission_PermissionId",
                table: "RolePermission",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermission_RoleId",
                table: "RolePermission",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintWbsPlan_ProjectId",
                table: "SprintWbsPlan",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlanFeatures_FeatureId",
                table: "SubscriptionPlanFeatures",
                column: "FeatureId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlanFeatures_SubscriptionPlanId",
                table: "SubscriptionPlanFeatures",
                column: "SubscriptionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDatabases_TenantId",
                table: "TenantDatabases",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_SubscriptionPlanId",
                table: "Tenants",
                column: "SubscriptionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_TenantId",
                table: "TenantUsers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_UserId",
                table: "TenantUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTask_ResourceRoleId",
                table: "UserWBSTask",
                column: "ResourceRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTask_UserId",
                table: "UserWBSTask",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTask_WBSTaskId",
                table: "UserWBSTask",
                column: "WBSTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTaskVersionHistory_ResourceRoleId",
                table: "UserWBSTaskVersionHistory",
                column: "ResourceRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTaskVersionHistory_UserId",
                table: "UserWBSTaskVersionHistory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTaskVersionHistory_WBSTaskVersionHistoryId",
                table: "UserWBSTaskVersionHistory",
                column: "WBSTaskVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHeader_ActiveVersionHistoryId",
                table: "WBSHeader",
                column: "ActiveVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHeader_LatestVersionHistoryId",
                table: "WBSHeader",
                column: "LatestVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHeader_ProjectId",
                table: "WBSHeader",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistory_ActionBy",
                table: "WBSHistory",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistory_AssignedToId",
                table: "WBSHistory",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistory_StatusId",
                table: "WBSHistory",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistory_WBSTaskPlannedHourHeaderId",
                table: "WBSHistory",
                column: "WBSTaskPlannedHourHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTask_ParentId",
                table: "WBSTask",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTask_WBSOptionId",
                table: "WBSTask",
                column: "WBSOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTask_WorkBreakdownStructureId",
                table: "WBSTask",
                column: "WorkBreakdownStructureId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHour_WBSTaskId",
                table: "WBSTaskPlannedHour",
                column: "WBSTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHour_WBSTaskPlannedHourHeaderId",
                table: "WBSTaskPlannedHour",
                column: "WBSTaskPlannedHourHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHourHeader_ProjectId",
                table: "WBSTaskPlannedHourHeader",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHourHeader_StatusId",
                table: "WBSTaskPlannedHourHeader",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHourVersionHistory_WBSTaskVersionHistoryId",
                table: "WBSTaskPlannedHourVersionHistory",
                column: "WBSTaskVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskVersionHistory_WBSVersionHistoryId",
                table: "WBSTaskVersionHistory",
                column: "WBSVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistory_ApprovedBy",
                table: "WBSVersionHistory",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistory_CreatedBy",
                table: "WBSVersionHistory",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistory_StatusId",
                table: "WBSVersionHistory",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistory_WBSHeaderId",
                table: "WBSVersionHistory",
                column: "WBSHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistory_ActionBy",
                table: "WBSVersionWorkflowHistory",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistory_AssignedToId",
                table: "WBSVersionWorkflowHistory",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistory_StatusId",
                table: "WBSVersionWorkflowHistory",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistory_WBSVersionHistoryId",
                table: "WBSVersionWorkflowHistory",
                column: "WBSVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkBreakdownStructure_WBSHeaderId",
                table: "WorkBreakdownStructure",
                column: "WBSHeaderId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormHeaders_JobStartForms_FormId",
                table: "JobStartFormHeaders",
                column: "FormId",
                principalTable: "JobStartForms",
                principalColumn: "FormId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormResources_JobStartForms_FormId",
                table: "JobStartFormResources",
                column: "FormId",
                principalTable: "JobStartForms",
                principalColumn: "FormId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartForms_WorkBreakdownStructure_WorkBreakdownStructure~",
                table: "JobStartForms",
                column: "WorkBreakdownStructureId",
                principalTable: "WorkBreakdownStructure",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTask_WBSTask_WBSTaskId",
                table: "UserWBSTask",
                column: "WBSTaskId",
                principalTable: "WBSTask",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTaskVersionHistory_WBSTaskVersionHistory_WBSTaskVers~",
                table: "UserWBSTaskVersionHistory",
                column: "WBSTaskVersionHistoryId",
                principalTable: "WBSTaskVersionHistory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSHeader_WBSVersionHistory_ActiveVersionHistoryId",
                table: "WBSHeader",
                column: "ActiveVersionHistoryId",
                principalTable: "WBSVersionHistory",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSHeader_WBSVersionHistory_LatestVersionHistoryId",
                table: "WBSHeader",
                column: "LatestVersionHistoryId",
                principalTable: "WBSVersionHistory",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistory_PMWorkflowStatus_StatusId",
                table: "WBSVersionHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSHeader_Project_ProjectId",
                table: "WBSHeader");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistory_AspNetUsers_ApprovedBy",
                table: "WBSVersionHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistory_AspNetUsers_CreatedBy",
                table: "WBSVersionHistory");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSHeader_WBSVersionHistory_ActiveVersionHistoryId",
                table: "WBSHeader");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSHeader_WBSVersionHistory_LatestVersionHistoryId",
                table: "WBSHeader");

            migrationBuilder.DropTable(
                name: "ChangeControlWorkflowHistory");

            migrationBuilder.DropTable(
                name: "JobStartFormHistories");

            migrationBuilder.DropTable(
                name: "JobStartFormResources");

            migrationBuilder.DropTable(
                name: "JobStartFormSelections");

            migrationBuilder.DropTable(
                name: "OpportunityHistory");

            migrationBuilder.DropTable(
                name: "ProjectClosureWorkflowHistory");

            migrationBuilder.DropTable(
                name: "ProjectResource");

            migrationBuilder.DropTable(
                name: "RolePermission");

            migrationBuilder.DropTable(
                name: "SprintWbsPlan");

            migrationBuilder.DropTable(
                name: "SubscriptionPlanFeatures");

            migrationBuilder.DropTable(
                name: "TenantDatabases");

            migrationBuilder.DropTable(
                name: "TenantUsers");

            migrationBuilder.DropTable(
                name: "UserWBSTask");

            migrationBuilder.DropTable(
                name: "UserWBSTaskVersionHistory");

            migrationBuilder.DropTable(
                name: "WBSHistory");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHour");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHourVersionHistory");

            migrationBuilder.DropTable(
                name: "WBSVersionWorkflowHistory");

            migrationBuilder.DropTable(
                name: "ChangeControl");

            migrationBuilder.DropTable(
                name: "JobStartFormHeaders");

            migrationBuilder.DropTable(
                name: "OpportunityStatus");

            migrationBuilder.DropTable(
                name: "OpportunityTracking");

            migrationBuilder.DropTable(
                name: "ProjectClosures");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Features");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHourHeader");

            migrationBuilder.DropTable(
                name: "WBSTask");

            migrationBuilder.DropTable(
                name: "WBSTaskVersionHistory");

            migrationBuilder.DropTable(
                name: "JobStartForms");

            migrationBuilder.DropTable(
                name: "SubscriptionPlans");

            migrationBuilder.DropTable(
                name: "WBSOption");

            migrationBuilder.DropTable(
                name: "WorkBreakdownStructure");

            migrationBuilder.DropTable(
                name: "PMWorkflowStatus");

            migrationBuilder.DropTable(
                name: "Project");

            migrationBuilder.DropTable(
                name: "Program");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "WBSVersionHistory");

            migrationBuilder.DropTable(
                name: "WBSHeader");
        }
    }
}
