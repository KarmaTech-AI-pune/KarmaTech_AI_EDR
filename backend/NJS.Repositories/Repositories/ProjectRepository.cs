using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly IRepository<Project> _repository;
        private readonly IGoNoGoDecisionRepository _goNoGoDecisionRepository;

        public readonly ILogger<ProjectRepository> _logger;

        public ProjectRepository(
            IRepository<Project> repository,
            IGoNoGoDecisionRepository goNoGoDecisionRepository,
            ILogger<ProjectRepository> logger)
        {
            _repository = repository;
            _goNoGoDecisionRepository = goNoGoDecisionRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<Project>> GetAll()
        {
            return  await _repository.GetAllAsync().ConfigureAwait(false);
        }

        public Project GetById(int id)
        {
            return _repository.GetByIdAsync(id).GetAwaiter().GetResult();
        }

        public async Task Add(Project project)
        {
            await _repository.AddAsync(project).ConfigureAwait(false);
            await _repository.SaveChangesAsync().ConfigureAwait(false);
        }

        public void Update(Project project)
        {
            try
            {
                // Log the project state before update                

                _repository.UpdateAsync(project).GetAwaiter().GetResult();
                _repository.SaveChangesAsync().GetAwaiter().GetResult();

                // Log the project state after update
                var updatedProject = _repository.GetByIdAsync(project.Id).GetAwaiter().GetResult();
               
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error in repository update: {ex.Message}");               
            }
        }

        public void Delete(int id)
        {
            try
            {
                var project = _repository.GetByIdAsync(id).GetAwaiter().GetResult();
                if (project != null)
                {
                    // Perform hard delete - completely remove the project from the database
                    _repository.RemoveAsync(project).GetAwaiter().GetResult();
                    _repository.SaveChangesAsync().GetAwaiter().GetResult();
                    _logger.LogInformation($"Successfully deleted project with ID {id}");
                }
                else
                {
                    // If project doesn't exist, just log it but don't throw an exception
                    // This allows the DELETE API to return success even if the project doesn't exist
                    _logger.LogInformation($"Project with ID {id} not found, but continuing as if deleted");
                }
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error deleting project with ID {id}: {ex.Message}");           
                
            }
        }

        public async Task<IEnumerable<Project>> GetAllByUserId(string userId)
        {
            var query = _repository.Query();
            var userProjects = query.Where(project =>
                (project.SeniorProjectManagerId == userId)
                || (project.ProjectManagerId == userId)
                || (project.RegionalManagerId == userId));

            return await userProjects.ToListAsync();
        }
    }
}
