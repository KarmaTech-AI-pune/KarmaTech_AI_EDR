using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EDR.Domain.Migrations
{
    /// <inheritdoc />
    public partial class ProductBacklogmigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SprintDailyProgresses");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SprintDailyProgresses",
                columns: table => new
                {
                    DailyProgressId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SprintPlanId = table.Column<int>(type: "integer", nullable: false),
                    AddedStoryPoints = table.Column<int>(type: "integer", nullable: false),
                    CompletedStoryPoints = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IdealRemainingPoints = table.Column<int>(type: "integer", nullable: false),
                    PlannedStoryPoints = table.Column<int>(type: "integer", nullable: false),
                    RemainingStoryPoints = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintDailyProgresses", x => x.DailyProgressId);
                    table.ForeignKey(
                        name: "FK_SprintDailyProgresses_SprintPlans_SprintPlanId",
                        column: x => x.SprintPlanId,
                        principalTable: "SprintPlans",
                        principalColumn: "SprintId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SprintDailyProgresses_SprintPlanId",
                table: "SprintDailyProgresses",
                column: "SprintPlanId");
        }
    }
}
