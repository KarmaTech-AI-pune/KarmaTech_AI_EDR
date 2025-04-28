using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddJobStartFormResources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JobStartFormResources",
                columns: table => new
                {
                    ResourceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FormId = table.Column<int>(type: "int", nullable: false),
                    WBSTaskId = table.Column<int>(type: "int", nullable: true),
                    TaskType = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Units = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BudgetedCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    JobStartFormFormId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobStartFormResources", x => x.ResourceId);
                    table.ForeignKey(
                        name: "FK_JobStartFormResources_JobStartForms_FormId",
                        column: x => x.FormId,
                        principalTable: "JobStartForms",
                        principalColumn: "FormId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobStartFormResources_JobStartForms_JobStartFormFormId",
                        column: x => x.JobStartFormFormId,
                        principalTable: "JobStartForms",
                        principalColumn: "FormId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormResources_FormId",
                table: "JobStartFormResources",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_JobStartFormResources_JobStartFormFormId",
                table: "JobStartFormResources",
                column: "JobStartFormFormId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JobStartFormResources");
        }
    }
}
