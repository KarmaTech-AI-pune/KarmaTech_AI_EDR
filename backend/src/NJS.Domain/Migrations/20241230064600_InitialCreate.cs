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
            migrationBuilder.DropForeignKey(
                name: "FK_OpportunityTrackings_Projects_ProjectId",
                table: "OpportunityTrackings");

            migrationBuilder.DropForeignKey(
                name: "FK_OpportunityTrackings_WorkflowEntry_WorkflowId",
                table: "OpportunityTrackings");

            migrationBuilder.DropTable(
                name: "WorkflowEntry");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityTrackings_ProjectId",
                table: "OpportunityTrackings");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityTrackings_WorkflowId",
                table: "OpportunityTrackings");

            migrationBuilder.DropIndex(
                name: "IX_GoNoGoDecisions_ProjectId",
                table: "GoNoGoDecisions");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "OpportunityTrackings");

            migrationBuilder.DropColumn(
                name: "WorkflowId",
                table: "OpportunityTrackings");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisions_ProjectId",
                table: "GoNoGoDecisions",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GoNoGoDecisions_ProjectId",
                table: "GoNoGoDecisions");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "OpportunityTrackings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkflowId",
                table: "OpportunityTrackings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "WorkflowEntry",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignedToId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentStepNumber = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalSteps = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WorkflowType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowEntry_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTrackings_ProjectId",
                table: "OpportunityTrackings",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityTrackings_WorkflowId",
                table: "OpportunityTrackings",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_GoNoGoDecisions_ProjectId",
                table: "GoNoGoDecisions",
                column: "ProjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowEntry_AssignedToId",
                table: "WorkflowEntry",
                column: "AssignedToId");

            migrationBuilder.AddForeignKey(
                name: "FK_OpportunityTrackings_Projects_ProjectId",
                table: "OpportunityTrackings",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OpportunityTrackings_WorkflowEntry_WorkflowId",
                table: "OpportunityTrackings",
                column: "WorkflowId",
                principalTable: "WorkflowEntry",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
