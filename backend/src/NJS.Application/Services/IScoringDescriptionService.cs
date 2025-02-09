using NJS.Application.Dtos;

namespace NJS.Application.Services
{
    public interface IScoringDescriptionService
    {
        Task<ScoringDescriptionDto> GetScoringDescriptionsAsync();
    }
}
