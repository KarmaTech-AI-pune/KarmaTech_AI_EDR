using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class FixJobStartFormResourcesRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobStartFormResources_JobStartForms_JobStartFormFormId",
                table: "JobStartFormResources");

            migrationBuilder.DropIndex(
                name: "IX_JobStartFormResources_JobStartFormFormId",
                table: "JobStartFormResources");

            migrationBuilder.DropColumn(
                name: "JobStartFormFormId",
                table: "JobStartFormResources");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "JobStartFormFormId",
                table: "JobStartFormResources",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormResources_JobStartFormFormId",
                table: "JobStartFormResources",
                column: "JobStartFormFormId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormResources_JobStartForms_JobStartFormFormId",
                table: "JobStartFormResources",
                column: "JobStartFormFormId",
                principalTable: "JobStartForms",
                principalColumn: "FormId");
        }
    }
}
