using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NJS.Repositories.Repositories
{
    public class GoNoGoDecisionRepository : IGoNoGoDecisionRepository
    {
        private readonly ProjectManagementContext _context;

        public GoNoGoDecisionRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public IEnumerable<GoNoGoDecision> GetAll()
        {
            return _context.GoNoGoDecisions.ToList();
        }

        public GoNoGoDecision GetById(int id)
        {
            return _context.GoNoGoDecisions.FirstOrDefault(d => d.Id == id);
        }

        public GoNoGoDecision GetByProjectId(int projectId)
        {
            return _context.GoNoGoDecisions.FirstOrDefault(d => d.ProjectId == projectId);
        }

        public void Add(GoNoGoDecision decision)
        {
            decision.CreatedAt = DateTime.UtcNow;
            _context.GoNoGoDecisions.Add(decision);
            _context.SaveChanges();
        }

        public void Update(GoNoGoDecision decision)
        {
            decision.LastModifiedAt = DateTime.UtcNow;
            _context.GoNoGoDecisions.Update(decision);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var decision = _context.GoNoGoDecisions.Find(id);
            if (decision != null)
            {
                _context.GoNoGoDecisions.Remove(decision);
                _context.SaveChanges();
            }
        }
    }
}
