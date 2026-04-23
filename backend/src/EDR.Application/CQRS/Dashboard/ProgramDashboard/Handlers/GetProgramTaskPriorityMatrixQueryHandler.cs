using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Application.Dtos.ProgramDashboard;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramTaskPriorityMatrixQueryHandler : IRequestHandler<GetProgramTaskPriorityMatrixQuery, List<TaskPriorityItemDto>>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramTaskPriorityMatrixQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<List<TaskPriorityItemDto>> Handle(GetProgramTaskPriorityMatrixQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return new List<TaskPriorityItemDto>();

            var projectIds = projects.Select(p => p.Id).ToList();
            var projectNames = projects.ToDictionary(p => p.Id, p => p.Name);

            var sprintTasks = await _programDashboardRepository.GetSprintTasksByProjectIdsAsync(projectIds, cancellationToken);

            return sprintTasks
                .Where(st => 
                    st.Taskstatus != "Done" && 
                    st.Taskstatus != "Completed" && 
                    st.Taskstatus != "Closed")
                .Select(st => new TaskPriorityItemDto
                {
                    Id = st.Taskid,
                    Title = st.TaskTitle,
                    Project = st.SprintPlan?.Project != null ? st.SprintPlan.Project.Name : (st.SprintPlan?.ProjectId.HasValue == true ? projectNames.GetValueOrDefault(st.SprintPlan.ProjectId.Value, "Unknown") : "Unknown"),
                    Assignee = st.TaskAssigneeName ?? "Unassigned",
                    Category = MapPriorityToCategory(st.Taskpriority)
                })
                .ToList();
        }

        private static string MapPriorityToCategory(string priority)
        {
            if (string.IsNullOrWhiteSpace(priority)) return "neither";
            var p = priority.ToLower();
            if (p.Contains("critical") || p.Contains("highest") || p.Contains("blocker")) return "urgent_important";
            if (p.Contains("high")) return "important_not_urgent";
            if (p.Contains("medium")) return "urgent_not_important";
            return "neither";
        }
    }
}
