using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EDR.Repositories.Repositories
{
    public class CorrespondenceOutwardRepository : ICorrespondenceOutwardRepository
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<CorrespondenceOutwardRepository> _logger;

        public CorrespondenceOutwardRepository(ProjectManagementContext context, ILogger<CorrespondenceOutwardRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
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

            try
            {
                correspondenceOutward.CreatedAt = DateTime.UtcNow;
                _context.CorrespondenceOutwards.Add(correspondenceOutward);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Added correspondence outward with ID: {correspondenceOutward.Id}");

                return correspondenceOutward.Id;
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error adding correspondence outward: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogInformation($"Inner exception: {ex.InnerException.Message}");
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
            try
            {
                var correspondenceOutward = await _context.CorrespondenceOutwards.FindAsync(id);
                if (correspondenceOutward != null)
                {
                    _context.CorrespondenceOutwards.Remove(correspondenceOutward);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Deleted correspondence outward with ID: {id}");
                }
                else
                {
                    _logger.LogInformation($"No correspondence outward found with ID: {id}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error deleting correspondence outward: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogInformation($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CorrespondenceOutwards.AnyAsync(e => e.Id == id);
        }

        public async Task<int> GetNextIdAsync()
        {
            // If there are no records, the next ID will be 1
            if (!await _context.CorrespondenceOutwards.AnyAsync())
            {
                return 1;
            }

            // Otherwise, get the maximum ID and add 1
            var maxId = await _context.CorrespondenceOutwards.MaxAsync(i => i.Id);
            return maxId + 1;
        }

        public async Task ResetIdentitySeedAsync()
        {
            // Check if there are any records left
            if (!await _context.CorrespondenceOutwards.AnyAsync())
            {
                // Reset the identity seed to 1
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('CorrespondenceOutwards', RESEED, 0)");
            }
            else
            {
                // Get the minimum available ID
                var minId = await _context.CorrespondenceOutwards.MinAsync(i => i.Id);
                if (minId > 1)
                {
                    // Reset the identity seed to start from 1
                    await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('CorrespondenceOutwards', RESEED, 0)");
                }
                else
                {
                    // Find the next available ID (look for gaps)
                    var allIds = await _context.CorrespondenceOutwards.Select(i => i.Id).OrderBy(id => id).ToListAsync();
                    int nextId = 1;

                    foreach (var id in allIds)
                    {
                        if (id != nextId)
                        {
                            break;
                        }
                        nextId++;
                    }

                    // Reset the identity seed to the next available ID - 1
                    await _context.Database.ExecuteSqlRawAsync($"DBCC CHECKIDENT ('CorrespondenceOutwards', RESEED, {nextId - 1})");
                }
            }
        }
    }
}

