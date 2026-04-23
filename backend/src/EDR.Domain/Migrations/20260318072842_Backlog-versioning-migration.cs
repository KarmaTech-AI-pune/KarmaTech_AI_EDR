using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDR.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Backlogversioningmigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BacklogVersion",
                table: "SprintWbsPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsCarryoverApplied",
                table: "SprintWbsPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BacklogVersion",
                table: "SprintWbsPlans");

            migrationBuilder.DropColumn(
                name: "IsCarryoverApplied",
                table: "SprintWbsPlans");
        }
    }
}
