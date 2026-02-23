using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
{
    public class PaymentMilestoneRepository : IPaymentMilestoneRepository
    {
        private readonly ProjectManagementContext _context;
        
        public PaymentMilestoneRepository(ProjectManagementContext context)
        {
            _context = context;
        }
        
        public async Task<PaymentMilestone> AddAsync(PaymentMilestone entity)
        {
            _context.PaymentMilestones.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
        
        public async Task<List<PaymentMilestone>> GetByProjectIdAsync(int projectId)
        {
            return await _context.PaymentMilestones
                .Where(pm => pm.ProjectId == projectId)
                .OrderBy(pm => pm.DueDate)
                .ToListAsync();
        }
        
        public async Task<PaymentMilestone> GetByIdAsync(int id)
        {
            return await _context.PaymentMilestones
                .FirstOrDefaultAsync(pm => pm.Id == id);
        }
        
        public async Task UpdateAsync(PaymentMilestone entity)
        {
            _context.PaymentMilestones.Update(entity);
            await _context.SaveChangesAsync();
        }
        
        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _context.PaymentMilestones.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
