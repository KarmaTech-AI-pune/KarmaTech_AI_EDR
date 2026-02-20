namespace EDR.Application.Services.IContract
{
    public interface IDNSManagementService
    {
        Task<bool> CreateSubdomainAsync(string subdomain);
        Task<bool> DeleteSubdomainAsync(string subdomain);
        Task<bool> UpdateSubdomainAsync(string subdomain, string newTarget);
        Task<bool> ValidateSubdomainAsync(string subdomain);
    }
} 
