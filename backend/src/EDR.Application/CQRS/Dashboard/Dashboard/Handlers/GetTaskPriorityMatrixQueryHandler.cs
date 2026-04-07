using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using MediatR;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using Microsoft.EntityFrameworkCore;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Handlers
{
    public class GetTaskPriorityMatrixQueryHandler : IRequestHandler<GetTaskPriorityMatrixQuery, List<TaskPriorityItemDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetTaskPriorityMatrixQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<TaskPriorityItemDto>> Handle(GetTaskPriorityMatrixQuery request, CancellationToken cancellationToken)
        {
            var sprintTasks = await _context.SprintTasks
                .Include(st => st.SprintPlan)
                    .ThenInclude(sp => sp.Project)
                .Where(st => 
                    st.SprintPlan != null && 
                    st.SprintPlan.Status == 1 && // Active Sprints
                    st.Taskstatus != "Done" && 
                    st.Taskstatus != "Completed" && 
                    st.Taskstatus != "Closed")
                .Select(st => new TaskPriorityItemDto
                {
                    Id = st.Taskid,
                    Title = st.TaskTitle,
                    Project = st.SprintPlan.Project.Name,
                    Assignee = st.TaskAssigneeName ?? "Unassigned",
                    Category = MapPriorityToCategory(st.Taskpriority)
                })
                .ToListAsync(cancellationToken);

            return sprintTasks;
        }

        private static string MapPriorityToCategory(string priority)
        {
            if (string.IsNullOrWhiteSpace(priority)) return "neither";

            var p = priority.ToLower();
            if (p.Contains("critical") || p.Contains("highest") || p.Contains("blocker"))
                return "urgent_important";
            if (p.Contains("high"))
                return "important_not_urgent";
            if (p.Contains("medium"))
                return "urgent_not_important";

            return "neither";
        }
    }
}
