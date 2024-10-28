using NJSAPI.Interfaces;
using NJSAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace NJSAPI.Repositories
{
    public class WorkBreakdownStructureRepository : IWorkBreakdownStructureRepository
    {
        private static List<WorkBreakdownStructure> _wbsList = new List<WorkBreakdownStructure>();

        public IEnumerable<WorkBreakdownStructure> GetAllByProjectId(int projectId)
        {
            return _wbsList.Where(wbs => wbs.ProjectId == projectId);
        }

        public WorkBreakdownStructure GetById(int id)
        {
            return _wbsList.FirstOrDefault(wbs => wbs.Id == id);
        }

        public WorkBreakdownStructure GetByProjectId(int projectId)
        {
            return _wbsList.FirstOrDefault(wbs => wbs.ProjectId == projectId);
        }

        public void Add(WorkBreakdownStructure wbs)
        {
            wbs.Id = _wbsList.Count + 1;
            _wbsList.Add(wbs);
        }

        public void Update(WorkBreakdownStructure wbs)
        {
            var existingWBS = _wbsList.FirstOrDefault(w => w.Id == wbs.Id);
            if (existingWBS != null)
            {
                existingWBS.Structure = wbs.Structure;
                existingWBS.Tasks = wbs.Tasks;
            }
        }

        public void Delete(int id)
        {
            var wbs = _wbsList.FirstOrDefault(w => w.Id == id);
            if (wbs != null)
            {
                _wbsList.Remove(wbs);
            }
        }
    }
}