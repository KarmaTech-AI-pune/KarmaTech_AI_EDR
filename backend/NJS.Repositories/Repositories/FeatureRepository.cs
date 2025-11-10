using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Domain.Database;

namespace NJS.Repositories.Repositories
{
    public class FeatureRepository(ProjectManagementContext dbContext, ILogger<FeatureRepository> logger)
        : IFeatureRepository
    {
        public async Task AddFeatureAsync(Feature feature)
        {
            try
            {
                dbContext.Features.Add(feature);
                await dbContext.SaveChangesAsync();
                logger.LogInformation($"Feature added successfully: {feature.Name}");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error adding feature: {feature.Name}");
            }
        }

        public async Task<List<Feature>> GetAllFeaturesAsync()
        {
            try
            {
                return await dbContext.Features.ToListAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error getting all features");
                return new List<Feature>();
            }
        }
    }
}
