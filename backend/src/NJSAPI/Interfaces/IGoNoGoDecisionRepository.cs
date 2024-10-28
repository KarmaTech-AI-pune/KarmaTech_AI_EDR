using NJSAPI.Models;

namespace NJSAPI.Interfaces
{
    public interface IGoNoGoDecisionRepository
    {
        GoNoGoDecision GetByProjectId(int projectId);
        void Add(GoNoGoDecision decision);
    }
}