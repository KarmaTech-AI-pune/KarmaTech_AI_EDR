using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IProjectDashboardRepository
    {
        Task<Project?> GetProjectByIdAsync(int projectId, CancellationToken ct);
        Task<List<JobStartForm>> GetJobStartFormsByProjectIdAsync(int projectId, CancellationToken ct);
        Task<List<MonthlyProgress>> GetMonthlyProgressesByProjectIdAsync(int projectId, CancellationToken ct);
        Task<List<WBSTaskPlannedHourHeader>> GetWbsPlannedHourHeadersByProjectIdAsync(int projectId, CancellationToken ct);
        Task<List<WBSTaskPlannedHour>> GetWbsPlannedHoursByProjectIdAsync(int projectId, CancellationToken ct);
        Task<List<ProjectClosure>> GetProjectClosuresByProjectIdAsync(int projectId, CancellationToken ct);
        Task<List<ChangeControl>> GetChangeControlsByProjectIdAsync(int projectId, CancellationToken ct);
        Task<List<SprintTask>> GetSprintTasksByProjectIdAsync(int projectId, CancellationToken ct);
    }
}
