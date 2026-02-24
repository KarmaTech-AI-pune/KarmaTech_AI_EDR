using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IScoringDescriptionRepository
    {
        Task<IEnumerable<ScoringDescriptions>> GetAllScoringDescriptionsWithSummariesAsync();
        Task<IEnumerable<ScoreRange>> GetAllScoreRangeAsync();
    }
}

