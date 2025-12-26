using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddReleaseNotesAndChangeItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReleaseNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReleaseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Environment = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CommitSha = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Branch = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReleaseNotes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChangeItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ReleaseNotesId = table.Column<int>(type: "int", nullable: false),
                    ChangeType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CommitSha = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    JiraTicket = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Impact = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Author = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeItems_ReleaseNotes_ReleaseNotesId",
                        column: x => x.ReleaseNotesId,
                        principalTable: "ReleaseNotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeItems_ChangeType",
                table: "ChangeItems",
                column: "ChangeType");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeItems_ReleaseNotesId",
                table: "ChangeItems",
                column: "ReleaseNotesId");

            migrationBuilder.CreateIndex(
                name: "IX_ReleaseNotes_Environment",
                table: "ReleaseNotes",
                column: "Environment");

            migrationBuilder.CreateIndex(
                name: "IX_ReleaseNotes_ReleaseDate",
                table: "ReleaseNotes",
                column: "ReleaseDate");

            migrationBuilder.CreateIndex(
                name: "IX_ReleaseNotes_Version",
                table: "ReleaseNotes",
                column: "Version",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChangeItems");

            migrationBuilder.DropTable(
                name: "ReleaseNotes");
        }
    }
}
