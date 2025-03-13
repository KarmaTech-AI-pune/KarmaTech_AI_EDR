using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Application.Services
{
    public class ScoringDescriptionService : IScoringDescriptionService
    {
        private readonly IScoringDescriptionRepository _scoringDescriptionRepository;

        public ScoringDescriptionService(IScoringDescriptionRepository scoringDescriptionRepository)
        {
            _scoringDescriptionRepository = scoringDescriptionRepository;
        }
      

        public async Task<ScoringDescriptionDto> GetScoringDescriptionsAsync()
        {
            var scoringDescriptions = await _scoringDescriptionRepository.GetAllScoringDescriptionsWithSummariesAsync();
            
            var result = new ScoringDescriptionDto
            {
                descriptions = scoringDescriptions.ToDictionary(
                    sd => sd.Label.ToLower(), // Convert to lowercase to match frontend keys
                    sd => new ScoringLevelDescriptionDto
                    {
                        High = sd.ScoringDescriptionSummarry.FirstOrDefault()?.High ?? string.Empty,
                        Medium = sd.ScoringDescriptionSummarry.FirstOrDefault()?.Medium ?? string.Empty,
                        Low = sd.ScoringDescriptionSummarry.FirstOrDefault()?.Low ?? string.Empty
                    }
                )
            };

            return result;
        }
    }
}
