using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Domain.Database;

namespace EDR.Repositories.Repositories
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

        public async Task<Feature> GetFeatureByIdAsync(int id)
        {
            try
            {
                var feature = await dbContext.Features.FindAsync(id);
                // Detach the entity to avoid tracking issues when updating later if needed, 
                // though for simple Get usually not strictly required, but safer for update flows if we attach incorrectly later.
                // However, FindAsync tracks it. 
                // For Update, EF tracks changes. If we get it then update properties, we just need SaveChanges.
                // If we get DTO and map to new entity, we need Update().
                
                return feature;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error getting feature by id: {id}");
                return null;
            }
        }

        public async Task UpdateFeatureAsync(Feature feature)
        {
            try
            {
                dbContext.Features.Update(feature);
                await dbContext.SaveChangesAsync();
                logger.LogInformation($"Feature updated successfully: {feature.Id}");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error updating feature: {feature.Id}");
            }
        }

        public async Task DeleteFeatureAsync(int id)
        {
            try
            {
                var feature = await dbContext.Features.FindAsync(id);
                if (feature != null)
                {
                    dbContext.Features.Remove(feature);
                    await dbContext.SaveChangesAsync();
                    logger.LogInformation($"Feature deleted successfully: {id}");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Error deleting feature: {id}");
            }
        }
    }
}

