using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;


namespace NJS.Repositories.Repositories
{
    public class GoNoGoRepository : IGoNoGoRepository
    {
        private readonly ProjectManagementContext _context;

        public GoNoGoRepository(ProjectManagementContext context)
        {
            _context = context;
        }
       

        public async Task<GoNoGoDecisionOpportunity> GetByIdAsync(int opportunityId)
        {
            var opportunity = await _context.GoNoGoDecisionOpportunities.FirstAsync(o => o.OpportunityId == opportunityId);
            //Include(x => x.ScoreRanges).Include(x => x.ScoringDescriptions).Include(x => x.ScoringCriterias).

            if (opportunity == null)
            {
                throw new KeyNotFoundException($"GoNoGowith ID {opportunityId} not found.");
            }

            return opportunity;
        }
    }
}
