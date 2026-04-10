using System.Threading.Tasks;
using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface ITenantService
    {
        int? TenantId { get; set; }
        Task<string> GetTenantDomain();
        Task<int?> GetTenantId(string domain);
        Task<bool> SetTenantContextAsync(string tenantDomain);
        Task<int?> GetCurrentTenantIdAsync();
        Task<string> GetCurrentTenantDomain();
        
        // JWT claim extraction methods
        int? GetTenantIdFromClaims();
        string GetTenantDomainFromClaims();
        string GetUserTypeFromClaims();
        string GetTenantRoleFromClaims();
        bool IsSuperAdminFromClaims();
        
        // Tenant validation and management
        Task<Tenant?> GetTenantByIdentifierAsync(string identifier);
        Task<Tenant> GetCurrentTenantAsync();
        Task<bool> ValidateTenantAccessAsync(string userId, int tenantId);
        Task<List<TenantUser>> GetTenantUsersByUserIdAsync(string userId);
    }
}

