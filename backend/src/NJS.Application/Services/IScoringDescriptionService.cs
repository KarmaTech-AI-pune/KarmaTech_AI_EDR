using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.Services
{
    public interface IScoringDescriptionService
    {
        Task<ScoringDescriptionDto> GetScoringDescriptionsAsync();       
    }
}
