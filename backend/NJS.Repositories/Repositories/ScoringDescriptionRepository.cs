using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class ScoringDescriptionRepository : IScoringDescriptionRepository
    {
        private readonly ProjectManagementContext _context;

        public ScoringDescriptionRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ScoringDescriptions>> GetAllScoringDescriptionsWithSummariesAsync()
        {
            return await _context.ScoringDescription
                .Include(sd => sd.ScoringDescriptionSummarry)
                .ToListAsync();
        }
    }
}
