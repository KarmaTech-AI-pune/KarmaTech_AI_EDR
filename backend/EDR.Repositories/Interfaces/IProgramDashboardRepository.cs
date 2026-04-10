using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IProgramDashboardRepository
    {
        Task<Program?> GetProgramByIdAsync(int programId, CancellationToken ct);
        Task<List<Project>> GetProjectsByProgramIdAsync(int programId, CancellationToken ct);
        Task<List<JobStartForm>> GetJobStartFormsByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct);
        Task<List<MonthlyProgress>> GetMonthlyProgressesByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct);
        Task<List<WBSTaskPlannedHourHeader>> GetWbsPlannedHourHeadersByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct);
        Task<List<WBSTaskPlannedHour>> GetWbsPlannedHoursByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct);
        Task<List<ProjectClosure>> GetProjectClosuresByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct);
        Task<List<ChangeControl>> GetChangeControlsByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct);
        Task<List<SprintTask>> GetSprintTasksByProjectIdsAsync(IEnumerable<int> projectIds, CancellationToken ct);
    }
}
