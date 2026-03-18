using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDR.Domain.Migrations
{
    /// <inheritdoc />
    public partial class resolvedmonthlyprogressmigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "WorkedStoryPoint",
                table: "SprintTaskComments",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Approved",
                table: "ManpowerPlannings",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExtraCost",
                table: "ManpowerPlannings",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Payment",
                table: "ManpowerPlannings",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Rate",
                table: "ManpowerPlannings",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WorkedStoryPoint",
                table: "SprintTaskComments");

            migrationBuilder.DropColumn(
                name: "Approved",
                table: "ManpowerPlannings");

            migrationBuilder.DropColumn(
                name: "ExtraCost",
                table: "ManpowerPlannings");

            migrationBuilder.DropColumn(
                name: "Payment",
                table: "ManpowerPlannings");

            migrationBuilder.DropColumn(
                name: "Rate",
                table: "ManpowerPlannings");
        }
    }
}
