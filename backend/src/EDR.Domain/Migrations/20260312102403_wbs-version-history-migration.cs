using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDR.Domain.Migrations
{
    /// <inheritdoc />
    public partial class wbsversionhistorymigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "WBSTaskVersionHistories",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WBSOptionId",
                table: "WBSTaskVersionHistories",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "WBSTaskVersionHistories");

            migrationBuilder.DropColumn(
                name: "WBSOptionId",
                table: "WBSTaskVersionHistories");
        }
    }
}
