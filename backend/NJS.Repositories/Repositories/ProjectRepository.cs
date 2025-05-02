using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly IRepository<Project> _repository;
        private readonly IGoNoGoDecisionRepository _goNoGoDecisionRepository;

        public ProjectRepository(
            IRepository<Project> repository,
            IGoNoGoDecisionRepository goNoGoDecisionRepository)
        {
            _repository = repository;
            _goNoGoDecisionRepository = goNoGoDecisionRepository;
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
                Console.WriteLine($"Repository - Project state before update:");
                Console.WriteLine($"Office: '{project.Office}'");
                Console.WriteLine($"TypeOfJob: '{project.TypeOfJob}'");
                Console.WriteLine($"Budget: {project.Budget}");
                Console.WriteLine($"Priority: '{project.Priority}'");

                _repository.UpdateAsync(project).GetAwaiter().GetResult();
                _repository.SaveChangesAsync().GetAwaiter().GetResult();

                // Log the project state after update
                var updatedProject = _repository.GetByIdAsync(project.Id).GetAwaiter().GetResult();
                Console.WriteLine($"Repository - Project state after update:");
                Console.WriteLine($"Office: '{updatedProject.Office}'");
                Console.WriteLine($"TypeOfJob: '{updatedProject.TypeOfJob}'");
                Console.WriteLine($"Budget: {updatedProject.Budget}");
                Console.WriteLine($"Priority: '{updatedProject.Priority}'");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in repository update: {ex.Message}");
                throw;
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
                    Console.WriteLine($"Successfully deleted project with ID {id}");
                }
                else
                {
                    // If project doesn't exist, just log it but don't throw an exception
                    // This allows the DELETE API to return success even if the project doesn't exist
                    Console.WriteLine($"Project with ID {id} not found, but continuing as if deleted");
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error deleting project with ID {id}: {ex.Message}");
                throw; // Rethrow to be handled by the caller
            }
        }
    }
}
