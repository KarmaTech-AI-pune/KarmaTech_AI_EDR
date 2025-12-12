using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NJS.Domain.Migrations
{
    /// <inheritdoc />
    public partial class kirotodev : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GoNoGoDecisionTransactions_GoNoGoDecisionHeaders_GoNoGoDecisionHeaderId",
                table: "GoNoGoDecisionTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectBudgetChangeHistories_AspNetUsers_ChangedBy",
                table: "ProjectBudgetChangeHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTasks_AspNetRoles_ResourceRoleId",
                table: "UserWBSTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTasks_AspNetUsers_UserId",
                table: "UserWBSTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTaskVersionHistories_AspNetRoles_ResourceRoleId",
                table: "UserWBSTaskVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTaskVersionHistories_AspNetUsers_UserId",
                table: "UserWBSTaskVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_ApprovedBy",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_CreatedBy",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionWorkflowHistories_AspNetUsers_ActionBy",
                table: "WBSVersionWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionWorkflowHistories_AspNetUsers_AssignedToId",
                table: "WBSVersionWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionWorkflowHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionWorkflowHistories");

            migrationBuilder.DropIndex(
                name: "IX_ProjectBudgetChangeHistory_ChangedDate",
                table: "ProjectBudgetChangeHistories");

            migrationBuilder.DropIndex(
                name: "IX_ProjectBudgetChangeHistory_FieldName",
                table: "ProjectBudgetChangeHistories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ProjectBudgetChangeHistory_FieldName",
                table: "ProjectBudgetChangeHistories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ProjectBudgetChangeHistory_ValueChange",
                table: "ProjectBudgetChangeHistories");

            migrationBuilder.RenameIndex(
                name: "IX_ProjectBudgetChangeHistory_ProjectId",
                table: "ProjectBudgetChangeHistories",
                newName: "IX_ProjectBudgetChangeHistories_ProjectId");

            migrationBuilder.AlterColumn<string>(
                name: "Comments",
                table: "WBSVersionWorkflowHistories",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Action",
                table: "WBSVersionWorkflowHistories",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                table: "UserWBSTaskVersionHistories",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "UserWBSTaskVersionHistories",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedBy",
                table: "ProjectBudgetChangeHistories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldMaxLength: 450,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "ProjectBudgetChangeHistories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldMaxLength: 450,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ServiceTaxPercentage",
                table: "JobStartForms",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "ModifiedBy",
                table: "BidVersionHistories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "BidPreparations",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionWorkflowHistories_ActionDate",
                table: "WBSVersionWorkflowHistories",
                column: "ActionDate");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_CreatedAt",
                table: "WBSVersionHistories",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_IsActive",
                table: "WBSVersionHistories",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_WBSVersionHistories_IsLatest",
                table: "WBSVersionHistories",
                column: "IsLatest");

            migrationBuilder.CreateIndex(
                name: "IX_BidPreparations_UserId",
                table: "BidPreparations",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_GoNoGoDecisionTransactions_GoNoGoDecisionHeaders_GoNoGoDecisionHeaderId",
                table: "GoNoGoDecisionTransactions",
                column: "GoNoGoDecisionHeaderId",
                principalTable: "GoNoGoDecisionHeaders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectBudgetChangeHistories_AspNetUsers_ChangedBy",
                table: "ProjectBudgetChangeHistories",
                column: "ChangedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTasks_AspNetRoles_ResourceRoleId",
                table: "UserWBSTasks",
                column: "ResourceRoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTasks_AspNetUsers_UserId",
                table: "UserWBSTasks",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTaskVersionHistories_AspNetRoles_ResourceRoleId",
                table: "UserWBSTaskVersionHistories",
                column: "ResourceRoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTaskVersionHistories_AspNetUsers_UserId",
                table: "UserWBSTaskVersionHistories",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_ApprovedBy",
                table: "WBSVersionHistories",
                column: "ApprovedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_CreatedBy",
                table: "WBSVersionHistories",
                column: "CreatedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionHistories",
                column: "StatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionWorkflowHistories_AspNetUsers_ActionBy",
                table: "WBSVersionWorkflowHistories",
                column: "ActionBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionWorkflowHistories_AspNetUsers_AssignedToId",
                table: "WBSVersionWorkflowHistories",
                column: "AssignedToId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionWorkflowHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionWorkflowHistories",
                column: "StatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GoNoGoDecisionTransactions_GoNoGoDecisionHeaders_GoNoGoDecisionHeaderId",
                table: "GoNoGoDecisionTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectBudgetChangeHistories_AspNetUsers_ChangedBy",
                table: "ProjectBudgetChangeHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTasks_AspNetRoles_ResourceRoleId",
                table: "UserWBSTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTasks_AspNetUsers_UserId",
                table: "UserWBSTasks");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTaskVersionHistories_AspNetRoles_ResourceRoleId",
                table: "UserWBSTaskVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWBSTaskVersionHistories_AspNetUsers_UserId",
                table: "UserWBSTaskVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_ApprovedBy",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_CreatedBy",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionWorkflowHistories_AspNetUsers_ActionBy",
                table: "WBSVersionWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionWorkflowHistories_AspNetUsers_AssignedToId",
                table: "WBSVersionWorkflowHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WBSVersionWorkflowHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionWorkflowHistories");

            migrationBuilder.DropIndex(
                name: "IX_WBSVersionWorkflowHistories_ActionDate",
                table: "WBSVersionWorkflowHistories");

            migrationBuilder.DropIndex(
                name: "IX_WBSVersionHistories_CreatedAt",
                table: "WBSVersionHistories");

            migrationBuilder.DropIndex(
                name: "IX_WBSVersionHistories_IsActive",
                table: "WBSVersionHistories");

            migrationBuilder.DropIndex(
                name: "IX_WBSVersionHistories_IsLatest",
                table: "WBSVersionHistories");

            migrationBuilder.DropIndex(
                name: "IX_BidPreparations_UserId",
                table: "BidPreparations");

            migrationBuilder.RenameIndex(
                name: "IX_ProjectBudgetChangeHistories_ProjectId",
                table: "ProjectBudgetChangeHistories",
                newName: "IX_ProjectBudgetChangeHistory_ProjectId");

            migrationBuilder.AlterColumn<string>(
                name: "Comments",
                table: "WBSVersionWorkflowHistories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Action",
                table: "WBSVersionWorkflowHistories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                table: "UserWBSTaskVersionHistories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "UserWBSTaskVersionHistories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedBy",
                table: "ProjectBudgetChangeHistories",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "ProjectBudgetChangeHistories",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ServiceTaxPercentage",
                table: "JobStartForms",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldPrecision: 5,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "ModifiedBy",
                table: "BidVersionHistories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "BidPreparations",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectBudgetChangeHistory_ChangedDate",
                table: "ProjectBudgetChangeHistories",
                column: "ChangedDate");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectBudgetChangeHistory_FieldName",
                table: "ProjectBudgetChangeHistories",
                column: "FieldName");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ProjectBudgetChangeHistory_FieldName",
                table: "ProjectBudgetChangeHistories",
                sql: "[FieldName] IN ('EstimatedProjectCost', 'EstimatedProjectFee')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ProjectBudgetChangeHistory_ValueChange",
                table: "ProjectBudgetChangeHistories",
                sql: "[OldValue] != [NewValue]");

            migrationBuilder.AddForeignKey(
                name: "FK_GoNoGoDecisionTransactions_GoNoGoDecisionHeaders_GoNoGoDecisionHeaderId",
                table: "GoNoGoDecisionTransactions",
                column: "GoNoGoDecisionHeaderId",
                principalTable: "GoNoGoDecisionHeaders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectBudgetChangeHistories_AspNetUsers_ChangedBy",
                table: "ProjectBudgetChangeHistories",
                column: "ChangedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTasks_AspNetRoles_ResourceRoleId",
                table: "UserWBSTasks",
                column: "ResourceRoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTasks_AspNetUsers_UserId",
                table: "UserWBSTasks",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTaskVersionHistories_AspNetRoles_ResourceRoleId",
                table: "UserWBSTaskVersionHistories",
                column: "ResourceRoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserWBSTaskVersionHistories_AspNetUsers_UserId",
                table: "UserWBSTaskVersionHistories",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_ApprovedBy",
                table: "WBSVersionHistories",
                column: "ApprovedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionHistories_AspNetUsers_CreatedBy",
                table: "WBSVersionHistories",
                column: "CreatedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionHistories",
                column: "StatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionWorkflowHistories_AspNetUsers_ActionBy",
                table: "WBSVersionWorkflowHistories",
                column: "ActionBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionWorkflowHistories_AspNetUsers_AssignedToId",
                table: "WBSVersionWorkflowHistories",
                column: "AssignedToId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WBSVersionWorkflowHistories_PMWorkflowStatuses_StatusId",
                table: "WBSVersionWorkflowHistories",
                column: "StatusId",
                principalTable: "PMWorkflowStatuses",
                principalColumn: "Id");
        }
    }
}
