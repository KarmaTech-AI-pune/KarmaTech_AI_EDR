using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class FeasibilityStudyRepository : IFeasibilityStudyRepository
    {
        private readonly ProjectManagementContext _context;

        public FeasibilityStudyRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public IEnumerable<FeasibilityStudy> GetAll()
        {
            return _context.FeasibilityStudies
                .Include(fs => fs.Project)
                .ToList();
        }

        public FeasibilityStudy GetById(int id)
        {
            return _context.FeasibilityStudies
                .Include(fs => fs.Project)
                .FirstOrDefault(fs => fs.Id == id);
        }

        public FeasibilityStudy GetByProjectId(int projectId)
        {
            return _context.FeasibilityStudies
                .Include(fs => fs.Project)
                .FirstOrDefault(fs => fs.ProjectId == projectId);
        }

        public void Add(FeasibilityStudy feasibilityStudy)
        {
            _context.FeasibilityStudies.Add(feasibilityStudy);
            _context.SaveChanges();
        }

        public void Update(FeasibilityStudy feasibilityStudy)
        {
            _context.Entry(feasibilityStudy).State = EntityState.Modified;
            _context.SaveChanges();
        }
    }
}
