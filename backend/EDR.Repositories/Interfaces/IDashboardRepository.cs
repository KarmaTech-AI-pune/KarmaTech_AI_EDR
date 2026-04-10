using System.Collections.Generic;
using System.Threading.Tasks;
using EDR.Domain.Entities;
using EDR.Domain.Models; // For any domain-specific mapping models if needed

namespace EDR.Repositories.Interfaces
{
    public interface IDashboardRepository
    {
        Task<List<JobStartForm>> GetJobStartFormsByProjectIdsAsync(IEnumerable<int> projectIds);
        Task<List<MonthlyProgress>> GetMonthlyProgressesByProjectIdsAsync(IEnumerable<int> projectIds);
        Task<List<WBSTaskPlannedHourHeader>> GetWbsPlannedHourHeadersByProjectIdsAsync(IEnumerable<int> projectIds);
        Task<List<WBSTaskPlannedHour>> GetWbsPlannedHoursByProjectIdsAsync(IEnumerable<int> projectIds);
        Task<List<ProjectClosure>> GetProjectClosuresByProjectIdsAsync(IEnumerable<int> projectIds);
        Task<List<ChangeControl>> GetChangeControlsByProjectIdsAsync(IEnumerable<int> projectIds);
    }
}
