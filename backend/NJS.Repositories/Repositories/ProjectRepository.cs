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

        public IEnumerable<Project> GetAll()
        {
            return _repository.GetAllAsync().GetAwaiter().GetResult();
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
            _repository.UpdateAsync(project).GetAwaiter().GetResult();
            _repository.SaveChangesAsync().GetAwaiter().GetResult();
        }

        public void Delete(int id)
        {
            var project = _repository.GetByIdAsync(id).GetAwaiter().GetResult();
            if (project != null)
            {
                _repository.RemoveAsync(project).GetAwaiter().GetResult();
                _repository.SaveChangesAsync().GetAwaiter().GetResult();
            }
        }
    }
}
