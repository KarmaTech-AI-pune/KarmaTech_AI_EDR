//File: backend/src/NJS.Application/Interfaces/IGoNoGoDecisionRepository.cs

//File: backend/src/NJS.Application/Interfaces/IGoNoGoDecisionRepository.cs
using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IGoNoGoDecisionRepository
    {
        GoNoGoDecision GetByProjectId(int projectId);
        void Add(GoNoGoDecision decision);
    }
}
