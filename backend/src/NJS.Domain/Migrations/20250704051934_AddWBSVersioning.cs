using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddWBSVersioning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTasks_AspNetUsers_UserId",
                table: "UserWBSTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSHistories_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories");

            migrationBuilder.DropTable(
                name: "WBSTaskMonthlyHour");

            migrationBuilder.DropTable(
                name: "WBSTaskMonthlyHourHeader");

            migrationBuilder.RenameColumn(
                name: "Version",
                table: "WorkBreakdownStructures",
                newName: "CurrentVersion");

            migrationBuilder.RenameColumn(
                name: "WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories",
                newName: "WBSTaskPlannedHourHeaderId");

            migrationBuilder.RenameIndex(
                name: "IX_WBSHistories_WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories",
                newName: "IX_WBSHistories_WBSTaskPlannedHourHeaderId");

            migrationBuilder.AddColumn<int>(
                name: "ActiveVersionHistoryId",
                table: "WorkBreakdownStructures",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LatestVersionHistoryId",
                table: "WorkBreakdownStructures",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResourceRoleId",
                table: "UserWBSTasks",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "JobStartFormHeaders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                        name: "FK_JobStartFormHeaders_JobStartForms_FormId",
                        column: x => x.FormId,
                        principalTable: "JobStartForms",
                        principalColumn: "FormId",
                        onDelete: ReferentialAction.Cascade);
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
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MonthlyProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                name: "WBSTaskPlannedHourHeaders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskType = table.Column<int>(type: "int", nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskPlannedHourHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHourHeaders_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WBSTaskPlannedHourHeaders_Projects_ProjectId",
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
                    WorkBreakdownStructureId = table.Column<int>(type: "int", nullable: false),
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
                        name: "FK_WBSVersionHistories_WorkBreakdownStructures_WorkBreakdownStructureId",
                        column: x => x.WorkBreakdownStructureId,
                        principalTable: "WorkBreakdownStructures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobStartFormHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                name: "BudgetTables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    ContractTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Fee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    ContractType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Percentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualOdcs = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualSubtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    CtcODC = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CtcStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CtcSubtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalEAC = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GrossProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    CMactions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CMAdate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CMAcomments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CMApriority = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    Net = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ServiceTax = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FeeTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BudgetOdcs = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BudgetStaff = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BudgetSubTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    LMactions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LMAdate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LMAcomments = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    WorkAssignment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Assignee = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Planned = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Consumed = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NextMonthPlanning = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    Milestone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DueDateContract = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDatePlanned = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AchievedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentDue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaymentReceivedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    MonthlyProgressId = table.Column<int>(type: "int", nullable: false),
                    DateOfIssueWOLOI = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletionDateAsPerContract = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletionDateAsPerExtension = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpectedCompletionDate = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                name: "WBSTaskPlannedHours",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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

            migrationBuilder.CreateTable(
                name: "WBSTaskVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WBSVersionHistoryId = table.Column<int>(type: "int", nullable: false),
                    OriginalTaskId = table.Column<int>(type: "int", nullable: false),
                    ParentId = table.Column<int>(type: "int", nullable: true),
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
                        name: "FK_WBSTaskVersionHistories_WBSTaskVersionHistories_ParentId",
                        column: x => x.ParentId,
                        principalTable: "WBSTaskVersionHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                name: "CurrentBudgetInMIS",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BudgetTableId = table.Column<int>(type: "int", nullable: false),
                    RevenueFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProfitPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurrentBudgetInMIS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CurrentBudgetInMIS_BudgetTables_BudgetTableId",
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
                name: "UserWBSTaskVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                    table.ForeignKey(
                        name: "FK_UserWBSTaskVersionHistories_WBSTaskVersionHistories_WBSTaskVersionHistoryId",
                        column: x => x.WBSTaskVersionHistoryId,
                        principalTable: "WBSTaskVersionHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSTaskPlannedHourVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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

            migrationBuilder.CreateIndex(
                name: "IX_WorkBreakdownStructures_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures",
                column: "ActiveVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkBreakdownStructures_LatestVersionHistoryId",
                table: "WorkBreakdownStructures",
                column: "LatestVersionHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWBSTasks_ResourceRoleId",
                table: "UserWBSTasks",
                column: "ResourceRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetTables_MonthlyProgressId",
                table: "BudgetTables",
                column: "MonthlyProgressId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChangeOrders_MonthlyProgressId",
                table: "ChangeOrders",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractAndCosts_MonthlyProgressId",
                table: "ContractAndCosts",
                column: "MonthlyProgressId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CTCEACs_MonthlyProgressId",
                table: "CTCEACs",
                column: "MonthlyProgressId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CurrentBudgetInMIS_BudgetTableId",
                table: "CurrentBudgetInMIS",
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
                name: "IX_LastMonthActions_MonthlyProgressId",
                table: "LastMonthActions",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_ManpowerPlannings_MonthlyProgressId",
                table: "ManpowerPlannings",
                column: "MonthlyProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyProgresses_ProjectId",
                table: "MonthlyProgresses",
                column: "ProjectId");

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
                name: "IX_Schedules_MonthlyProgressId",
                table: "Schedules",
                column: "MonthlyProgressId",
                unique: true);

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
                name: "IX_WBSTaskVersionHistories_DisplayOrder",
                table: "WBSTaskVersionHistories",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskVersionHistories_OriginalTaskId",
                table: "WBSTaskVersionHistories",
                column: "OriginalTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskVersionHistories_ParentId",
                table: "WBSTaskVersionHistories",
                column: "ParentId");

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
                name: "IX_WBSVersionHistories_WorkBreakdownStructureId",
                table: "WBSVersionHistories",
                column: "WorkBreakdownStructureId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTasks_AspNetRoles_ResourceRoleId",
                table: "UserWBSTasks",
                column: "ResourceRoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTasks_AspNetUsers_UserId",
                table: "UserWBSTasks",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSHistories_WBSTaskPlannedHourHeaders_WBSTaskPlannedHourHeaderId",
                table: "WBSHistories",
                column: "WBSTaskPlannedHourHeaderId",
                principalTable: "WBSTaskPlannedHourHeaders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures",
                column: "ActiveVersionHistoryId",
                principalTable: "WBSVersionHistories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_LatestVersionHistoryId",
                table: "WorkBreakdownStructures",
                column: "LatestVersionHistoryId",
                principalTable: "WBSVersionHistories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTasks_AspNetRoles_ResourceRoleId",
                table: "UserWBSTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTasks_AspNetUsers_UserId",
                table: "UserWBSTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSHistories_WBSTaskPlannedHourHeaders_WBSTaskPlannedHourHeaderId",
                table: "WBSHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_LatestVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropTable(
                name: "ChangeOrders");

            migrationBuilder.DropTable(
                name: "ContractAndCosts");

            migrationBuilder.DropTable(
                name: "CTCEACs");

            migrationBuilder.DropTable(
                name: "CurrentBudgetInMIS");

            migrationBuilder.DropTable(
                name: "CurrentMonthActions");

            migrationBuilder.DropTable(
                name: "EarlyWarnings");

            migrationBuilder.DropTable(
                name: "FinancialDetails");

            migrationBuilder.DropTable(
                name: "JobStartFormHistories");

            migrationBuilder.DropTable(
                name: "LastMonthActions");

            migrationBuilder.DropTable(
                name: "ManpowerPlannings");

            migrationBuilder.DropTable(
                name: "OriginalBudgets");

            migrationBuilder.DropTable(
                name: "PercentCompleteOnCosts");

            migrationBuilder.DropTable(
                name: "ProgrammeSchedules");

            migrationBuilder.DropTable(
                name: "ProgressDeliverables");

            migrationBuilder.DropTable(
                name: "Schedules");

            migrationBuilder.DropTable(
                name: "UserWBSTaskVersionHistories");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHours");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHourVersionHistories");

            migrationBuilder.DropTable(
                name: "WBSVersionWorkflowHistories");

            migrationBuilder.DropTable(
                name: "JobStartFormHeaders");

            migrationBuilder.DropTable(
                name: "BudgetTables");

            migrationBuilder.DropTable(
                name: "WBSTaskPlannedHourHeaders");

            migrationBuilder.DropTable(
                name: "WBSTaskVersionHistories");

            migrationBuilder.DropTable(
                name: "MonthlyProgresses");

            migrationBuilder.DropTable(
                name: "WBSVersionHistories");

            migrationBuilder.DropIndex(
                name: "IX_WorkBreakdownStructures_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropIndex(
                name: "IX_WorkBreakdownStructures_LatestVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropIndex(
                name: "IX_UserWBSTasks_ResourceRoleId",
                table: "UserWBSTasks");

            migrationBuilder.DropColumn(
                name: "ActiveVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropColumn(
                name: "LatestVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropColumn(
                name: "ResourceRoleId",
                table: "UserWBSTasks");

            migrationBuilder.RenameColumn(
                name: "CurrentVersion",
                table: "WorkBreakdownStructures",
                newName: "Version");

            migrationBuilder.RenameColumn(
                name: "WBSTaskPlannedHourHeaderId",
                table: "WBSHistories",
                newName: "WBSTaskMonthlyHourHeaderId");

            migrationBuilder.RenameIndex(
                name: "IX_WBSHistories_WBSTaskPlannedHourHeaderId",
                table: "WBSHistories",
                newName: "IX_WBSHistories_WBSTaskMonthlyHourHeaderId");

            migrationBuilder.CreateTable(
                name: "WBSTaskMonthlyHourHeader",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskType = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskMonthlyHourHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskMonthlyHourHeader_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WBSTaskMonthlyHourHeader_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
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
                    WBSTaskMonthlyHourHeaderId = table.Column<int>(type: "int", nullable: false),
                    ActualHours = table.Column<double>(type: "float", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Month = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PlannedHours = table.Column<double>(type: "float", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Year = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskMonthlyHour", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskMonthlyHour_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                        column: x => x.WBSTaskMonthlyHourHeaderId,
                        principalTable: "WBSTaskMonthlyHourHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WBSTaskMonthlyHour_WBSTasks_WBSTaskId",
                        column: x => x.WBSTaskId,
                        principalTable: "WBSTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskMonthlyHour_WBSTaskId",
                table: "WBSTaskMonthlyHour",
                column: "WBSTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskMonthlyHour_WBSTaskMonthlyHourHeaderId",
                table: "WBSTaskMonthlyHour",
                column: "WBSTaskMonthlyHourHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskMonthlyHourHeader_ProjectId",
                table: "WBSTaskMonthlyHourHeader",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskMonthlyHourHeader_StatusId",
                table: "WBSTaskMonthlyHourHeader",
                column: "StatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTasks_AspNetUsers_UserId",
                table: "UserWBSTasks",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSHistories_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories",
                column: "WBSTaskMonthlyHourHeaderId",
                principalTable: "WBSTaskMonthlyHourHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
