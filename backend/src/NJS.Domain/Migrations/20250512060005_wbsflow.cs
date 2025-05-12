using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class wbsflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WBSTaskMonthlyHourHeaderId",
                table: "WBSTaskMonthlyHour",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "WBSTaskMonthlyHourHeader",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSTaskMonthlyHourHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSTaskMonthlyHourHeader_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WBSHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WBSTaskMonthlyHourHeaderId = table.Column<int>(type: "int", nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActionBy = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    AssignedToId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WBSHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WBSHistories_AspNetUsers_ActionBy",
                        column: x => x.ActionBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSHistories_AspNetUsers_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WBSHistories_PMWorkflowStatuses_StatusId",
                        column: x => x.StatusId,
                        principalTable: "PMWorkflowStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WBSHistories_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                        column: x => x.WBSTaskMonthlyHourHeaderId,
                        principalTable: "WBSTaskMonthlyHourHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskMonthlyHour_WBSTaskMonthlyHourHeaderId",
                table: "WBSTaskMonthlyHour",
                column: "WBSTaskMonthlyHourHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistories_ActionBy",
                table: "WBSHistories",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistories_AssignedToId",
                table: "WBSHistories",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistories_StatusId",
                table: "WBSHistories",
                column: "StatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSHistories_WBSTaskMonthlyHourHeaderId",
                table: "WBSHistories",
                column: "WBSTaskMonthlyHourHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_WBSTaskMonthlyHourHeader_ProjectId",
                table: "WBSTaskMonthlyHourHeader",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSTaskMonthlyHour_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                table: "WBSTaskMonthlyHour",
                column: "WBSTaskMonthlyHourHeaderId",
                principalTable: "WBSTaskMonthlyHourHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WBSTaskMonthlyHour_WBSTaskMonthlyHourHeader_WBSTaskMonthlyHourHeaderId",
                table: "WBSTaskMonthlyHour");

            migrationBuilder.DropTable(
                name: "WBSHistories");

            migrationBuilder.DropTable(
                name: "WBSTaskMonthlyHourHeader");

            migrationBuilder.DropIndex(
                name: "IX_WBSTaskMonthlyHour_WBSTaskMonthlyHourHeaderId",
                table: "WBSTaskMonthlyHour");

            migrationBuilder.DropColumn(
                name: "WBSTaskMonthlyHourHeaderId",
                table: "WBSTaskMonthlyHour");
        }
    }
}
