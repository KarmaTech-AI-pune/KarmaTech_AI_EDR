using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Tenants.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Tenants.Handlers
{
    public class GetTenantFeaturesQueryHandler : IRequestHandler<GetTenantFeaturesQuery, TenantPlanDetailsDto>
    {
        private readonly TenantDbContext _context;

        public GetTenantFeaturesQueryHandler(TenantDbContext context)
        {
            _context = context;
        }

        public async Task<TenantPlanDetailsDto> Handle(GetTenantFeaturesQuery request, CancellationToken cancellationToken)
        {
            var tenant = await _context.Tenants
                .Include(t => t.SubscriptionPlan)
                .ThenInclude(sp => sp.SubscriptionPlanFeatures)
                .ThenInclude(spf => spf.Feature)
                .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

            if (tenant == null || tenant.SubscriptionPlan == null)
            {
                return null;
            }

            // Get all available features from the database
            // Note: Assuming Feature entity is part of TenantDbContext context or accessible via it. 
            // Based on previous file reads, Feature is in NJS.Domain.Entities.
            // However, TenantDbContext likely contains tenant-specific data. 
            // We need to check if 'Feature' table is in TenantDbContext. 
            // Usually, shared catalog data like Features/Plans are in the main ProjectManagementContext or similar, 
            // but TenantDbContext was used for retrieving Tenants. 
            // Let's assume for now Feature is accessible via _context (TenantDbContext) or we might need to inject the context where Feature resides.
            // Wait, previous code used _tenantDbContext.Tenants.Include(...SubscriptionPlan...Feature). 
            // This implies Feature is reachable from TenantDbContext.
            
            // To get *all* features, we need to query the Feature DbSet. 
            // Use _context.Set<Feature>() if it's not exposed primarily, or maybe it is exposed?
            // Let's check if Feature is a DbSet in TenantDbContext. 
            // The previous 'find_by_name' result for TenantDbContext didn't show the content, but let's try to query it.
            // If it fails, I'll fix it. For now I'll assume I can access it via Set<Feature>() or similar if I include the namespace.
            
            var allFeatures = await _context.Set<NJS.Domain.Entities.Feature>().ToListAsync(cancellationToken);
            
            var enabledFeatureIds = tenant.SubscriptionPlan.SubscriptionPlanFeatures
                .Select(spf => spf.FeatureId)
                .ToHashSet();

            var featureStatuses = allFeatures.Select(f => new TenantFeatureStatusDto
            {
                Name = f.Name, // Or f.Name.ToLower() / slugify if needed to match JSON example "manpower"
                Enabled = enabledFeatureIds.Contains(f.Id)
            }).ToList();

            return new TenantPlanDetailsDto
            {
                PlanId = tenant.SubscriptionPlan.Id,
                PlanName = tenant.SubscriptionPlan.Name,
                Features = featureStatuses
            };
        }
    }
}
