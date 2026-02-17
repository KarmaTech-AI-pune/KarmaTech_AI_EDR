using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Domain.Entities;
using EDR.Domain.GenericRepository;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
{
    public class ProjectBudgetChangeHistoryRepository : IProjectBudgetChangeHistoryRepository
    {
        private readonly IRepository<ProjectBudgetChangeHistory> _repository;
        private readonly ILogger<ProjectBudgetChangeHistoryRepository> _logger;

        public ProjectBudgetChangeHistoryRepository(
            IRepository<ProjectBudgetChangeHistory> repository,
            ILogger<ProjectBudgetChangeHistoryRepository> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ProjectBudgetChangeHistory>> GetAll()
        {
            return await _repository.GetAllAsync().ConfigureAwait(false);
        }

        public async Task<ProjectBudgetChangeHistory?> GetById(int id)
        {
            return await _repository.GetByIdAsync(id).ConfigureAwait(false);
        }

        public async Task Add(ProjectBudgetChangeHistory history)
        {
            try
            {
                await _repository.AddAsync(history).ConfigureAwait(false);
                await _repository.SaveChangesAsync().ConfigureAwait(false);
                _logger.LogInformation($"Successfully added budget change history for project {history.ProjectId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding budget change history for project {history.ProjectId}");
                throw;
            }
        }

        public void Update(ProjectBudgetChangeHistory history)
        {
            try
            {
                _repository.UpdateAsync(history).GetAwaiter().GetResult();
                _repository.SaveChangesAsync().GetAwaiter().GetResult();
                _logger.LogInformation($"Successfully updated budget change history with ID {history.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating budget change history with ID {history.Id}");
                throw;
            }
        }

        public void Delete(int id)
        {
            try
            {
                var history = _repository.GetByIdAsync(id).GetAwaiter().GetResult();
                if (history != null)
                {
                    _repository.RemoveAsync(history).GetAwaiter().GetResult();
                    _repository.SaveChangesAsync().GetAwaiter().GetResult();
                    _logger.LogInformation($"Successfully deleted budget change history with ID {id}");
                }
                else
                {
                    _logger.LogInformation($"Budget change history with ID {id} not found, but continuing as if deleted");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting budget change history with ID {id}");
                throw;
            }
        }

        public async Task<IEnumerable<ProjectBudgetChangeHistory>> GetByProjectIdAsync(int projectId)
        {
            try
            {
                var query = _repository.Query();
                var history = await query
                    .Where(h => h.ProjectId == projectId)
                    .Include(h => h.ChangedByUser)
                    .OrderByDescending(h => h.ChangedDate)
                    .ToListAsync()
                    .ConfigureAwait(false);

                return history;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving budget change history for project {projectId}");
                throw;
            }
        }

        public async Task<IEnumerable<ProjectBudgetChangeHistory>> GetByProjectIdWithFilteringAsync(
            int projectId, 
            string? fieldName = null, 
            int pageNumber = 1, 
            int pageSize = 10)
        {
            try
            {
                var query = _repository.Query();
                
                // Filter by project ID
                query = query.Where(h => h.ProjectId == projectId);
                
                // Filter by field name if provided
                if (!string.IsNullOrEmpty(fieldName))
                {
                    query = query.Where(h => h.FieldName == fieldName);
                }
                
                // Include related entities
                query = query.Include(h => h.ChangedByUser);
                
                // Order by date (newest first)
                query = query.OrderByDescending(h => h.ChangedDate);
                
                // Apply pagination
                var skip = (pageNumber - 1) * pageSize;
                query = query.Skip(skip).Take(pageSize);
                
                var history = await query.ToListAsync().ConfigureAwait(false);
                
                _logger.LogInformation($"Retrieved {history.Count()} budget change history records for project {projectId} (page {pageNumber})");
                return history;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving filtered budget change history for project {projectId}");
                throw;
            }
        }

        public async Task<int> GetCountByProjectIdAsync(int projectId, string? fieldName = null)
        {
            try
            {
                var query = _repository.Query();
                
                // Filter by project ID
                query = query.Where(h => h.ProjectId == projectId);
                
                // Filter by field name if provided
                if (!string.IsNullOrEmpty(fieldName))
                {
                    query = query.Where(h => h.FieldName == fieldName);
                }
                
                var count = await query.CountAsync().ConfigureAwait(false);
                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error counting budget change history for project {projectId}");
                throw;
            }
        }

        public async Task<IEnumerable<ProjectBudgetChangeHistory>> GetRecentChangesAsync(int projectId, int count = 5)
        {
            try
            {
                var query = _repository.Query();
                var recentHistory = await query
                    .Where(h => h.ProjectId == projectId)
                    .Include(h => h.ChangedByUser)
                    .OrderByDescending(h => h.ChangedDate)
                    .Take(count)
                    .ToListAsync()
                    .ConfigureAwait(false);

                return recentHistory;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving recent budget changes for project {projectId}");
                throw;
            }
        }
    }
}
