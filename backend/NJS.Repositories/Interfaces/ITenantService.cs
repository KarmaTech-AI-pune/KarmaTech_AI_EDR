namespace NJS.Repositories.Interfaces
{
    public interface ITenantService
    {
        Task<string> GetTenantDomain();
        Task<int?> GetTenantId(string domain);
    }
}
