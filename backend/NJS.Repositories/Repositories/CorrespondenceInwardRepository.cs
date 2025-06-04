using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class CorrespondenceInwardRepository : ICorrespondenceInwardRepository
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<CorrespondenceInwardRepository> _logger;

        public CorrespondenceInwardRepository(ProjectManagementContext context, ILogger<CorrespondenceInwardRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
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

            try
            {
                // Check if we need to reset the identity seed before adding a new entry
                await ResetIdentitySeedAsync();

                // Set creation timestamp
                correspondenceInward.CreatedAt = DateTime.Now;

                // Don't set the ID - let the database assign it automatically

                _context.CorrespondenceInwards.Add(correspondenceInward);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Added correspondence inward with ID: {correspondenceInward.Id}");

                return correspondenceInward.Id;
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error adding correspondence inward: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogInformation($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task UpdateAsync(CorrespondenceInward correspondenceInward)
        {
            if (correspondenceInward == null) throw new ArgumentNullException(nameof(correspondenceInward));

            correspondenceInward.UpdatedAt = DateTime.Now;

            _context.Entry(correspondenceInward).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            try
            {
                var correspondenceInward = await _context.CorrespondenceInwards.FindAsync(id);
                if (correspondenceInward != null)
                {
                    _context.CorrespondenceInwards.Remove(correspondenceInward);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Deleted correspondence inward with ID: {id}");
                }
                else
                {
                    _logger.LogInformation($"No correspondence inward found with ID: {id}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error deleting correspondence inward: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogInformation($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CorrespondenceInwards.AnyAsync(e => e.Id == id);
        }

        public async Task<int> GetNextIdAsync()
        {
            // If there are no records, the next ID will be 1
            if (!await _context.CorrespondenceInwards.AnyAsync())
            {
                return 1;
            }

            // Otherwise, get the maximum ID and add 1
            var maxId = await _context.CorrespondenceInwards.MaxAsync(i => i.Id);
            return maxId + 1;
        }

        public async Task ResetIdentitySeedAsync()
        {
            // Check if there are any records left
            if (!await _context.CorrespondenceInwards.AnyAsync())
            {
                // Reset the identity seed to 1
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('CorrespondenceInwards', RESEED, 0)");
            }
            else
            {
                // Get the minimum available ID
                var minId = await _context.CorrespondenceInwards.MinAsync(i => i.Id);
                if (minId > 1)
                {
                    // Reset the identity seed to start from 1
                    await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('CorrespondenceInwards', RESEED, 0)");
                }
                else
                {
                    // Find the next available ID (look for gaps)
                    var allIds = await _context.CorrespondenceInwards.Select(i => i.Id).OrderBy(id => id).ToListAsync();
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
                    await _context.Database.ExecuteSqlRawAsync($"DBCC CHECKIDENT ('CorrespondenceInwards', RESEED, {nextId - 1})");
                }
            }
        }
    }
}
