using NJS.Domain.Entities;
using System.Collections.Generic;

namespace NJS.Repositories.Interfaces
{
    public interface IGoNoGoDecisionRepository
    {
        IEnumerable<GoNoGoDecision> GetAll();
        GoNoGoDecision GetById(int id);
        GoNoGoDecision GetByProjectId(int projectId);
        void Add(GoNoGoDecision decision);
        void Update(GoNoGoDecision decision);
        void Delete(int id);
    }
}
