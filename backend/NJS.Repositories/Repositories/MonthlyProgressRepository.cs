using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

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
                                 .Include(mp => mp.ManpowerEntries)
                                 .Include(mp => mp.ProgressDeliverables)
                                 .Include(mp => mp.ChangeOrders)
                                 .Include(mp => mp.ProgrammeSchedules)
                                 .Include(mp => mp.EarlyWarnings)
                                 .Include(mp => mp.LastMonthActions)
                                 .Include(mp => mp.CurrentMonthActions)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.OriginalBudget)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.CurrentBudgetInMIS)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.PercentCompleteOnCosts)
                                 .FirstOrDefaultAsync(mp => mp.Id == id);
        }



        public async Task<List<MonthlyProgress>> GetByProjectIdAsync(int projectId)
        {
            return await _context.MonthlyProgresses
                                 .Where(mp => mp.ProjectId == projectId)
                                 .Include(mp => mp.FinancialDetails)
                                 .Include(mp => mp.ContractAndCost)
                                 .Include(mp => mp.CTCEAC)
                                 .Include(mp => mp.Schedule)
                                 .Include(mp => mp.ManpowerEntries)
                                 .Include(mp => mp.ProgressDeliverables)
                                 .Include(mp => mp.ChangeOrders)
                                 .Include(mp => mp.ProgrammeSchedules)
                                 .Include(mp => mp.EarlyWarnings)
                                 .Include(mp => mp.LastMonthActions)
                                 .Include(mp => mp.CurrentMonthActions)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.OriginalBudget)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.CurrentBudgetInMIS)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.PercentCompleteOnCosts)
                                 .ToListAsync();
        }

        public async Task<MonthlyProgress> GetByProjectYearMonthAsync(int projectId, int year, int month)
        {
            return await _context.MonthlyProgresses
                                 .Where(mp => mp.ProjectId == projectId && mp.Year == year && mp.Month == month)
                                 .Include(mp => mp.FinancialDetails)
                                 .Include(mp => mp.ContractAndCost)
                                 .Include(mp => mp.CTCEAC)
                                 .Include(mp => mp.Schedule)
                                 .Include(mp => mp.ManpowerEntries)
                                 .Include(mp => mp.ProgressDeliverables)
                                 .Include(mp => mp.ChangeOrders)
                                 .Include(mp => mp.ProgrammeSchedules)
                                 .Include(mp => mp.EarlyWarnings)
                                 .Include(mp => mp.LastMonthActions)
                                 .Include(mp => mp.CurrentMonthActions)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.OriginalBudget)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.CurrentBudgetInMIS)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.PercentCompleteOnCosts)
                                 .FirstOrDefaultAsync();
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
                                 .Include(mp => mp.ManpowerEntries)
                                 .Include(mp => mp.ProgressDeliverables)
                                 .Include(mp => mp.ChangeOrders)
                                 .Include(mp => mp.ProgrammeSchedules)
                                 .Include(mp => mp.EarlyWarnings)
                                 .Include(mp => mp.LastMonthActions)
                                 .Include(mp => mp.CurrentMonthActions)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.OriginalBudget)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.CurrentBudgetInMIS)
                                 .Include(mp => mp.BudgetTable)
                                     .ThenInclude(bt => bt.PercentCompleteOnCosts)
                                 .ToListAsync();
        }

        public async Task UpdateManpowerPlanningAsync(ManpowerPlanning manpowerPlanning)
        {
            _context.ManpowerPlannings.Update(manpowerPlanning);
            await _context.SaveChangesAsync();
        }
    }
}
