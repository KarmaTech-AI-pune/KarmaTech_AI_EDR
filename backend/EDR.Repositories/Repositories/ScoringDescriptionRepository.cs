using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
{
    public class ScoringDescriptionRepository : IScoringDescriptionRepository
    {
        private readonly ProjectManagementContext _context;

        public ScoringDescriptionRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ScoreRange>> GetAllScoreRangeAsync()
        {
            return await _context.ScoreRange.ToListAsync();
        }

        public async Task<IEnumerable<ScoringDescriptions>> GetAllScoringDescriptionsWithSummariesAsync()
        {
            return await _context.ScoringDescription
                .Include(sd => sd.ScoringDescriptionSummarry)
                .ToListAsync();
        }
    }
}
