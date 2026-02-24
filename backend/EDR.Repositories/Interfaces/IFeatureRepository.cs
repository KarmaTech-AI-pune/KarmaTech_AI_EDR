using EDR.Domain.Entities;
using System.Threading.Tasks;

namespace EDR.Repositories.Interfaces
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

