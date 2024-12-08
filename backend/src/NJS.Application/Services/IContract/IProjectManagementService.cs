using NJS.Domain.Entities;

namespace NJS.Application.Services.IContract
{
    public interface IProjectManagementService
    {
        Project CreateProjectWithFeasibilityStudy(Project project, FeasibilityStudy feasibilityStudy);
        void AddWorkBreakdownStructure(int projectId, WorkBreakdownStructure wbs);
        FeasibilityStudy CreateFeasibilityStudy(FeasibilityStudy feasibilityStudy);
        FeasibilityStudy GetFeasibilityStudy(int projectId);
        void UpdateFeasibilityStudy(FeasibilityStudy feasibilityStudy);
        GoNoGoDecision SubmitGoNoGoDecision(GoNoGoDecision decision);
        GoNoGoDecision GetGoNoGoDecision(int projectId);
        WorkBreakdownStructure CreateWBS(WorkBreakdownStructure wbs);
        WorkBreakdownStructure GetWBS(int projectId);
        void UpdateWBS(WorkBreakdownStructure wbs);
    }
}
