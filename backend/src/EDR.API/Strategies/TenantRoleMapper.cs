using EDR.Domain.Entities;

namespace EDR.API.Strategies;

public static class TenantRoleMapper
{
    public static string MapRoleName(TenantUserRole role)
    {
        return role switch
        {
            _ => "TenantAdmin"
        };
    }

    /// <summary>
    /// Maps TenantUserRole enum to permission name
    /// </summary>
    public static string MapPermissionName(TenantUserRole role)
    {
        return role switch
        {
            _ => "Tenant_ADMIN"
        };
    }
}
