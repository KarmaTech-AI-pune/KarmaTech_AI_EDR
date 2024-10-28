using NJSAPI.Interfaces;
using NJSAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace NJSAPI.Repositories
{
    public class GoNoGoDecisionRepository : IGoNoGoDecisionRepository
    {
        private static List<GoNoGoDecision> _decisions = new List<GoNoGoDecision>();

        public GoNoGoDecision GetByProjectId(int projectId)
        {
            return _decisions.FirstOrDefault(d => d.ProjectId == projectId);
        }

        public void Add(GoNoGoDecision decision)
        {
            decision.Id = _decisions.Count + 1;
            _decisions.Add(decision);
        }
    }
}