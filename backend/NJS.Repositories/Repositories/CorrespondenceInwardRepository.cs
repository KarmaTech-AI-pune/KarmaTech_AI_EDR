using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
{
    public class CorrespondenceInwardRepository : ICorrespondenceInwardRepository
    {
        private readonly ProjectManagementContext _context;

        public CorrespondenceInwardRepository(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<CorrespondenceInward>> GetAllAsync()
        {
            return await _context.CorrespondenceInwards.ToListAsync();
        }

        public async Task<CorrespondenceInward> GetByIdAsync(int id)
        {
            return await _context.CorrespondenceInwards.FindAsync(id);
        }

        public async Task<IEnumerable<CorrespondenceInward>> GetByProjectIdAsync(int projectId)
        {
            return await _context.CorrespondenceInwards
                .Where(i => i.ProjectId == projectId)
                .OrderByDescending(i => i.LetterDate)
                .ToListAsync();
        }

        public async Task<int> AddAsync(CorrespondenceInward correspondenceInward)
        {
            if (correspondenceInward == null) throw new ArgumentNullException(nameof(correspondenceInward));

            correspondenceInward.CreatedAt = DateTime.UtcNow;

            _context.CorrespondenceInwards.Add(correspondenceInward);
            await _context.SaveChangesAsync();

            return correspondenceInward.Id;
        }

        public async Task UpdateAsync(CorrespondenceInward correspondenceInward)
        {
            if (correspondenceInward == null) throw new ArgumentNullException(nameof(correspondenceInward));

            correspondenceInward.UpdatedAt = DateTime.UtcNow;

            _context.Entry(correspondenceInward).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var correspondenceInward = await _context.CorrespondenceInwards.FindAsync(id);
            if (correspondenceInward != null)
            {
                _context.CorrespondenceInwards.Remove(correspondenceInward);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CorrespondenceInwards.AnyAsync(e => e.Id == id);
        }
    }
}
