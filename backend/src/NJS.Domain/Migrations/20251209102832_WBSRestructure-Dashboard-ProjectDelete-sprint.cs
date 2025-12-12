using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class WBSRestructureDashboardProjectDeletesprint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MinRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsResourceRole = table.Column<bool>(type: "bit", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false),
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
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StandardRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsConsultant = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
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
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreateAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompanyAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subdomain = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubscriptionPlan = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreateAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FailedEmailLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    To = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AttemptedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    LastRetryAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsResolved = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FailedEmailLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Features",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PriceUSD = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PriceINR = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Features", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MeasurementUnits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FormType = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeasurementUnits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MigrationResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Success = table.Column<bool>(type: "bit", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MigrationResultId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MigrationResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MigrationResults_MigrationResults_MigrationResultId",
                        column: x => x.MigrationResultId,
                        principalTable: "MigrationResults",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OpportunityStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PMWorkflowStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PMWorkflowStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Programs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Programs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Regions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ScoreRange",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    value = table.Column<int>(type: "int", nullable: false),
                    label = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    range = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoreRange", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ScoringCriteria",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ByWhom = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ByDate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: false),
                    ShowComments = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoringCriteria", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ScoringDescription",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoringDescription", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MonthlyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    YearlyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    MaxProjects = table.Column<int>(type: "int", nullable: false),
                    MaxStorageGB = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    StripePriceId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WBSOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    ParentId = table.Column<int>(type: "int", nullable: true),
                    FormType = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSOptions", x => x.Id);
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
                name: "OpportunityTrackings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    BidNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StrategicRanking = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BidFees = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Emd = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FormOfEMD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BidManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ReviewManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ApprovalManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ContactPersonAtClient = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfSubmission = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PercentageChanceOfProjectHappening = table.Column<decimal>(type: "decimal(18,2)", precision: 5, scale: 2, nullable: true),
                    PercentageChanceOfNJSSuccess = table.Column<decimal>(type: "decimal(18,2)", precision: 5, scale: 2, nullable: true),
                    LikelyCompetition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GrossRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    NetNJSRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FollowUpComments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProbableQualifyingCriteria = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Operation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Client = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClientSector = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LikelyStartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Stage = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CapitalValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DurationOfProject = table.Column<int>(type: "int", nullable: false),
                    FundingStream = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContractType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityTrackings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityTrackings_AspNetUsers_ApprovalManagerId",
                        column: x => x.ApprovalManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpportunityTrackings_AspNetUsers_BidManagerId",
                        column: x => x.BidManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpportunityTrackings_AspNetUsers_ReviewManagerId",
                        column: x => x.ReviewManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TwoFactorCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TwoFactorCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TwoFactorCodes_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClientName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProjectNo = table.Column<int>(type: "int", nullable: true),
                    TypeOfClient = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProjectManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    SeniorProjectManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    RegionalManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Office = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TypeOfJob = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Sector = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FeeType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EstimatedProjectCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EstimatedProjectFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CapitalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Progress = table.Column<int>(type: "int", nullable: false),
                    DurationInMonths = table.Column<int>(type: "int", nullable: true),
                    FundingStream = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContractType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LetterOfAcceptance = table.Column<bool>(type: "bit", nullable: true),
                    OpportunityTrackingId = table.Column<int>(type: "int", nullable: true),
                    ProgramId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_AspNetUsers_ProjectManagerId",
                        column: x => x.ProjectManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_AspNetUsers_RegionalManagerId",
                        column: x => x.RegionalManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_AspNetUsers_SeniorProjectManagerId",
                        column: x => x.SeniorProjectManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_Programs_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "Programs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GoNoGoDecisionOpportunities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    TypeOfBid = table.Column<int>(type: "int", nullable: false),
                    Sector = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BdHead = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Office = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RegionalBDHead = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TypeOfClient = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnderFee = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Emd = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    ScoringCriteriaId = table.Column<int>(type: "int", nullable: true),
                    ScoreRangeId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoNoGoDecisionOpportunities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoNoGoDecisionOpportunities_ScoreRange_ScoreRangeId",
                        column: x => x.ScoreRangeId,
                        principalTable: "ScoreRange",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GoNoGoDecisionOpportunities_ScoringCriteria_ScoringCriteriaId",
                        column: x => x.ScoringCriteriaId,
                        principalTable: "ScoringCriteria",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ScoringDescriptionSummarry",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ScoringDescriptionID = table.Column<int>(type: "int", nullable: false),
                    High = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Medium = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Low = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoringDescriptionSummarry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScoringDescriptionSummarry_ScoringDescription_ScoringDescriptionID",
                        column: x => x.ScoringDescriptionID,
                        principalTable: "ScoringDescription",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlanFeatures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubscriptionPlanId = table.Column<int>(type: "int", nullable: false),
                    FeatureId = table.Column<int>(type: "int", nullable: false)
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
                        name: "FK_SubscriptionPlanFeatures_SubscriptionPlans_SubscriptionPlanId",
                        column: x => x.SubscriptionPlanId,
                        principalTable: "SubscriptionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tenant",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Domain = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrialEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubscriptionEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StripeCustomerId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StripeSubscriptionId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    SubscriptionPlanId = table.Column<int>(type: "int", nullable: true),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    MaxProjects = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsIsolated = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenant", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tenant_SubscriptionPlans_SubscriptionPlanId",
                        column: x => x.SubscriptionPlanId,
                        principalTable: "SubscriptionPlans",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BidPreparations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    DocumentCategoriesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RegionalMangerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    RegionalDirectorId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BidPreparations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BidPreparations_AspNetUsers_RegionalDirectorId",
                        column: x => x.RegionalDirectorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BidPreparations_AspNetUsers_RegionalMangerId",
                        column: x => x.RegionalMangerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BidPreparations_OpportunityTrackings_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "OpportunityTrackings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GoNoGoDecisionHeaders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    TypeOfBid = table.Column<int>(type: "int", nullable: false),
                    Sector = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BdHead = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Office = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RegionalBDHead = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TypeOfClient = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenderFee = table.Column<double>(type: "float", nullable: false),
                    Emd = table.Column<double>(type: "float", nullable: false),
                    TotalScore = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentVersion = table.Column<int>(type: "int", nullable: true),
                    VersionStatus = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoNoGoDecisionHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoNoGoDecisionHeaders_OpportunityTrackings_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "OpportunityTrackings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpportunityHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionBy = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    AssignedToId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityHistories_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpportunityHistories_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpportunityHistories_OpportunityStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "OpportunityStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OpportunityHistories_OpportunityTrackings_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "OpportunityTrackings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cashflows",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    Month = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalHours = table.Column<int>(type: "int", nullable: true),
                    PersonnelCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OdcCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalProjectCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CumulativeCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Revenue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CumulativeRevenue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CashFlow = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cashflows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cashflows_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChangeControls",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    SrNo = table.Column<int>(type: "int", nullable: false),
                    DateLogged = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Originator = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CostImpact = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    TimeImpact = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ResourcesImpact = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    QualityImpact = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ChangeOrderStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ClientApprovalStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ClaimSituation = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    WorkflowStatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PMWorkflowStatusId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeControls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeControls_PMWorkflowStatuses_PMWorkflowStatusId",
                        column: x => x.PMWorkflowStatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChangeControls_PMWorkflowStatuses_WorkflowStatusId",
                        column: x => x.WorkflowStatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChangeControls_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CheckReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    ActivityNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ActivityName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DocumentNumber = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DocumentName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Objective = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    References = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    QualityIssues = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Completion = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    CheckedBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ActionTaken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Maker = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Checker = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheckReviews_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CorrespondenceInwards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    IncomingLetterNo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    LetterDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NjsInwardNo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ReceiptDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    From = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AttachmentDetails = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ActionTaken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StoragePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RepliedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorrespondenceInwards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrespondenceInwards_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CorrespondenceOutwards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    LetterNo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    LetterDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    To = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AttachmentDetails = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ActionTaken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StoragePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Acknowledgement = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorrespondenceOutwards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrespondenceOutwards_Projects_ProjectId",
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
                    TenantId = table.Column<int>(type: "int", nullable: false),
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
                name: "InputRegisters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    DataReceived = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ReceiptDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReceivedFrom = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FilesFormat = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NoOfFiles = table.Column<int>(type: "int", nullable: false),
                    FitForPurpose = table.Column<bool>(type: "bit", nullable: false),
                    Check = table.Column<bool>(type: "bit", nullable: false),
                    CheckedBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CheckedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Custodian = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StoragePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InputRegisters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InputRegisters_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MonthlyProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    ManpowerTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonthlyProgresses_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectClosures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    ClientFeedback = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SuccessCriteria = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ClientExpectations = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    OtherStakeholders = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EnvIssues = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EnvManagement = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ThirdPartyIssues = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ThirdPartyManagement = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RiskIssues = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RiskManagement = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    KnowledgeGoals = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    BaselineComparison = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DelayedDeliverables = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    UnforeseeableDelays = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    BudgetEstimate = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProfitTarget = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ChangeOrders = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CloseOutBudget = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ResourceAvailability = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    VendorFeedback = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProjectTeamFeedback = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DesignOutputs = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProjectReviewMeetings = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ClientDesignReviews = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    InternalReporting = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ClientReporting = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    InternalMeetings = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ClientMeetings = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ExternalMeetings = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PlanUpToDate = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PlanUseful = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Hindrances = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ClientPayment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PlanningIssues = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PlanningLessons = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    BriefAims = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DesignReviewOutputs = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ConstructabilityReview = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DesignReview = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TechnicalRequirements = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    InnovativeIdeas = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SuitableOptions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AdditionalInformation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DeliverableExpectations = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    StakeholderInvolvement = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    KnowledgeGoalsAchieved = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TechnicalToolsDissemination = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SpecialistKnowledgeValue = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    OtherComments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TargetCostAccuracyValue = table.Column<bool>(type: "bit", nullable: true),
                    TargetCostAccuracy = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ChangeControlReviewValue = table.Column<bool>(type: "bit", nullable: true),
                    ChangeControlReview = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CompensationEventsValue = table.Column<bool>(type: "bit", nullable: true),
                    CompensationEvents = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ExpenditureProfileValue = table.Column<bool>(type: "bit", nullable: true),
                    ExpenditureProfile = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    HealthSafetyConcernsValue = table.Column<bool>(type: "bit", nullable: true),
                    HealthSafetyConcerns = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProgrammeRealisticValue = table.Column<bool>(type: "bit", nullable: true),
                    ProgrammeRealistic = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProgrammeUpdatesValue = table.Column<bool>(type: "bit", nullable: true),
                    ProgrammeUpdates = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RequiredQualityValue = table.Column<bool>(type: "bit", nullable: true),
                    RequiredQuality = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    OperationalRequirementsValue = table.Column<bool>(type: "bit", nullable: true),
                    OperationalRequirements = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ConstructionInvolvementValue = table.Column<bool>(type: "bit", nullable: true),
                    ConstructionInvolvement = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EfficienciesValue = table.Column<bool>(type: "bit", nullable: true),
                    Efficiencies = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    MaintenanceAgreementsValue = table.Column<bool>(type: "bit", nullable: true),
                    MaintenanceAgreements = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AsBuiltManualsValue = table.Column<bool>(type: "bit", nullable: true),
                    AsBuiltManuals = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    HsFileForwardedValue = table.Column<bool>(type: "bit", nullable: true),
                    HsFileForwarded = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Variations = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TechnoLegalIssues = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ConstructionOther = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Positives = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    LessonsLearned = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    WorkflowStatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PMWorkflowStatusId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectClosures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectClosures_PMWorkflowStatuses_PMWorkflowStatusId",
                        column: x => x.PMWorkflowStatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectClosures_PMWorkflowStatuses_WorkflowStatusId",
                        column: x => x.WorkflowStatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectClosures_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectResources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProjectRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AllocationPercentage = table.Column<double>(type: "float", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectResources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectResources_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectResources_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintPlans",
                columns: table => new
                {
                    SprintId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    SprintNumber = table.Column<int>(type: "int", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SprintGoal = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ProjectId = table.Column<int>(type: "int", nullable: true),
                    RequiredSprintEmployees = table.Column<int>(type: "int", nullable: false),
                    SprintName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PlannedStoryPoints = table.Column<int>(type: "int", nullable: false),
                    ActualStoryPoints = table.Column<int>(type: "int", nullable: false),
                    Velocity = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintPlans", x => x.SprintId);
                    table.ForeignKey(
                        name: "FK_SprintPlans_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskPlannedHourHeaders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskType = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskPlannedHourHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHourHeaders_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHourHeaders_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantDatabases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    DatabaseName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ConnectionString = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastBackup = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantDatabases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantDatabases_Tenant_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenant",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
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
                        name: "FK_TenantUsers_Tenant_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenant",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BidVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BidPreparationId = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    DocumentCategoriesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BidVersionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BidVersionHistories_BidPreparations_BidPreparationId",
                        column: x => x.BidPreparationId,
                        principalTable: "BidPreparations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GoNoGoDecisionTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    Commits = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GoNoGoDecisionHeaderId = table.Column<int>(type: "int", nullable: true),
                    ScoringCriteriaId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoNoGoDecisionTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoNoGoDecisionTransactions_GoNoGoDecisionHeaders_GoNoGoDecisionHeaderId",
                        column: x => x.GoNoGoDecisionHeaderId,
                        principalTable: "GoNoGoDecisionHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GoNoGoDecisionTransactions_ScoringCriteria_ScoringCriteriaId",
                        column: x => x.ScoringCriteriaId,
                        principalTable: "ScoringCriteria",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GoNoGoVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    GoNoGoDecisionHeaderId = table.Column<int>(type: "int", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    FormData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActonBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoNoGoVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoNoGoVersions_GoNoGoDecisionHeaders_GoNoGoDecisionHeaderId",
                        column: x => x.GoNoGoDecisionHeaderId,
                        principalTable: "GoNoGoDecisionHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChangeControlWorkflowHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ChangeControlId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionBy = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AssignedToId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    PMWorkflowStatusId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeControlWorkflowHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistories_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistories_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistories_ChangeControls_ChangeControlId",
                        column: x => x.ChangeControlId,
                        principalTable: "ChangeControls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistories_PMWorkflowStatuses_PMWorkflowStatusId",
                        column: x => x.PMWorkflowStatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ChangeControlWorkflowHistories_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BudgetTables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetTables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetTables_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChangeOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    ContractTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Fee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    SummaryDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeOrders_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractAndCosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    PriorCumulativeOdc = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PriorCumulativeStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PriorCumulativeTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ActualOdc = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ActualStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ActualSubtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalCumulativeOdc = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalCumulativeStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalCumulativeCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractAndCosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractAndCosts_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CTCEACs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    CtcODC = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CtcStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CtcSubtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ActualctcODC = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ActualCtcStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ActualCtcSubtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EacOdc = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    EacStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalEAC = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    GrossProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CTCEACs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CTCEACs_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CurrentMonthActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    Actions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurrentMonthActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CurrentMonthActions_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EarlyWarnings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    WarningsDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EarlyWarnings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EarlyWarnings_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FinancialDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    Net = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ServiceTax = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FeeTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    BudgetOdcs = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    BudgetStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    BudgetSubTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ContractType = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialDetails_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LastMonthActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    Actions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LastMonthActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LastMonthActions_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ManpowerPlannings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    WorkAssignment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Assignee = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Planned = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Consumed = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    NextMonthPlanning = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ManpowerComments = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManpowerPlannings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ManpowerPlannings_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProgrammeSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    ProgrammeDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgrammeSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgrammeSchedules_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProgressDeliverables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    Milestone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DueDateContract = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DueDatePlanned = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AchievedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentDue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentReceivedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliverableComments = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgressDeliverables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgressDeliverables_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Schedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    DateOfIssueWOLOI = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletionDateAsPerContract = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletionDateAsPerExtension = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpectedCompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Schedules_MonthlyProgresses_MonthlyProgressId",
                        column: x => x.MonthlyProgressId,
                        principalTable: "MonthlyProgresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectClosureWorkflowHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectClosureId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionBy = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AssignedToId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    PMWorkflowStatusId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectClosureWorkflowHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistories_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistories_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistories_PMWorkflowStatuses_PMWorkflowStatusId",
                        column: x => x.PMWorkflowStatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistories_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectClosureWorkflowHistories_ProjectClosures_ProjectClosureId",
                        column: x => x.ProjectClosureId,
                        principalTable: "ProjectClosures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintDailyProgresses",
                columns: table => new
                {
                    DailyProgressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    SprintPlanId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlannedStoryPoints = table.Column<int>(type: "int", nullable: false),
                    CompletedStoryPoints = table.Column<int>(type: "int", nullable: false),
                    RemainingStoryPoints = table.Column<int>(type: "int", nullable: false),
                    AddedStoryPoints = table.Column<int>(type: "int", nullable: false),
                    IdealRemainingPoints = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintDailyProgresses", x => x.DailyProgressId);
                    table.ForeignKey(
                        name: "FK_SprintDailyProgresses_SprintPlans_SprintPlanId",
                        column: x => x.SprintPlanId,
                        principalTable: "SprintPlans",
                        principalColumn: "SprintId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskPlannedHourHeaderId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    AssignedToId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSHistories_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSHistories_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSHistories_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSHistories_WBSTaskPlannedHourHeaders_WBSTaskPlannedHourHeaderId",
                        column: x => x.WBSTaskPlannedHourHeaderId,
                        principalTable: "WBSTaskPlannedHourHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CurrentBudgetInMISs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    BudgetTableId = table.Column<int>(type: "int", nullable: false),
                    RevenueFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurrentBudgetInMISs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CurrentBudgetInMISs_BudgetTables_BudgetTableId",
                        column: x => x.BudgetTableId,
                        principalTable: "BudgetTables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OriginalBudgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    BudgetTableId = table.Column<int>(type: "int", nullable: false),
                    RevenueFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OriginalBudgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OriginalBudgets_BudgetTables_BudgetTableId",
                        column: x => x.BudgetTableId,
                        principalTable: "BudgetTables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PercentCompleteOnCosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    BudgetTableId = table.Column<int>(type: "int", nullable: false),
                    RevenueFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PercentCompleteOnCosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PercentCompleteOnCosts_BudgetTables_BudgetTableId",
                        column: x => x.BudgetTableId,
                        principalTable: "BudgetTables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormHeaders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    FormId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartFormHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobStartFormHeaders_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobStartFormHeaders_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    JobStartFormHeaderId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    AssignedToId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartFormHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobStartFormHistories_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobStartFormHistories_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobStartFormHistories_JobStartFormHeaders_JobStartFormHeaderId",
                        column: x => x.JobStartFormHeaderId,
                        principalTable: "JobStartFormHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobStartFormHistories_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormResources",
                columns: table => new
                {
                    ResourceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    FormId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskId = table.Column<int>(type: "int", nullable: true),
                    TaskType = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Units = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BudgetedCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartFormResources", x => x.ResourceId);
                });

            migrationBuilder.CreateTable(
                name: "JobStartForms",
                columns: table => new
                {
                    FormId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    WorkBreakdownStructureId = table.Column<int>(type: "int", nullable: true),
                    FormTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PreparedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalTimeCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalExpenses = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GrandTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProjectFees = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ServiceTaxPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    ServiceTaxAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalProjectFees = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Profit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartForms", x => x.FormId);
                    table.ForeignKey(
                        name: "FK_JobStartForms_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormSelections",
                columns: table => new
                {
                    SelectionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    FormId = table.Column<int>(type: "int", nullable: false),
                    OptionCategory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OptionName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsSelected = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                name: "SprintSubtaskComments",
                columns: table => new
                {
                    SubtaskCommentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    CommentText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskid = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    SubtaskId = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintSubtaskComments", x => x.SubtaskCommentId);
                });

            migrationBuilder.CreateTable(
                name: "SprintSubtasks",
                columns: table => new
                {
                    SubtaskId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Subtaskkey = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Subtasktitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subtaskdescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subtaskpriority = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subtaskstatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskAssineid = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskAssigneeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskAssigneeAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskReporterId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskReporterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskReporterAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Attachments = table.Column<int>(type: "int", nullable: true),
                    SubtaskisExpanded = table.Column<bool>(type: "bit", nullable: true),
                    SubtaskcreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubtaskupdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubtaskType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskid = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    EstimatedHours = table.Column<int>(type: "int", nullable: false),
                    ActualHours = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintSubtasks", x => x.SubtaskId);
                });

            migrationBuilder.CreateTable(
                name: "SprintTaskComments",
                columns: table => new
                {
                    CommentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    CommentText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskid = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintTaskComments", x => x.CommentId);
                });

            migrationBuilder.CreateTable(
                name: "SprintTasks",
                columns: table => new
                {
                    Taskid = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Taskkey = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskdescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskpriority = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskAssineid = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskAssigneeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskAssigneeAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskReporterId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskReporterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskReporterAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskstatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StoryPoints = table.Column<int>(type: "int", nullable: true),
                    Attachments = table.Column<int>(type: "int", nullable: true),
                    IsExpanded = table.Column<bool>(type: "bit", nullable: true),
                    TaskcreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TaskupdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SprintPlanId = table.Column<int>(type: "int", nullable: true),
                    WbsPlanId = table.Column<int>(type: "int", nullable: true),
                    UserTaskId = table.Column<int>(type: "int", nullable: true),
                    AcceptanceCriteria = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    EstimatedHours = table.Column<int>(type: "int", nullable: false),
                    ActualHours = table.Column<int>(type: "int", nullable: false),
                    RemainingHours = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintTasks", x => x.Taskid);
                    table.ForeignKey(
                        name: "FK_SprintTasks_SprintPlans_SprintPlanId",
                        column: x => x.SprintPlanId,
                        principalTable: "SprintPlans",
                        principalColumn: "SprintId");
                });

            migrationBuilder.CreateTable(
                name: "UserWBSTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CostRate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalHours = table.Column<double>(type: "float", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ResourceRoleId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWBSTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserWBSTasks_AspNetRoles_ResourceRoleId",
                        column: x => x.ResourceRoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_UserWBSTasks_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserWBSTaskVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskVersionHistoryId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CostRate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TotalHours = table.Column<double>(type: "float", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ResourceRoleId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWBSTaskVersionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserWBSTaskVersionHistories_AspNetRoles_ResourceRoleId",
                        column: x => x.ResourceRoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_UserWBSTaskVersionHistories_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WBSHeaders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VersionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ApprovalStatus = table.Column<int>(type: "int", nullable: false),
                    LatestVersionHistoryId = table.Column<int>(type: "int", nullable: true),
                    ActiveVersionHistoryId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSHeaders_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSHeaderId = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsLatest = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSVersionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSVersionHistories_AspNetUsers_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSVersionHistories_AspNetUsers_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSVersionHistories_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSVersionHistories_WBSHeaders_WBSHeaderId",
                        column: x => x.WBSHeaderId,
                        principalTable: "WBSHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkBreakdownStructures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSHeaderId = table.Column<int>(type: "int", nullable: false),
                    Structure = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkBreakdownStructures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkBreakdownStructures_WBSHeaders_WBSHeaderId",
                        column: x => x.WBSHeaderId,
                        principalTable: "WBSHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSVersionHistoryId = table.Column<int>(type: "int", nullable: false),
                    OriginalTaskId = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    EstimatedBudget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TaskType = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskVersionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskVersionHistories_WBSVersionHistories_WBSVersionHistoryId",
                        column: x => x.WBSVersionHistoryId,
                        principalTable: "WBSVersionHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSVersionWorkflowHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSVersionHistoryId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    AssignedToId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSVersionWorkflowHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSVersionWorkflowHistories_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSVersionWorkflowHistories_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSVersionWorkflowHistories_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSVersionWorkflowHistories_WBSVersionHistories_WBSVersionHistoryId",
                        column: x => x.WBSVersionHistoryId,
                        principalTable: "WBSVersionHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WorkBreakdownStructureId = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EstimatedBudget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TaskType = table.Column<int>(type: "int", nullable: false),
                    WBSOptionId = table.Column<int>(type: "int", nullable: false),
                    ParentId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTasks_WBSOptions_WBSOptionId",
                        column: x => x.WBSOptionId,
                        principalTable: "WBSOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WBSTasks_WBSTasks_ParentId",
                        column: x => x.ParentId,
                        principalTable: "WBSTasks",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSTasks_WorkBreakdownStructures_WorkBreakdownStructureId",
                        column: x => x.WorkBreakdownStructureId,
                        principalTable: "WorkBreakdownStructures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskPlannedHourVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskVersionHistoryId = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    Month = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PlannedHours = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskPlannedHourVersionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHourVersionHistories_WBSTaskVersionHistories_WBSTaskVersionHistoryId",
                        column: x => x.WBSTaskVersionHistoryId,
                        principalTable: "WBSTaskVersionHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskPlannedHours",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskPlannedHourHeaderId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskId = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    Month = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PlannedHours = table.Column<double>(type: "float", nullable: false),
                    ActualHours = table.Column<double>(type: "float", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskPlannedHours", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHours_WBSTaskPlannedHourHeaders_WBSTaskPlannedHourHeaderId",
                        column: x => x.WBSTaskPlannedHourHeaderId,
                        principalTable: "WBSTaskPlannedHourHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHours_WBSTasks_WBSTaskId",
                        column: x => x.WBSTaskId,
                        principalTable: "WBSTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "IX_AuditLogs_ChangedAt",
                table: "AuditLogs",
                column: "ChangedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_ChangedBy",
                table: "AuditLogs",
                column: "ChangedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityId",
                table: "AuditLogs",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityName",
                table: "AuditLogs",
                column: "EntityName");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityName_EntityId",
                table: "AuditLogs",
                columns: new[] { "EntityName", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_BidPreparations_OpportunityId",
                table: "BidPreparations",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_BidPreparations_RegionalDirectorId",
                table: "BidPreparations",
                column: "RegionalDirectorId");

            migrationBuilder.CreateIndex(
                name: "IX_BidPreparations_RegionalMangerId",
                table: "BidPreparations",
                column: "RegionalMangerId");

            migrationBuilder.CreateIndex(
                name: "IX_BidPreparations_UserId",
                table: "BidPreparations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BidVersionHistories_BidPreparationId",
                table: "BidVersionHistories",
                column: "BidPreparationId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTables_MonthlyProgressId",
                table: "BudgetTables",
                column: "MonthlyProgressId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cashflows_ProjectId",
                table: "Cashflows",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControls_PMWorkflowStatusId",
                table: "ChangeControls",
                column: "PMWorkflowStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControls_ProjectId",
                table: "ChangeControls",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControls_WorkflowStatusId",
                table: "ChangeControls",
                column: "WorkflowStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistories_ActionBy",
                table: "ChangeControlWorkflowHistories",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistories_AssignedToId",
                table: "ChangeControlWorkflowHistories",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistories_ChangeControlId",
                table: "ChangeControlWorkflowHistories",
                column: "ChangeControlId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistories_PMWorkflowStatusId",
                table: "ChangeControlWorkflowHistories",
                column: "PMWorkflowStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistories_StatusId",
                table: "ChangeControlWorkflowHistories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeOrders_MonthlyProgressId",
                table: "ChangeOrders",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckReviews_ProjectId",
                table: "CheckReviews",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractAndCosts_MonthlyProgressId",
                table: "ContractAndCosts",
                column: "MonthlyProgressId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceInwards_ProjectId",
                table: "CorrespondenceInwards",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrespondenceOutwards_ProjectId",
                table: "CorrespondenceOutwards",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_CTCEACs_MonthlyProgressId",
                table: "CTCEACs",
                column: "MonthlyProgressId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CurrentBudgetInMISs_BudgetTableId",
                table: "CurrentBudgetInMISs",
                column: "BudgetTableId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CurrentMonthActions_MonthlyProgressId",
                table: "CurrentMonthActions",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_EarlyWarnings_MonthlyProgressId",
                table: "EarlyWarnings",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialDetails_MonthlyProgressId",
                table: "FinancialDetails",
                column: "MonthlyProgressId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisionHeaders_OpportunityId",
                table: "GoNoGoDecisionHeaders",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisionOpportunities_ScoreRangeId",
                table: "GoNoGoDecisionOpportunities",
                column: "ScoreRangeId");

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisionOpportunities_ScoringCriteriaId",
                table: "GoNoGoDecisionOpportunities",
                column: "ScoringCriteriaId");

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisions_ProjectId",
                table: "GoNoGoDecisions",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisionTransactions_GoNoGoDecisionHeaderId",
                table: "GoNoGoDecisionTransactions",
                column: "GoNoGoDecisionHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisionTransactions_ScoringCriteriaId",
                table: "GoNoGoDecisionTransactions",
                column: "ScoringCriteriaId");

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoVersions_GoNoGoDecisionHeaderId",
                table: "GoNoGoVersions",
                column: "GoNoGoDecisionHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_InputRegisters_ProjectId",
                table: "InputRegisters",
                column: "ProjectId");

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
                name: "IX_LastMonthActions_MonthlyProgressId",
                table: "LastMonthActions",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_ManpowerPlannings_MonthlyProgressId",
                table: "ManpowerPlannings",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_MigrationResults_MigrationResultId",
                table: "MigrationResults",
                column: "MigrationResultId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyProgresses_ProjectId",
                table: "MonthlyProgresses",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityHistories_ActionBy",
                table: "OpportunityHistories",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityHistories_AssignedToId",
                table: "OpportunityHistories",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityHistories_OpportunityId",
                table: "OpportunityHistories",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityHistories_StatusId",
                table: "OpportunityHistories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTrackings_ApprovalManagerId",
                table: "OpportunityTrackings",
                column: "ApprovalManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTrackings_BidManagerId",
                table: "OpportunityTrackings",
                column: "BidManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTrackings_ReviewManagerId",
                table: "OpportunityTrackings",
                column: "ReviewManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_OriginalBudgets_BudgetTableId",
                table: "OriginalBudgets",
                column: "BudgetTableId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PercentCompleteOnCosts_BudgetTableId",
                table: "PercentCompleteOnCosts",
                column: "BudgetTableId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProgrammeSchedules_MonthlyProgressId",
                table: "ProgrammeSchedules",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressDeliverables_MonthlyProgressId",
                table: "ProgressDeliverables",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosures_PMWorkflowStatusId",
                table: "ProjectClosures",
                column: "PMWorkflowStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosures_ProjectId",
                table: "ProjectClosures",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosures_WorkflowStatusId",
                table: "ProjectClosures",
                column: "WorkflowStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistories_ActionBy",
                table: "ProjectClosureWorkflowHistories",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistories_AssignedToId",
                table: "ProjectClosureWorkflowHistories",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistories_PMWorkflowStatusId",
                table: "ProjectClosureWorkflowHistories",
                column: "PMWorkflowStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistories_ProjectClosureId",
                table: "ProjectClosureWorkflowHistories",
                column: "ProjectClosureId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistories_StatusId",
                table: "ProjectClosureWorkflowHistories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectResources_ProjectId",
                table: "ProjectResources",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectResources_UserId",
                table: "ProjectResources",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ProgramId",
                table: "Projects",
                column: "ProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ProjectManagerId",
                table: "Projects",
                column: "ProjectManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_RegionalManagerId",
                table: "Projects",
                column: "RegionalManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_SeniorProjectManagerId",
                table: "Projects",
                column: "SeniorProjectManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_MonthlyProgressId",
                table: "Schedules",
                column: "MonthlyProgressId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScoringDescriptionSummarry_ScoringDescriptionID",
                table: "ScoringDescriptionSummarry",
                column: "ScoringDescriptionID");

            migrationBuilder.CreateIndex(
                name: "IX_SprintDailyProgresses_SprintPlanId",
                table: "SprintDailyProgresses",
                column: "SprintPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintPlans_ProjectId",
                table: "SprintPlans",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintSubtaskComments_SubtaskId",
                table: "SprintSubtaskComments",
                column: "SubtaskId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintSubtaskComments_Taskid",
                table: "SprintSubtaskComments",
                column: "Taskid");

            migrationBuilder.CreateIndex(
                name: "IX_SprintSubtasks_Taskid",
                table: "SprintSubtasks",
                column: "Taskid");

            migrationBuilder.CreateIndex(
                name: "IX_SprintTaskComments_Taskid",
                table: "SprintTaskComments",
                column: "Taskid");

            migrationBuilder.CreateIndex(
                name: "IX_SprintTasks_SprintPlanId",
                table: "SprintTasks",
                column: "SprintPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintTasks_UserTaskId",
                table: "SprintTasks",
                column: "UserTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintTasks_WbsPlanId",
                table: "SprintTasks",
                column: "WbsPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlanFeatures_FeatureId",
                table: "SubscriptionPlanFeatures",
                column: "FeatureId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionPlanFeatures_SubscriptionPlanId",
                table: "SubscriptionPlanFeatures",
                column: "SubscriptionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenant_SubscriptionPlanId",
                table: "Tenant",
                column: "SubscriptionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDatabases_TenantId",
                table: "TenantDatabases",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_TenantId",
                table: "TenantUsers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_UserId",
                table: "TenantUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TwoFactorCodes_UserId",
                table: "TwoFactorCodes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTasks_ResourceRoleId",
                table: "UserWBSTasks",
                column: "ResourceRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTasks_UserId",
                table: "UserWBSTasks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTasks_WBSTaskId",
                table: "UserWBSTasks",
                column: "WBSTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTaskVersionHistories_ResourceRoleId",
                table: "UserWBSTaskVersionHistories",
                column: "ResourceRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTaskVersionHistories_UserId",
                table: "UserWBSTaskVersionHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTaskVersionHistories_WBSTaskVersionHistoryId",
                table: "UserWBSTaskVersionHistories",
                column: "WBSTaskVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHeaders_ActiveVersionHistoryId",
                table: "WBSHeaders",
                column: "ActiveVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHeaders_LatestVersionHistoryId",
                table: "WBSHeaders",
                column: "LatestVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHeaders_ProjectId",
                table: "WBSHeaders",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistories_ActionBy",
                table: "WBSHistories",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistories_AssignedToId",
                table: "WBSHistories",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistories_StatusId",
                table: "WBSHistories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistories_WBSTaskPlannedHourHeaderId",
                table: "WBSHistories",
                column: "WBSTaskPlannedHourHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSOptions_FormType",
                table: "WBSOptions",
                column: "FormType");

            migrationBuilder.CreateIndex(
                name: "IX_WBSOptions_Level",
                table: "WBSOptions",
                column: "Level");

            migrationBuilder.CreateIndex(
                name: "IX_WBSOptions_ParentId",
                table: "WBSOptions",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHourHeaders_ProjectId",
                table: "WBSTaskPlannedHourHeaders",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHourHeaders_StatusId",
                table: "WBSTaskPlannedHourHeaders",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHours_WBSTaskId",
                table: "WBSTaskPlannedHours",
                column: "WBSTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHours_WBSTaskPlannedHourHeaderId",
                table: "WBSTaskPlannedHours",
                column: "WBSTaskPlannedHourHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskPlannedHourVersionHistories_WBSTaskVersionHistoryId",
                table: "WBSTaskPlannedHourVersionHistories",
                column: "WBSTaskVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTasks_ParentId",
                table: "WBSTasks",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTasks_WBSOptionId",
                table: "WBSTasks",
                column: "WBSOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTasks_WorkBreakdownStructureId",
                table: "WBSTasks",
                column: "WorkBreakdownStructureId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskVersionHistories_DisplayOrder",
                table: "WBSTaskVersionHistories",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskVersionHistories_OriginalTaskId",
                table: "WBSTaskVersionHistories",
                column: "OriginalTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskVersionHistories_WBSVersionHistoryId",
                table: "WBSTaskVersionHistories",
                column: "WBSVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_ApprovedBy",
                table: "WBSVersionHistories",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_CreatedAt",
                table: "WBSVersionHistories",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_CreatedBy",
                table: "WBSVersionHistories",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_IsActive",
                table: "WBSVersionHistories",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_IsLatest",
                table: "WBSVersionHistories",
                column: "IsLatest");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_StatusId",
                table: "WBSVersionHistories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_Version",
                table: "WBSVersionHistories",
                column: "Version");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_WBSHeaderId",
                table: "WBSVersionHistories",
                column: "WBSHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistories_ActionBy",
                table: "WBSVersionWorkflowHistories",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistories_ActionDate",
                table: "WBSVersionWorkflowHistories",
                column: "ActionDate");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistories_AssignedToId",
                table: "WBSVersionWorkflowHistories",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistories_StatusId",
                table: "WBSVersionWorkflowHistories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistories_WBSVersionHistoryId",
                table: "WBSVersionWorkflowHistories",
                column: "WBSVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkBreakdownStructures_Name",
                table: "WorkBreakdownStructures",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_WorkBreakdownStructures_WBSHeaderId",
                table: "WorkBreakdownStructures",
                column: "WBSHeaderId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormHeaders_JobStartForms_FormId",
                table: "JobStartFormHeaders",
                column: "FormId",
                principalTable: "JobStartForms",
                principalColumn: "FormId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormResources_JobStartForms_FormId",
                table: "JobStartFormResources",
                column: "FormId",
                principalTable: "JobStartForms",
                principalColumn: "FormId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartForms_WorkBreakdownStructures_WorkBreakdownStructureId",
                table: "JobStartForms",
                column: "WorkBreakdownStructureId",
                principalTable: "WorkBreakdownStructures",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SprintSubtaskComments_SprintSubtasks_SubtaskId",
                table: "SprintSubtaskComments",
                column: "SubtaskId",
                principalTable: "SprintSubtasks",
                principalColumn: "SubtaskId");

            migrationBuilder.AddForeignKey(
                name: "FK_SprintSubtaskComments_SprintTasks_Taskid",
                table: "SprintSubtaskComments",
                column: "Taskid",
                principalTable: "SprintTasks",
                principalColumn: "Taskid");

            migrationBuilder.AddForeignKey(
                name: "FK_SprintSubtasks_SprintTasks_Taskid",
                table: "SprintSubtasks",
                column: "Taskid",
                principalTable: "SprintTasks",
                principalColumn: "Taskid");

            migrationBuilder.AddForeignKey(
                name: "FK_SprintTaskComments_SprintTasks_Taskid",
                table: "SprintTaskComments",
                column: "Taskid",
                principalTable: "SprintTasks",
                principalColumn: "Taskid");

            migrationBuilder.AddForeignKey(
                name: "FK_SprintTasks_UserWBSTasks_UserTaskId",
                table: "SprintTasks",
                column: "UserTaskId",
                principalTable: "UserWBSTasks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SprintTasks_WBSTaskPlannedHours_WbsPlanId",
                table: "SprintTasks",
                column: "WbsPlanId",
                principalTable: "WBSTaskPlannedHours",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTasks_WBSTasks_WBSTaskId",
                table: "UserWBSTasks",
                column: "WBSTaskId",
                principalTable: "WBSTasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTaskVersionHistories_WBSTaskVersionHistories_WBSTaskVersionHistoryId",
                table: "UserWBSTaskVersionHistories",
                column: "WBSTaskVersionHistoryId",
                principalTable: "WBSTaskVersionHistories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSHeaders_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WBSHeaders",
                column: "ActiveVersionHistoryId",
                principalTable: "WBSVersionHistories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSHeaders_WBSVersionHistories_LatestVersionHistoryId",
                table: "WBSHeaders",
                column: "LatestVersionHistoryId",
                principalTable: "WBSVersionHistories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_AspNetUsers_ProjectManagerId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_AspNetUsers_RegionalManagerId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_AspNetUsers_SeniorProjectManagerId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_ApprovedBy",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_CreatedBy",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSHeaders_Projects_ProjectId",
                table: "WBSHeaders");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSHeaders_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WBSHeaders");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSHeaders_WBSVersionHistories_LatestVersionHistoryId",
                table: "WBSHeaders");

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
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "BidVersionHistories");

            migrationBuilder.DropTable(
                name: "Cashflows");

            migrationBuilder.DropTable(
                name: "ChangeControlWorkflowHistories");

            migrationBuilder.DropTable(
                name: "ChangeOrders");

            migrationBuilder.DropTable(
                name: "CheckReviews");

            migrationBuilder.DropTable(
                name: "ContractAndCosts");

            migrationBuilder.DropTable(
                name: "CorrespondenceInwards");

            migrationBuilder.DropTable(
                name: "CorrespondenceOutwards");

            migrationBuilder.DropTable(
                name: "CreateAccounts");

            migrationBuilder.DropTable(
                name: "CTCEACs");

            migrationBuilder.DropTable(
                name: "CurrentBudgetInMISs");

            migrationBuilder.DropTable(
                name: "CurrentMonthActions");

            migrationBuilder.DropTable(
                name: "EarlyWarnings");

            migrationBuilder.DropTable(
                name: "FailedEmailLogs");

            migrationBuilder.DropTable(
                name: "FinancialDetails");

            migrationBuilder.DropTable(
                name: "GoNoGoDecisionOpportunities");

            migrationBuilder.DropTable(
                name: "GoNoGoDecisions");

            migrationBuilder.DropTable(
                name: "GoNoGoDecisionTransactions");

            migrationBuilder.DropTable(
                name: "GoNoGoVersions");

            migrationBuilder.DropTable(
                name: "InputRegisters");

            migrationBuilder.DropTable(
                name: "JobStartFormHistories");

            migrationBuilder.DropTable(
                name: "JobStartFormResources");

            migrationBuilder.DropTable(
                name: "JobStartFormSelections");

            migrationBuilder.DropTable(
                name: "LastMonthActions");

            migrationBuilder.DropTable(
                name: "ManpowerPlannings");

            migrationBuilder.DropTable(
                name: "MeasurementUnits");

            migrationBuilder.DropTable(
                name: "MigrationResults");

            migrationBuilder.DropTable(
                name: "OpportunityHistories");

            migrationBuilder.DropTable(
                name: "OriginalBudgets");

            migrationBuilder.DropTable(
                name: "PercentCompleteOnCosts");

            migrationBuilder.DropTable(
                name: "ProgrammeSchedules");

            migrationBuilder.DropTable(
                name: "ProgressDeliverables");

            migrationBuilder.DropTable(
                name: "ProjectClosureWorkflowHistories");

            migrationBuilder.DropTable(
                name: "ProjectResources");

            migrationBuilder.DropTable(
                name: "Regions");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "Schedules");

            migrationBuilder.DropTable(
                name: "ScoringDescriptionSummarry");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "SprintDailyProgresses");

            migrationBuilder.DropTable(
                name: "SprintSubtaskComments");

            migrationBuilder.DropTable(
                name: "SprintTaskComments");

            migrationBuilder.DropTable(
                name: "SubscriptionPlanFeatures");

            migrationBuilder.DropTable(
                name: "TenantDatabases");

            migrationBuilder.DropTable(
                name: "TenantUsers");

            migrationBuilder.DropTable(
                name: "TwoFactorCodes");

            migrationBuilder.DropTable(
                name: "UserWBSTaskVersionHistories");

            migrationBuilder.DropTable(
                name: "WBSHistories");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHourVersionHistories");

            migrationBuilder.DropTable(
                name: "WBSVersionWorkflowHistories");

            migrationBuilder.DropTable(
                name: "BidPreparations");

            migrationBuilder.DropTable(
                name: "ChangeControls");

            migrationBuilder.DropTable(
                name: "ScoreRange");

            migrationBuilder.DropTable(
                name: "ScoringCriteria");

            migrationBuilder.DropTable(
                name: "GoNoGoDecisionHeaders");

            migrationBuilder.DropTable(
                name: "JobStartFormHeaders");

            migrationBuilder.DropTable(
                name: "OpportunityStatuses");

            migrationBuilder.DropTable(
                name: "BudgetTables");

            migrationBuilder.DropTable(
                name: "ProjectClosures");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "ScoringDescription");

            migrationBuilder.DropTable(
                name: "SprintSubtasks");

            migrationBuilder.DropTable(
                name: "Features");

            migrationBuilder.DropTable(
                name: "Tenant");

            migrationBuilder.DropTable(
                name: "WBSTaskVersionHistories");

            migrationBuilder.DropTable(
                name: "OpportunityTrackings");

            migrationBuilder.DropTable(
                name: "JobStartForms");

            migrationBuilder.DropTable(
                name: "MonthlyProgresses");

            migrationBuilder.DropTable(
                name: "SprintTasks");

            migrationBuilder.DropTable(
                name: "SubscriptionPlans");

            migrationBuilder.DropTable(
                name: "SprintPlans");

            migrationBuilder.DropTable(
                name: "UserWBSTasks");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHours");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHourHeaders");

            migrationBuilder.DropTable(
                name: "WBSTasks");

            migrationBuilder.DropTable(
                name: "WBSOptions");

            migrationBuilder.DropTable(
                name: "WorkBreakdownStructures");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Programs");

            migrationBuilder.DropTable(
                name: "PMWorkflowStatuses");

            migrationBuilder.DropTable(
                name: "WBSVersionHistories");

            migrationBuilder.DropTable(
                name: "WBSHeaders");
        }
    }
}
