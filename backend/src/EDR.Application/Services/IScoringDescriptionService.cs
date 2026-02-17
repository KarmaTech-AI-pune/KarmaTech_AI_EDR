using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.Application.Services
{
    public interface IScoringDescriptionService
    {
        Task<ScoringDescriptionDto> GetScoringDescriptionsAsync();       
    }
}

