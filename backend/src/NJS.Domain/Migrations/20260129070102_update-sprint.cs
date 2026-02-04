using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class updatesprint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SprintWbsPlanId",
                table: "SprintTasks",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SprintWbsPlans",
                columns: table => new
                {
                    SprintWbsPlanId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskId = table.Column<int>(type: "int", nullable: true),
                    WBSTaskName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentWBSTaskId = table.Column<int>(type: "int", nullable: true),
                    AssignedUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AssignedUserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RoleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MonthYear = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SprintNumber = table.Column<int>(type: "int", nullable: false),
                    PlannedHours = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RemainingHours = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProgramSequence = table.Column<int>(type: "int", nullable: false),
                    IsConsumed = table.Column<bool>(type: "bit", nullable: false),
                    AcceptanceCriteria = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintWbsPlans", x => x.SprintWbsPlanId);
                    table.ForeignKey(
                        name: "FK_SprintWbsPlans_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SprintTasks_SprintWbsPlanId",
                table: "SprintTasks",
                column: "SprintWbsPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintWbsPlans_ProjectId",
                table: "SprintWbsPlans",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_SprintTasks_SprintWbsPlans_SprintWbsPlanId",
                table: "SprintTasks",
                column: "SprintWbsPlanId",
                principalTable: "SprintWbsPlans",
                principalColumn: "SprintWbsPlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SprintTasks_SprintWbsPlans_SprintWbsPlanId",
                table: "SprintTasks");

            migrationBuilder.DropTable(
                name: "SprintWbsPlans");

            migrationBuilder.DropIndex(
                name: "IX_SprintTasks_SprintWbsPlanId",
                table: "SprintTasks");

            migrationBuilder.DropColumn(
                name: "SprintWbsPlanId",
                table: "SprintTasks");
        }
    }
}
