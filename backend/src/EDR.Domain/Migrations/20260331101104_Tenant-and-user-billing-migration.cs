using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EDR.Domain.Migrations
{
    /// <inheritdoc />
    public partial class Tenantanduserbillingmigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobStartFormHeaders_Projects_ProjectId",
                table: "JobStartFormHeaders");

            migrationBuilder.RenameColumn(
                name: "StripeSubscriptionId",
                table: "Tenants",
                newName: "RazorpaySubscriptionId");

            migrationBuilder.RenameColumn(
                name: "StripeCustomerId",
                table: "Tenants",
                newName: "RazorpayCustomerId");

            migrationBuilder.CreateTable(
                name: "TenantInvoices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    InvoiceId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    PaidDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PaymentId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReceiptUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantInvoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantInvoices_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantInvoices_TenantId",
                table: "TenantInvoices",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormHeaders_Projects_ProjectId",
                table: "JobStartFormHeaders",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobStartFormHeaders_Projects_ProjectId",
                table: "JobStartFormHeaders");

            migrationBuilder.DropTable(
                name: "TenantInvoices");

            migrationBuilder.RenameColumn(
                name: "RazorpaySubscriptionId",
                table: "Tenants",
                newName: "StripeSubscriptionId");

            migrationBuilder.RenameColumn(
                name: "RazorpayCustomerId",
                table: "Tenants",
                newName: "StripeCustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobStartFormHeaders_Projects_ProjectId",
                table: "JobStartFormHeaders",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id");
        }
    }
}
