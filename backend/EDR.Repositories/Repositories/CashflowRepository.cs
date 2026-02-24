using EDR.Domain.Entities;
using EDR.Domain.GenericRepository;
using EDR.Repositories.Interfaces;
using EDR.Domain.Database;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace EDR.Repositories.Repositories
{
    public class CashflowRepository : Repository<Cashflow>, ICashflowRepository
    {
        private readonly ProjectManagementContext _context;

        public CashflowRepository(ProjectManagementContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Cashflow> GetByIdAsync(int id)
        {
            return await _context.Cashflows.FindAsync(id);
        }

        public async Task<IEnumerable<Cashflow>> GetAllAsync(int projectId)
        {
            return await _context.Cashflows.Where(c => c.ProjectId == projectId).ToListAsync();
        }

        public async Task AddAsync(Cashflow cashflow)
        {
            await _context.Cashflows.AddAsync(cashflow);
        }

        public async Task UpdateAsync(Cashflow cashflow)
        {
            _context.Cashflows.Update(cashflow);
        }

        public async Task DeleteAsync(Cashflow cashflow)
        {
            _context.Cashflows.Remove(cashflow);
        }
    }
}

