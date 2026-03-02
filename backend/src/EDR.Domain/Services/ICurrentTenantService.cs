using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EDR.Domain.Entities;

namespace EDR.Domain.Services
{
    public interface ICurrentTenantService
    {
        string? ConnectionString { get; set; }
        int? TenantId { get; set; }
        public Task<bool> SetTenant(int tenant);
        Task<List<MigrationResult>> ApplyMigrationsToAllTenantsAsync();
    }
}

