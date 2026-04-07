using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
{
    public class ProjectDashboardRepository : IProjectDashboardRepository
    {
        private readonly ProjectManagementContext _context;

        public ProjectDashboardRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<Project?> GetProjectByIdAsync(int projectId, CancellationToken ct)
        {
            return await _context.Projects
                .Include(p => p.ProjectManager)
                .Include(p => p.SeniorProjectManager)
                .Include(p => p.RegionalManager)
                .FirstOrDefaultAsync(p => p.Id == projectId, ct);
        }

        public async Task<List<JobStartForm>> GetJobStartFormsByProjectIdAsync(int projectId, CancellationToken ct)
        {
            return await _context.JobStartForms
                .Include(jsf => jsf.Header)
                    .ThenInclude(h => h.JobStartFormHistories)
                        .ThenInclude(hist => hist.AssignedTo)
                .Where(jsf => jsf.ProjectId == projectId && !jsf.IsDeleted)
                .ToListAsync(ct);
        }

        public async Task<List<MonthlyProgress>> GetMonthlyProgressesByProjectIdAsync(int projectId, CancellationToken ct)
        {
            return await _context.MonthlyProgresses
                .Include(mp => mp.BudgetTable)
                    .ThenInclude(bt => bt.CurrentBudgetInMIS)
                .Include(mp => mp.ContractAndCost)
                .Include(mp => mp.FinancialDetails)
                .Include(mp => mp.ProgressDeliverables)
                .Where(mp => mp.ProjectId == projectId)
                .ToListAsync(ct);
        }

        public async Task<List<WBSTaskPlannedHourHeader>> GetWbsPlannedHourHeadersByProjectIdAsync(int projectId, CancellationToken ct)
        {
            return await _context.WBSTaskPlannedHourHeaders
                .Include(wbsph => wbsph.WBSHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(wbsph => wbsph.ProjectId == projectId)
                .ToListAsync(ct);
        }

        public async Task<List<WBSTaskPlannedHour>> GetWbsPlannedHoursByProjectIdAsync(int projectId, CancellationToken ct)
        {
            return await (from ph in _context.WBSTaskPlannedHours
                         join t in _context.WBSTasks on ph.WBSTaskId equals t.Id
                         join wbs in _context.WorkBreakdownStructures on t.WorkBreakdownStructureId equals wbs.Id
                         join header in _context.WBSHeaders on wbs.WBSHeaderId equals header.Id
                         where header.ProjectId == projectId && !t.IsDeleted
                         select ph)
                         .ToListAsync(ct);
        }

        public async Task<List<ProjectClosure>> GetProjectClosuresByProjectIdAsync(int projectId, CancellationToken ct)
        {
            return await _context.ProjectClosures
                .Include(pc => pc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(pc => pc.ProjectId == projectId)
                .ToListAsync(ct);
        }

        public async Task<List<ChangeControl>> GetChangeControlsByProjectIdAsync(int projectId, CancellationToken ct)
        {
            return await _context.ChangeControls
                .Include(cc => cc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(cc => cc.ProjectId == projectId)
                .ToListAsync(ct);
        }

        public async Task<List<SprintTask>> GetSprintTasksByProjectIdAsync(int projectId, CancellationToken ct)
        {
            return await _context.SprintTasks
                .Include(st => st.SprintPlan)
                .Where(st => st.SprintPlan != null && st.SprintPlan.ProjectId == projectId)
                .ToListAsync(ct);
        }
    }
}
