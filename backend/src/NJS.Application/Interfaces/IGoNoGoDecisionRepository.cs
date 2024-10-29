using NJS.Domain.Entities;

namespace NJS.Application.Interfaces
{
    public interface IGoNoGoDecisionRepository
    {
        GoNoGoDecision GetByProjectId(int projectId);
        void Add(GoNoGoDecision decision);
    }
}
