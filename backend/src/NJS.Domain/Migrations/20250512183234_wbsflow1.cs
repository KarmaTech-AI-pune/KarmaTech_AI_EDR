using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class wbsflow1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TaskType",
                table: "WBSTaskMonthlyHourHeader",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TaskType",
                table: "WBSTaskMonthlyHourHeader");
        }
    }
}
