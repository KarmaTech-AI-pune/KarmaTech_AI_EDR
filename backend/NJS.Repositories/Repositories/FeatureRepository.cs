using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using NJS.Domain.Database;

namespace NJS.Repositories.Repositories
{
    public class FeatureRepository : IFeatureRepository
    {
        private readonly ProjectManagementContext _dbContext;
        private readonly ILogger<FeatureRepository> _logger;

        public FeatureRepository(ProjectManagementContext dbContext, ILogger<FeatureRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task AddFeatureAsync(Feature feature)
        {
            try
            {
                _dbContext.Features.Add(feature);
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation($"Feature added successfully: {feature.Name}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding feature: {feature.Name}");
            }
        }

        public async Task<List<Feature>> GetAllFeaturesAsync()
        {
            try
            {
                return await _dbContext.Features.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting all features");
                return new List<Feature>();
            }
        }
    }
}
