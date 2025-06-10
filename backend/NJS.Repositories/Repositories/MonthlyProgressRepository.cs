using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
{
    public class MonthlyProgressRepository : IMonthlyProgressRepository
    {
        private readonly ProjectManagementContext _context;

        public MonthlyProgressRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<MonthlyProgress> GetByIdAsync(int id)
        {
            return await _context.MonthlyProgresses
                                 .Include(mp => mp.FinancialDetails)
                                 .Include(mp => mp.ContractAndCost)
                                 .Include(mp => mp.CTCEAC)
                                 .Include(mp => mp.Schedule)
                                 .Include(mp => mp.ManpowerPlanning)
                                 .Include(mp => mp.ProgressDeliverable)
                                 .Include(mp => mp.ChangeOrder)
                                 .Include(mp => mp.LastMonthAction)
                                 .Include(mp => mp.CurrentMonthAction)
                                 .FirstOrDefaultAsync(mp => mp.Id == id);
        }

        public async Task AddAsync(MonthlyProgress entity)
        {
            await _context.MonthlyProgresses.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(MonthlyProgress entity)
        {
            _context.MonthlyProgresses.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(MonthlyProgress entity)
        {
            _context.MonthlyProgresses.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<List<MonthlyProgress>> GetAllAsync()
        {
            return await _context.MonthlyProgresses
                                 .Include(mp => mp.FinancialDetails)
                                 .Include(mp => mp.ContractAndCost)
                                 .Include(mp => mp.CTCEAC)
                                 .Include(mp => mp.Schedule)
                                 .Include(mp => mp.ManpowerPlanning)
                                 .Include(mp => mp.ProgressDeliverable)
                                 .Include(mp => mp.ChangeOrder)
                                 .Include(mp => mp.LastMonthAction)
                                 .Include(mp => mp.CurrentMonthAction)
                                 .ToListAsync();
        }
    }
}
