using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AutoMigration_20250510_085046 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChangeControlWorkflowHistories_ChangeControls_ChangeControlId1",
                table: "ChangeControlWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectClosureWorkflowHistories_ProjectClosures_ProjectClosureId1",
                table: "ProjectClosureWorkflowHistories");

            migrationBuilder.DropIndex(
                name: "IX_ProjectClosureWorkflowHistories_ProjectClosureId1",
                table: "ProjectClosureWorkflowHistories");

            migrationBuilder.DropIndex(
                name: "IX_ChangeControlWorkflowHistories_ChangeControlId1",
                table: "ChangeControlWorkflowHistories");

            migrationBuilder.DropColumn(
                name: "ProjectClosureId1",
                table: "ProjectClosureWorkflowHistories");

            migrationBuilder.DropColumn(
                name: "ChangeControlId1",
                table: "ChangeControlWorkflowHistories");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProjectClosureId1",
                table: "ProjectClosureWorkflowHistories",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChangeControlId1",
                table: "ChangeControlWorkflowHistories",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectClosureWorkflowHistories_ProjectClosureId1",
                table: "ProjectClosureWorkflowHistories",
                column: "ProjectClosureId1");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeControlWorkflowHistories_ChangeControlId1",
                table: "ChangeControlWorkflowHistories",
                column: "ChangeControlId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ChangeControlWorkflowHistories_ChangeControls_ChangeControlId1",
                table: "ChangeControlWorkflowHistories",
                column: "ChangeControlId1",
                principalTable: "ChangeControls",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectClosureWorkflowHistories_ProjectClosures_ProjectClosureId1",
                table: "ProjectClosureWorkflowHistories",
                column: "ProjectClosureId1",
                principalTable: "ProjectClosures",
                principalColumn: "Id");
        }
    }
}
