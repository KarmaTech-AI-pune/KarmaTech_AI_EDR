using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDR.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Tenantlogomigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobStartFormHeaders_Projects_ProjectId",
                table: "JobStartFormHeaders");

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Tenants",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormHeaders_Projects_ProjectId",
                table: "JobStartFormHeaders",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobStartFormHeaders_Projects_ProjectId",
                table: "JobStartFormHeaders");

            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Tenants");

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormHeaders_Projects_ProjectId",
                table: "JobStartFormHeaders",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
