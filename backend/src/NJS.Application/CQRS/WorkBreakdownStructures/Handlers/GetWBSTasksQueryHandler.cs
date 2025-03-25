using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSTasksQueryHandler : IRequestHandler<GetWBSTasksQuery, List<WBSTaskDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetWBSTasksQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<WBSTaskDto>> Handle(GetWBSTasksQuery request, CancellationToken cancellationToken)
        {
            // Fetch all WBS tasks for the given project, including child tasks
            var wbsTasks = await _context.WBSTasks
                .Where(t => t.WorkBreakdownStructure.ProjectId == request.ProjectId)
                .Include(t => t.WorkBreakdownStructure)
                .Include(t => t.UserWBSTasks)
                .ToListAsync(cancellationToken);

            // Convert to hierarchical DTO structure
            return ConvertToHierarchicalDto(wbsTasks);
        }

        private List<WBSTaskDto> ConvertToHierarchicalDto(List<WBSTask> tasks)
        {
            // Create a dictionary of tasks by their ID for easy lookup
            var taskDict = tasks.ToDictionary(t => t.Id, t => new WBSTaskDto
            {
                Id = t.Id,
                ProjectId = t.WorkBreakdownStructure.ProjectId,
                TaskName = t.Title,
                Description = t.Description,
                Level = (int)t.Level,
                ParentTaskId = t.ParentId?.ToString(),
                StartDate = t.CreatedAt,
                EndDate = t.UpdatedAt ?? t.CreatedAt,
                Resources = t.UserWBSTasks?.Select(ut => ut.UserId).ToList() ?? new List<string>(),
                ChildTasks = new List<WBSTaskDto>()
            });

            // Build hierarchical structure
            var rootTasks = new List<WBSTaskDto>();
            foreach (var task in taskDict.Values)
            {
                if (string.IsNullOrEmpty(task.ParentTaskId))
                {
                    rootTasks.Add(task);
                }
                else
                {
                    // Find parent task and add this task as a child
                    if (taskDict.TryGetValue(int.Parse(task.ParentTaskId), out var parentTask))
                    {
                        parentTask.ChildTasks.Add(task);
                    }
                }
            }

            return rootTasks;
        }
    }
}
