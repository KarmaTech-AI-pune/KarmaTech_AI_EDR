namespace EDR.Application.Services.IContract
{
    public interface IDatabaseManagementService
    {
        Task<(bool isDbCreated, string dbName, string connectionString)> CreateTenantDatabaseAsync(string subDomain,bool isIsolated); 
            //CreateTenantDatabaseAsync(out string databaseName, out string connectionString, string subDomain=null!);
        Task<bool> DeleteTenantDatabaseAsync(string databaseName);
        Task<bool> DatabaseExistsAsync(string databaseName);
        Task<bool> BackupTenantDatabaseAsync(string databaseName, string backupPath);
        Task<bool> RestoreTenantDatabaseAsync(string databaseName, string backupPath);
    }
} 
