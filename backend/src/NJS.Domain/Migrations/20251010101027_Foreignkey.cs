using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Foreignkey : Migration
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
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_LatestVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropTable(
                name: "TodoNewSubtasks");

            migrationBuilder.DropTable(
                name: "TodoNewTeamMembers");

            migrationBuilder.DropTable(
                name: "TodoNewTasks");

            migrationBuilder.DropTable(
                name: "TodoNewProjects");

            migrationBuilder.DropColumn(
                name: "TodoProjectScheduleId",
                table: "WBSOptions");

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
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_ActiveVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkBreakdownStructures_WBSVersionHistories_LatestVersionHistoryId",
                table: "WorkBreakdownStructures");

            migrationBuilder.AddColumn<int>(
                name: "TodoProjectScheduleId",
                table: "WBSOptions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TodoNewProjects",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProjectName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                    Assineavatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Assinename = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Attachments = table.Column<int>(type: "int", nullable: true),
                    Comments = table.Column<int>(type: "int", nullable: true),
                    IsExpanded = table.Column<bool>(type: "bit", nullable: true),
                    StoryPoints = table.Column<int>(type: "int", nullable: true),
                    TaskAssigneeAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskAssigneeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskAssineid = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskReporterAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskReporterId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskReporterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskcreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Taskdescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskkey = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskpriority = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Taskstatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskupdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                    Taskid = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Attachments = table.Column<int>(type: "int", nullable: true),
                    SubtaskAssigneeAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskAssigneeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskAssineid = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskReporterAvatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskReporterId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskReporterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subtaskcomments = table.Column<int>(type: "int", nullable: true),
                    SubtaskcreatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Subtaskdescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subtaskpriority = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subtaskstatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Subtasktitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubtaskupdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
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
    }
}
