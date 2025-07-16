using NJS.Domain.Entities;

namespace NJS.Application.Services.IContract
{
    public interface IProjectManagementService
    {
        void AddWorkBreakdownStructure(int projectId, WorkBreakdownStructure wbs);
        GoNoGoDecision SubmitGoNoGoDecision(GoNoGoDecision decision);
        GoNoGoDecision GetGoNoGoDecision(int projectId);
        WorkBreakdownStructure CreateWBS(WorkBreakdownStructure wbs);
        WorkBreakdownStructure GetWBS(int projectId);
        void UpdateWBS(WorkBreakdownStructure wbs);
    }
}
