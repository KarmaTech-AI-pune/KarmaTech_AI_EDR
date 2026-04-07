using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly ProjectManagementContext _context;

        public DashboardRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<JobStartForm>> GetJobStartFormsByProjectIdsAsync(IEnumerable<int> projectIds)
        {
            var pIds = projectIds.ToList();
            return await _context.JobStartForms
                .Include(jsf => jsf.Header)
                    .ThenInclude(header => header.JobStartFormHistories)
                        .ThenInclude(hist => hist.AssignedTo)
                .Where(jsf => pIds.Contains(jsf.ProjectId))
                .ToListAsync();
        }

        public async Task<List<MonthlyProgress>> GetMonthlyProgressesByProjectIdsAsync(IEnumerable<int> projectIds)
        {
            var pIds = projectIds.ToList();
            return await _context.MonthlyProgresses
                .Include(mp => mp.FinancialDetails)
                .Include(mp => mp.ProgressDeliverables)
                .Include(mp => mp.ContractAndCost)
                .Include(mp => mp.BudgetTable)
                .Where(mp => pIds.Contains(mp.ProjectId))
                .ToListAsync();
        }

        public async Task<List<WBSTaskPlannedHourHeader>> GetWbsPlannedHourHeadersByProjectIdsAsync(IEnumerable<int> projectIds)
        {
            var pIds = projectIds.ToList();
            return await _context.WBSTaskPlannedHourHeaders
                .Include(wbsph => wbsph.WBSHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(wbsph => pIds.Contains(wbsph.ProjectId))
                .ToListAsync();
        }

        public async Task<List<WBSTaskPlannedHour>> GetWbsPlannedHoursByProjectIdsAsync(IEnumerable<int> projectIds)
        {
            var pIds = projectIds.ToList();
            return await (from ph in _context.WBSTaskPlannedHours
                         join t in _context.WBSTasks on ph.WBSTaskId equals t.Id
                         join wbs in _context.WorkBreakdownStructures on t.WorkBreakdownStructureId equals wbs.Id
                         join header in _context.WBSHeaders on wbs.WBSHeaderId equals header.Id
                         where pIds.Contains(header.ProjectId) && !t.IsDeleted
                         select ph)
                         .ToListAsync();
        }

        public async Task<List<ProjectClosure>> GetProjectClosuresByProjectIdsAsync(IEnumerable<int> projectIds)
        {
            var pIds = projectIds.ToList();
            return await _context.ProjectClosures
                .Include(pc => pc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(pc => pIds.Contains(pc.ProjectId))
                .ToListAsync();
        }

        public async Task<List<ChangeControl>> GetChangeControlsByProjectIdsAsync(IEnumerable<int> projectIds)
        {
            var pIds = projectIds.ToList();
            return await _context.ChangeControls
                .Include(cc => cc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(cc => pIds.Contains(cc.ProjectId))
                .ToListAsync();
        }
    }
}
