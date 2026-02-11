using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class featuremigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PriceINR",
                table: "Features");

            migrationBuilder.DropColumn(
                name: "PriceUSD",
                table: "Features");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Features",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Features");

            migrationBuilder.AddColumn<decimal>(
                name: "PriceINR",
                table: "Features",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceUSD",
                table: "Features",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }
    }
}
