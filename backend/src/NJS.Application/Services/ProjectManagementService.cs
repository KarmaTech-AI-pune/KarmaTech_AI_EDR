using NJS.Application.Interfaces;
using NJS.Domain.Entities;

namespace NJS.Application.Services
{
    public class ProjectManagementService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IFeasibilityStudyRepository _feasibilityStudyRepository;
        private readonly IWorkBreakdownStructureRepository _wbsRepository;
        private readonly IGoNoGoDecisionRepository _goNoGoDecisionRepository;
        public ProjectManagementService(
        IProjectRepository projectRepository,
        IFeasibilityStudyRepository feasibilityStudyRepository,
        IWorkBreakdownStructureRepository wbsRepository,
        IGoNoGoDecisionRepository goNoGoDecisionRepository)
        {
            _projectRepository = projectRepository;
            _feasibilityStudyRepository = feasibilityStudyRepository;
            _wbsRepository = wbsRepository;
            _goNoGoDecisionRepository = goNoGoDecisionRepository;
        }

        public Project CreateProjectWithFeasibilityStudy(Project project, FeasibilityStudy feasibilityStudy)
        {
            _projectRepository.Add(project);
            feasibilityStudy.ProjectId = project.Id;
            _feasibilityStudyRepository.Add(feasibilityStudy);
            return project;
        }

        public void AddWorkBreakdownStructure(int projectId, WorkBreakdownStructure wbs)
        {
            var project = _projectRepository.GetById(projectId);
            if (project == null)
            {
                throw new ArgumentException("Project not found", nameof(projectId));
            }
            wbs.ProjectId = projectId;
            _wbsRepository.Add(wbs);
        }

        public FeasibilityStudy CreateFeasibilityStudy(FeasibilityStudy feasibilityStudy)
        {
            _feasibilityStudyRepository.Add(feasibilityStudy);
            return feasibilityStudy;
        }

        public FeasibilityStudy GetFeasibilityStudy(int projectId)
        {
            return _feasibilityStudyRepository.GetByProjectId(projectId);
        }

        public void UpdateFeasibilityStudy(FeasibilityStudy feasibilityStudy)
        {
            _feasibilityStudyRepository.Update(feasibilityStudy);
        }

        public GoNoGoDecision SubmitGoNoGoDecision(GoNoGoDecision decision)
        {
            _goNoGoDecisionRepository.Add(decision);
            return decision;
        }

        public GoNoGoDecision GetGoNoGoDecision(int projectId)
        {
            return _goNoGoDecisionRepository.GetByProjectId(projectId);
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