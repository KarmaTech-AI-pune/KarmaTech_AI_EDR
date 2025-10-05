using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class addisIsolatedFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsIsolated",
                table: "Tenant",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsIsolated",
                table: "Tenant");
        }
    }
}
