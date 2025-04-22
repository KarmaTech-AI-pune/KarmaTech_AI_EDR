using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Discriminator = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MinRate = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsResourceRole = table.Column<bool>(type: "bit", nullable: true),
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
                name: "FailedEmailLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "OpportunityStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "Regions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoringDescription", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WBSOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    ParentValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
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
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "GoNoGoDecisionOpportunities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "BidPreparations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProjectNo = table.Column<int>(type: "int", nullable: false),
                    ClientName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TypeOfClient = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProjectManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    SeniorProjectManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    RegionalManagerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Office = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Region = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TypeOfJob = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Sector = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FeeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Budget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CapitalValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Progress = table.Column<int>(type: "int", nullable: false),
                    DurationInMonths = table.Column<int>(type: "int", nullable: true),
                    FundingStream = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContractType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OpportunityTrackingId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LetterOfAcceptance = table.Column<bool>(type: "bit", nullable: false)
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
                        name: "FK_Projects_OpportunityTrackings_OpportunityTrackingId",
                        column: x => x.OpportunityTrackingId,
                        principalTable: "OpportunityTrackings",
                        principalColumn: "Id");
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
                name: "FeasibilityStudies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    ProjectDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StrategicRanking = table.Column<int>(type: "int", nullable: false),
                    FinancialInformation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    StudyDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProbabilityAssessment = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CompetitionAnalysis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FundingStream = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContractType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QualifyingCriteria = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                name: "InputRegisters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "ProjectResources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "WorkBreakdownStructures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Structure = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Version = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                name: "JobStartForms",
                columns: table => new
                {
                    FormId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                    table.ForeignKey(
                        name: "FK_JobStartForms_WorkBreakdownStructures_WorkBreakdownStructureId",
                        column: x => x.WorkBreakdownStructureId,
                        principalTable: "WorkBreakdownStructures",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WBSTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkBreakdownStructureId = table.Column<int>(type: "int", nullable: false),
                    ParentId = table.Column<int>(type: "int", nullable: true),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EstimatedBudget = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTasks_WBSTasks_ParentId",
                        column: x => x.ParentId,
                        principalTable: "WBSTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSTasks_WorkBreakdownStructures_WorkBreakdownStructureId",
                        column: x => x.WorkBreakdownStructureId,
                        principalTable: "WorkBreakdownStructures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormSelections",
                columns: table => new
                {
                    SelectionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "UserWBSTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    WBSTaskId = table.Column<int>(type: "int", nullable: false),
                    CostRate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ODCCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalHours = table.Column<double>(type: "float", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ODCHours = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
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

            migrationBuilder.CreateTable(
                name: "WBSTaskMonthlyHour",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                    table.PrimaryKey("PK_WBSTaskMonthlyHour", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskMonthlyHour_WBSTasks_WBSTaskId",
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
                name: "IX_FeasibilityStudies_ProjectId",
                table: "FeasibilityStudies",
                column: "ProjectId");

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
                name: "IX_ProjectResources_ProjectId",
                table: "ProjectResources",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectResources_UserId",
                table: "ProjectResources",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OpportunityTrackingId",
                table: "Projects",
                column: "OpportunityTrackingId");

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
                name: "IX_ScoringDescriptionSummarry_ScoringDescriptionID",
                table: "ScoringDescriptionSummarry",
                column: "ScoringDescriptionID");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTasks_UserId",
                table: "UserWBSTasks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTasks_WBSTaskId",
                table: "UserWBSTasks",
                column: "WBSTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSOptions_FormType",
                table: "WBSOptions",
                column: "FormType");

            migrationBuilder.CreateIndex(
                name: "IX_WBSOptions_Level",
                table: "WBSOptions",
                column: "Level");

            migrationBuilder.CreateIndex(
                name: "IX_WBSOptions_ParentValue",
                table: "WBSOptions",
                column: "ParentValue");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskMonthlyHour_WBSTaskId",
                table: "WBSTaskMonthlyHour",
                column: "WBSTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTasks_ParentId",
                table: "WBSTasks",
                column: "ParentId");

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
                name: "BidVersionHistories");

            migrationBuilder.DropTable(
                name: "FailedEmailLogs");

            migrationBuilder.DropTable(
                name: "FeasibilityStudies");

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
                name: "JobStartFormSelections");

            migrationBuilder.DropTable(
                name: "OpportunityHistories");

            migrationBuilder.DropTable(
                name: "ProjectResources");

            migrationBuilder.DropTable(
                name: "Regions");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "ScoringDescriptionSummarry");

            migrationBuilder.DropTable(
                name: "UserWBSTasks");

            migrationBuilder.DropTable(
                name: "WBSOptions");

            migrationBuilder.DropTable(
                name: "WBSTaskMonthlyHour");

            migrationBuilder.DropTable(
                name: "BidPreparations");

            migrationBuilder.DropTable(
                name: "ScoreRange");

            migrationBuilder.DropTable(
                name: "ScoringCriteria");

            migrationBuilder.DropTable(
                name: "GoNoGoDecisionHeaders");

            migrationBuilder.DropTable(
                name: "JobStartForms");

            migrationBuilder.DropTable(
                name: "OpportunityStatuses");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "ScoringDescription");

            migrationBuilder.DropTable(
                name: "WBSTasks");

            migrationBuilder.DropTable(
                name: "WorkBreakdownStructures");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "OpportunityTrackings");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
