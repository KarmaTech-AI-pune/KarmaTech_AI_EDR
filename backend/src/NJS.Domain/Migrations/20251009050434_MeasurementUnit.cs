using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class MeasurementUnit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControls_PMWorkflowStatuses_WorkflowStatusId",
                table: "ChangeControls");

            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControls_Projects_ProjectId",
                table: "ChangeControls");

            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControlWorkflowHistories_AspNetUsers_ActionBy",
                table: "ChangeControlWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControlWorkflowHistories_AspNetUsers_AssignedToId",
                table: "ChangeControlWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControlWorkflowHistories_PMWorkflowStatuses_StatusId",
                table: "ChangeControlWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_JobStartFormHeaders_JobStartForms_FormId",
                table: "JobStartFormHeaders");

            migrationBuilder.DropForeignKey(
                name: "FK_JobStartForms_WorkBreakdownStructures_WorkBreakdownStructureId",
                table: "JobStartForms");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_OpportunityTrackings_OpportunityTrackingId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_LatestVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropIndex(
                name: "IX_WBSOptions_ParentValue",
                table: "WBSOptions");

            migrationBuilder.DropIndex(
                name: "IX_Projects_OpportunityTrackingId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Projects");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "WBSTasks",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<int>(
                name: "WBSOptionId",
                table: "WBSTasks",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ParentValue",
                table: "WBSOptions",
                type: "nvarchar(max)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TodoProjectScheduleId",
                table: "WBSOptions",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TypeOfJob",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "TypeOfClient",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Sector",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Region",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<decimal>(
                name: "Percentage",
                table: "Projects",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OpportunityTrackingId",
                table: "Projects",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Office",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "LastModifiedBy",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FundingStream",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FeeType",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Details",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(3)",
                oldMaxLength: 3);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "ContractType",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ClientName",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

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
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeasurementUnits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TodoNewProjects",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoNewProjects", x => x.ProjectId);
                });

            migrationBuilder.CreateTable(
                name: "TodoNewTeamMembers",
                columns: table => new
                {
                    Assineid = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Assinename = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Assineavatar = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoNewTeamMembers", x => x.Assineid);
                });

            migrationBuilder.CreateTable(
                name: "TodoNewTasks",
                columns: table => new
                {
                    Taskid = table.Column<string>(type: "nvarchar(450)", nullable: false),
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
                    Comments = table.Column<int>(type: "int", nullable: true),
                    IsExpanded = table.Column<bool>(type: "bit", nullable: true),
                    TaskcreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TaskupdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProjectId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoNewTasks", x => x.Taskid);
                    table.ForeignKey(
                        name: "FK_TodoNewTasks_TodoNewProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "TodoNewProjects",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TodoNewSubtasks",
                columns: table => new
                {
                    Subtaskkey = table.Column<string>(type: "nvarchar(450)", nullable: false),
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
                    Subtaskcomments = table.Column<int>(type: "int", nullable: true),
                    SubtaskcreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubtaskupdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubtaskType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskid = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoNewSubtasks", x => x.Subtaskkey);
                    table.ForeignKey(
                        name: "FK_TodoNewSubtasks_TodoNewTasks_Taskid",
                        column: x => x.Taskid,
                        principalTable: "TodoNewTasks",
                        principalColumn: "Taskid");
                });

            migrationBuilder.CreateIndex(
                name: "IX_WBSTasks_WBSOptionId",
                table: "WBSTasks",
                column: "WBSOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_TodoNewSubtasks_Taskid",
                table: "TodoNewSubtasks",
                column: "Taskid");

            migrationBuilder.CreateIndex(
                name: "IX_TodoNewTasks_ProjectId",
                table: "TodoNewTasks",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControls_PMWorkflowStatuses_WorkflowStatusId",
                table: "ChangeControls",
                column: "WorkflowStatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControls_Projects_ProjectId",
                table: "ChangeControls",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControlWorkflowHistories_AspNetUsers_ActionBy",
                table: "ChangeControlWorkflowHistories",
                column: "ActionBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControlWorkflowHistories_AspNetUsers_AssignedToId",
                table: "ChangeControlWorkflowHistories",
                column: "AssignedToId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControlWorkflowHistories_PMWorkflowStatuses_StatusId",
                table: "ChangeControlWorkflowHistories",
                column: "StatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormHeaders_JobStartForms_FormId",
                table: "JobStartFormHeaders",
                column: "FormId",
                principalTable: "JobStartForms",
                principalColumn: "FormId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartForms_WorkBreakdownStructures_WorkBreakdownStructureId",
                table: "JobStartForms",
                column: "WorkBreakdownStructureId",
                principalTable: "WorkBreakdownStructures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSTasks_WBSOptions_WBSOptionId",
                table: "WBSTasks",
                column: "WBSOptionId",
                principalTable: "WBSOptions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures",
                column: "ActiveVersionHistoryId",
                principalTable: "WBSVersionHistories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_LatestVersionHistoryId",
                table: "WorkBreakdownStructures",
                column: "LatestVersionHistoryId",
                principalTable: "WBSVersionHistories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControls_PMWorkflowStatuses_WorkflowStatusId",
                table: "ChangeControls");

            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControls_Projects_ProjectId",
                table: "ChangeControls");

            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControlWorkflowHistories_AspNetUsers_ActionBy",
                table: "ChangeControlWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControlWorkflowHistories_AspNetUsers_AssignedToId",
                table: "ChangeControlWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControlWorkflowHistories_PMWorkflowStatuses_StatusId",
                table: "ChangeControlWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_JobStartFormHeaders_JobStartForms_FormId",
                table: "JobStartFormHeaders");

            migrationBuilder.DropForeignKey(
                name: "FK_JobStartForms_WorkBreakdownStructures_WorkBreakdownStructureId",
                table: "JobStartForms");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSTasks_WBSOptions_WBSOptionId",
                table: "WBSTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_LatestVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropTable(
                name: "Cashflows");

            migrationBuilder.DropTable(
                name: "MeasurementUnits");

            migrationBuilder.DropTable(
                name: "TodoNewSubtasks");

            migrationBuilder.DropTable(
                name: "TodoNewTeamMembers");

            migrationBuilder.DropTable(
                name: "TodoNewTasks");

            migrationBuilder.DropTable(
                name: "TodoNewProjects");

            migrationBuilder.DropIndex(
                name: "IX_WBSTasks_WBSOptionId",
                table: "WBSTasks");

            migrationBuilder.DropColumn(
                name: "WBSOptionId",
                table: "WBSTasks");

            migrationBuilder.DropColumn(
                name: "TodoProjectScheduleId",
                table: "WBSOptions");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "WBSTasks",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ParentValue",
                table: "WBSOptions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TypeOfJob",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TypeOfClient",
                table: "Projects",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Sector",
                table: "Projects",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Region",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "Projects",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Percentage",
                table: "Projects",
                type: "decimal(5,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldPrecision: 18,
                oldScale: 2,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OpportunityTrackingId",
                table: "Projects",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Office",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "LastModifiedBy",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FundingStream",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FeeType",
                table: "Projects",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Details",
                table: "Projects",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "Projects",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ContractType",
                table: "Projects",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ClientName",
                table: "Projects",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Projects",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Projects",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WBSOptions_ParentValue",
                table: "WBSOptions",
                column: "ParentValue");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OpportunityTrackingId",
                table: "Projects",
                column: "OpportunityTrackingId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControls_PMWorkflowStatuses_WorkflowStatusId",
                table: "ChangeControls",
                column: "WorkflowStatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControls_Projects_ProjectId",
                table: "ChangeControls",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControlWorkflowHistories_AspNetUsers_ActionBy",
                table: "ChangeControlWorkflowHistories",
                column: "ActionBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControlWorkflowHistories_AspNetUsers_AssignedToId",
                table: "ChangeControlWorkflowHistories",
                column: "AssignedToId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControlWorkflowHistories_PMWorkflowStatuses_StatusId",
                table: "ChangeControlWorkflowHistories",
                column: "StatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormHeaders_JobStartForms_FormId",
                table: "JobStartFormHeaders",
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
                name: "FK_Projects_OpportunityTrackings_OpportunityTrackingId",
                table: "Projects",
                column: "OpportunityTrackingId",
                principalTable: "OpportunityTrackings",
                principalColumn: "Id");

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
    }
}
