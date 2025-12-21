using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Application.Services
{
    public class ProjectManagementService: IProjectManagementService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IWorkBreakdownStructureRepository _wbsRepository;
        private readonly IGoNoGoDecisionService _goNoGoDecisionService;
        public ProjectManagementService(
        IProjectRepository projectRepository,
        IWorkBreakdownStructureRepository wbsRepository,
        IGoNoGoDecisionService goNoGoDecisionService)
        {
            _projectRepository = projectRepository;
            _wbsRepository = wbsRepository;
            _goNoGoDecisionService = goNoGoDecisionService;
        }

        public void AddWorkBreakdownStructure(int projectId, WorkBreakdownStructure wbs)
        {
            var project = _projectRepository.GetById(projectId);
            if (project == null)
            {
                throw new ArgumentException("Project not found", nameof(projectId));
            }
            _wbsRepository.Add(wbs);
        }

        public GoNoGoDecision SubmitGoNoGoDecision(GoNoGoDecision decision)
        {
            // Use service to ensure score capping is applied
            _goNoGoDecisionService.Add(decision);
            return decision;
        }

        public GoNoGoDecision GetGoNoGoDecision(int projectId)
        {
            return _goNoGoDecisionService.GetByProjectId(projectId);
        }

        public WorkBreakdownStructure CreateWBS(WorkBreakdownStructure wbs)
        {
            _wbsRepository.Add(wbs);
            return wbs;
        }

        public WorkBreakdownStructure GetWBS(int projectId)
        {
            return _wbsRepository.GetByProjectId(projectId);
        }

        public void UpdateWBS(WorkBreakdownStructure wbs)
        {
            _wbsRepository.Update(wbs);
        }
    }
}
