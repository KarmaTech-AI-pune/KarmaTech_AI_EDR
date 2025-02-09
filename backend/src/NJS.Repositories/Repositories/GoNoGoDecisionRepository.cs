using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class GoNoGoDecisionRepository : IGoNoGoDecisionRepository
    {
        private readonly ProjectManagementContext _context;

        public GoNoGoDecisionRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public IEnumerable<GoNoGoDecision> GetAll()
        {
            return _context.GoNoGoDecisions.ToList();
        }

        public GoNoGoDecision GetById(int id)
        {
            return _context.GoNoGoDecisions.Find(id);
        }

        public GoNoGoDecision GetByProjectId(int projectId)
        {
            return _context.GoNoGoDecisions.FirstOrDefault(d => d.ProjectId == projectId);
        }

        public void Add(GoNoGoDecision decision)
        {
            _context.GoNoGoDecisions.Add(decision);
            _context.SaveChanges();
        }

        public void Update(GoNoGoDecision decision)
        {
            _context.GoNoGoDecisions.Update(decision);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var decision = _context.GoNoGoDecisions.Find(id);
            if (decision != null)
            {
                _context.GoNoGoDecisions.Remove(decision);
                _context.SaveChanges();
            }
        }

        // New methods for GoNoGoDecisionHeader and Transaction
        public async Task<GoNoGoDecisionHeader> GetHeaderById(int id)
        {
            return await _context.GoNoGoDecisionHeaders
                .Include(h => h.OpportunityTracking)
                .FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task<IEnumerable<GoNoGoDecisionTransaction>> GetTransactionsByHeaderId(int headerId)
        {
            return await _context.GoNoGoDecisionTransactions
                .Include(t => t.ScoringCriterias)
                .Where(t => t.GoNoGoDecisionHeaderId == headerId)
                .ToListAsync();
        }

        public async Task<GoNoGoDecisionHeader> AddHeader(GoNoGoDecisionHeader header)
        {
            _context.GoNoGoDecisionHeaders.Add(header);
            await _context.SaveChangesAsync();
            return header;
        }

        public async Task<bool> UpdateHeader(GoNoGoDecisionHeader header)
        {
            _context.GoNoGoDecisionHeaders.Update(header);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteHeader(int id)
        {
            var header = await _context.GoNoGoDecisionHeaders.FindAsync(id);
            if (header == null)
                return false;

            _context.GoNoGoDecisionHeaders.Remove(header);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<GoNoGoDecisionTransaction> AddTransaction(GoNoGoDecisionTransaction transaction)
        {
            _context.GoNoGoDecisionTransactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<bool> UpdateTransaction(GoNoGoDecisionTransaction transaction)
        {
            _context.GoNoGoDecisionTransactions.Update(transaction);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteTransaction(int id)
        {
            var transaction = await _context.GoNoGoDecisionTransactions.FindAsync(id);
            if (transaction == null)
                return false;

            _context.GoNoGoDecisionTransactions.Remove(transaction);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
    }
}
