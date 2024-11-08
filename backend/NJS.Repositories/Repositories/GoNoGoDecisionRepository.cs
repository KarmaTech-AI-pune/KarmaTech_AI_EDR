using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NJS.Repositories.Repositories
{
    public class GoNoGoDecisionRepository : IGoNoGoDecisionRepository
    {
        private static List<GoNoGoDecision> _decisions = new List<GoNoGoDecision>();

        public IEnumerable<GoNoGoDecision> GetAll()
        {
            return _decisions;
        }

        public GoNoGoDecision GetById(int id)
        {
            return _decisions.FirstOrDefault(d => d.Id == id);
        }

        public GoNoGoDecision GetByProjectId(int projectId)
        {
            return _decisions.FirstOrDefault(d => d.ProjectId == projectId);
        }

        public void Add(GoNoGoDecision decision)
        {
            decision.Id = _decisions.Count + 1;
            decision.CreatedAt = DateTime.UtcNow;
            _decisions.Add(decision);
        }

        public void Update(GoNoGoDecision decision)
        {
            var existingDecision = _decisions.FirstOrDefault(d => d.Id == decision.Id);
            if (existingDecision != null)
            {
                var index = _decisions.IndexOf(existingDecision);
                decision.LastModifiedAt = DateTime.UtcNow;
                _decisions[index] = decision;
            }
        }

        public void Delete(int id)
        {
            var decision = _decisions.FirstOrDefault(d => d.Id == id);
            if (decision != null)
            {
                _decisions.Remove(decision);
            }
        }
    }
}
