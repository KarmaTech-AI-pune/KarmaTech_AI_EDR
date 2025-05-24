using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class tetstts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WBSHistories_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories");

            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "WBSTaskMonthlyHourHeader",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskMonthlyHourHeader_StatusId",
                table: "WBSTaskMonthlyHourHeader",
                column: "StatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSHistories_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories",
                column: "WBSTaskMonthlyHourHeaderId",
                principalTable: "WBSTaskMonthlyHourHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSTaskMonthlyHourHeader_PMWorkflowStatuses_StatusId",
                table: "WBSTaskMonthlyHourHeader",
                column: "StatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WBSHistories_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSTaskMonthlyHourHeader_PMWorkflowStatuses_StatusId",
                table: "WBSTaskMonthlyHourHeader");

            migrationBuilder.DropIndex(
                name: "IX_WBSTaskMonthlyHourHeader_StatusId",
                table: "WBSTaskMonthlyHourHeader");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "WBSTaskMonthlyHourHeader");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSHistories_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories",
                column: "WBSTaskMonthlyHourHeaderId",
                principalTable: "WBSTaskMonthlyHourHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
