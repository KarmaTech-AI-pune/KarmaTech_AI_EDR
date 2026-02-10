using NJS.Domain.Entities;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IFeatureRepository
    {
        Task AddFeatureAsync(Feature feature);
        Task<System.Collections.Generic.List<Feature>> GetAllFeaturesAsync();
        Task<Feature> GetFeatureByIdAsync(int id);
        Task UpdateFeatureAsync(Feature feature);
        Task DeleteFeatureAsync(int id);
    }
}
