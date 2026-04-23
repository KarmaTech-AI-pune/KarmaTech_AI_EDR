using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries;
using EDR.Application.Dtos.ProjectDashboard;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Handlers
{
    public class GetProjectTaskPriorityMatrixQueryHandler : IRequestHandler<GetProjectTaskPriorityMatrixQuery, List<TaskPriorityItemDto>>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectTaskPriorityMatrixQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<List<TaskPriorityItemDto>> Handle(GetProjectTaskPriorityMatrixQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return new List<TaskPriorityItemDto>();

            var sprintTasks = await _projectDashboardRepository.GetSprintTasksByProjectIdAsync(request.ProjectId, cancellationToken);

            return sprintTasks
                .Where(st => 
                    st.Taskstatus != "Done" && 
                    st.Taskstatus != "Completed" && 
                    st.Taskstatus != "Closed")
                .Select(st => new TaskPriorityItemDto
                {
                    Id = st.Taskid,
                    Title = st.TaskTitle,
                    Project = project.Name,
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
