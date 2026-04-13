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
    public class ProgramDashboardRepository : IProgramDashboardRepository
    {
        private readonly ProjectManagementContext _context;

        public ProgramDashboardRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<Program?> GetProgramByIdAsync(int programId, CancellationToken ct)
        {
            return await _context.Programs.FirstOrDefaultAsync(p => p.Id == programId, ct);
        }

        public async Task<List<Project>> GetProjectsByProgramIdAsync(int programId, CancellationToken ct)
        {
            return await _context.Projects
                .Include(p => p.ProjectManager)
                .Include(p => p.Program)
                .Where(p => p.ProgramId == programId)
                .ToListAsync(ct);
        }

        public async Task<List<JobStartForm>> GetJobStartFormsByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct)
        {
            var pIds = projectIds.ToList();
            return await _context.JobStartForms
                .Include(jsf => jsf.Header)
                    .ThenInclude(h => h.JobStartFormHistories)
                        .ThenInclude(hist => hist.AssignedTo)
                .Where(jsf => pIds.Contains(jsf.ProjectId) && !jsf.IsDeleted)
                .ToListAsync(ct);
        }

        public async Task<List<MonthlyProgress>> GetMonthlyProgressesByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct)
        {
            var pIds = projectIds.ToList();
            return await _context.MonthlyProgresses
                .Include(mp => mp.BudgetTable)
                    .ThenInclude(bt => bt.CurrentBudgetInMIS)
                .Include(mp => mp.ContractAndCost)
                .Include(mp => mp.FinancialDetails)
                .Include(mp => mp.ProgressDeliverables)
                .Include(mp => mp.CTCEAC)
                .Where(mp => pIds.Contains(mp.ProjectId))
                .ToListAsync(ct);
        }

        public async Task<List<WBSTaskPlannedHourHeader>> GetWbsPlannedHourHeadersByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct)
        {
            var pIds = projectIds.ToList();
            return await _context.WBSTaskPlannedHourHeaders
                .Include(wbsph => wbsph.WBSHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(x => pIds.Contains(x.ProjectId))
                .ToListAsync(ct);
        }

        public async Task<List<WBSTaskPlannedHour>> GetWbsPlannedHoursByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct)
        {
            var pIds = projectIds.ToList();
            return await (from ph in _context.WBSTaskPlannedHours
                         join t in _context.WBSTasks on ph.WBSTaskId equals t.Id
                         join wbs in _context.WorkBreakdownStructures on t.WorkBreakdownStructureId equals wbs.Id
                         join header in _context.WBSHeaders on wbs.WBSHeaderId equals header.Id
                         where pIds.Contains(header.ProjectId) && !t.IsDeleted
                         select new { ph, t })
                         .Select(x => x.ph)
                         .Include(ph => ph.WBSTask)
                         .ToListAsync(ct);
        }

        public async Task<List<ProjectClosure>> GetProjectClosuresByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct)
        {
            var pIds = projectIds.ToList();
            return await _context.ProjectClosures
                .Include(pc => pc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(x => pIds.Contains(x.ProjectId))
                .ToListAsync(ct);
        }

        public async Task<List<ChangeControl>> GetChangeControlsByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct)
        {
            var pIds = projectIds.ToList();
            return await _context.ChangeControls
                .Include(cc => cc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(x => pIds.Contains(x.ProjectId))
                .ToListAsync(ct);
        }

        public async Task<List<SprintTask>> GetSprintTasksByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct)
        {
            var pIds = projectIds.ToList();
            return await _context.SprintTasks
                .Include(st => st.SprintPlan)
                    .ThenInclude(sp => sp.Project)
                .Where(st => st.SprintPlan != null && pIds.Contains(st.SprintPlan.ProjectId.Value))
                .ToListAsync(ct);
        }
        public async Task<List<PaymentMilestone>> GetPaymentMilestonesByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct)
        {
            var pIds = projectIds.ToList();
            return await _context.PaymentMilestones
                .Where(pm => pIds.Contains(pm.ProjectId))
                .ToListAsync(ct);
        }
    }
}
