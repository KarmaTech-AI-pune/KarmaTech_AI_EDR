namespace NJS.Application.Services.IContract
{
    public interface ITenantMigrationService
    {
        /// <summary>
        /// Executes SQL migration scripts for a tenant database
        /// </summary>
        /// <param name="connectionString">Connection string to the tenant database</param>
        /// <param name="tenantId">The tenant ID</param>
        /// <param name="sourceDatabaseName">Optional source database name for user migration</param>
        /// <returns>True if all migrations executed successfully, false otherwise</returns>
        Task<bool> ExecuteTenantMigrationsAsync(string connectionString, int tenantId, string? sourceDatabaseName = null);

        /// <summary>
        /// Executes SQL migration scripts for migrating a user to a tenant database
        /// </summary>
        /// <param name="connectionString">Connection string to the tenant database</param>
        /// <param name="tenantId">The tenant ID</param>
        /// <param name="userEmail">The user's email address</param>
        /// <param name="roleName">The role name to assign (e.g., 'TenantAdmin')</param>
        /// <param name="permissionName">The permission name (e.g., 'Tenant_ADMIN')</param>
        /// <param name="sourceDatabaseName">Optional source database name for user migration</param>
        /// <returns>True if all migrations executed successfully, false otherwise</returns>
        Task<bool> ExecuteTenantUserMigrationsAsync(string connectionString, int tenantId, string userEmail, string roleName, string permissionName, string? sourceDatabaseName = null);
    }
}

