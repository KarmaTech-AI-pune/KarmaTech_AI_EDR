using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Services
{
    public class CurrentTenantService : ICurrentTenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly TenantDbContext _context;
        private int? _tenantId;
        private string? _connectionString;

        public int? TenantId 
        { 
            get => _tenantId ?? GetTenantIdFromContext();
            set => _tenantId = value;
        }
        
        public string? ConnectionString 
        { 
            get => _connectionString;
            set => _connectionString = value;
        }

        public CurrentTenantService(IHttpContextAccessor httpContextAccessor, TenantDbContext context)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        private int? GetTenantIdFromContext()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.Items.TryGetValue("TenantId", out var tenantId) == true)
            {
                return tenantId as int?;
            }
            return null;
        }

        public async Task<bool> SetTenant(int tenant)
        {
            var tenantInfo = await _context.Tenants.Where(x => x.Id == tenant).FirstOrDefaultAsync();
            var tenantDb = await _context.TenantDatabases.Where(x => x.TenantId == tenantInfo.Id).FirstOrDefaultAsync();
            
            if (tenantInfo != null && tenantDb != null)
            {
                _tenantId = tenant;
                _connectionString = tenantDb.ConnectionString;
                
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext != null)
                {
                    httpContext.Items["TenantId"] = tenant;
                }
                
                return true;
            }
            
            throw new Exception("Tenant invalid");
        }
    }
}
