using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IScoringDescriptionRepository
    {
        Task<IEnumerable<ScoringDescriptions>> GetAllScoringDescriptionsWithSummariesAsync();
        Task<IEnumerable<ScoreRange>> GetAllScoreRangeAsync();
    }
}
