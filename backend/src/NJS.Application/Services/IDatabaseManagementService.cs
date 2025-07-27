namespace NJS.Application.Services.IContract
{
    public interface IDatabaseManagementService
    {
        Task<bool> CreateTenantDatabaseAsync(string databaseName, string connectionString);
        Task<bool> DeleteTenantDatabaseAsync(string databaseName);
        Task<bool> DatabaseExistsAsync(string databaseName);
        Task<bool> BackupTenantDatabaseAsync(string databaseName, string backupPath);
        Task<bool> RestoreTenantDatabaseAsync(string databaseName, string backupPath);
    }
} 