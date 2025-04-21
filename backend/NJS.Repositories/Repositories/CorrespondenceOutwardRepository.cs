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
    public class CorrespondenceOutwardRepository : ICorrespondenceOutwardRepository
    {
        private readonly ProjectManagementContext _context;

        public CorrespondenceOutwardRepository(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<CorrespondenceOutward>> GetAllAsync()
        {
            return await _context.CorrespondenceOutwards.ToListAsync();
        }

        public async Task<CorrespondenceOutward> GetByIdAsync(int id)
        {
            return await _context.CorrespondenceOutwards.FindAsync(id);
        }

        public async Task<IEnumerable<CorrespondenceOutward>> GetByProjectIdAsync(int projectId)
        {
            return await _context.CorrespondenceOutwards
                .Where(i => i.ProjectId == projectId)
                .OrderByDescending(i => i.LetterDate)
                .ToListAsync();
        }

        public async Task<int> AddAsync(CorrespondenceOutward correspondenceOutward)
        {
            if (correspondenceOutward == null) throw new ArgumentNullException(nameof(correspondenceOutward));

            // Ensure CreatedAt is set to a non-null value
            correspondenceOutward.CreatedAt = DateTime.UtcNow;

            try
            {
                _context.CorrespondenceOutwards.Add(correspondenceOutward);
                await _context.SaveChangesAsync();
                return correspondenceOutward.Id;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding correspondence outward: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task UpdateAsync(CorrespondenceOutward correspondenceOutward)
        {
            if (correspondenceOutward == null) throw new ArgumentNullException(nameof(correspondenceOutward));

            correspondenceOutward.UpdatedAt = DateTime.UtcNow;

            _context.Entry(correspondenceOutward).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var correspondenceOutward = await _context.CorrespondenceOutwards.FindAsync(id);
            if (correspondenceOutward != null)
            {
                _context.CorrespondenceOutwards.Remove(correspondenceOutward);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CorrespondenceOutwards.AnyAsync(e => e.Id == id);
        }
    }
}
