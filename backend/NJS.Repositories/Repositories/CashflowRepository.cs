using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Repositories.Interfaces;
using NJS.Domain.Database;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace NJS.Repositories.Repositories
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
    }
}
