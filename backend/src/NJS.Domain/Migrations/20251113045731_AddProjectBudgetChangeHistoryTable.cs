using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectBudgetChangeHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectBudgetChangeHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OldValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NewValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Variance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PercentageVariance = table.Column<decimal>(type: "decimal(10,4)", precision: 10, scale: 4, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ChangedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ChangedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectBudgetChangeHistories", x => x.Id);
                    table.CheckConstraint("CK_ProjectBudgetChangeHistory_FieldName", "[FieldName] IN ('EstimatedProjectCost', 'EstimatedProjectFee')");
                    table.CheckConstraint("CK_ProjectBudgetChangeHistory_ValueChange", "[OldValue] != [NewValue]");
                    table.ForeignKey(
                        name: "FK_ProjectBudgetChangeHistories_AspNetUsers_ChangedBy",
                        column: x => x.ChangedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectBudgetChangeHistories_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectBudgetChangeHistories_ChangedBy",
                table: "ProjectBudgetChangeHistories",
                column: "ChangedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectBudgetChangeHistory_ChangedDate",
                table: "ProjectBudgetChangeHistories",
                column: "ChangedDate");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectBudgetChangeHistory_FieldName",
                table: "ProjectBudgetChangeHistories",
                column: "FieldName");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectBudgetChangeHistory_ProjectId",
                table: "ProjectBudgetChangeHistories",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectBudgetChangeHistories");
        }
    }
}
