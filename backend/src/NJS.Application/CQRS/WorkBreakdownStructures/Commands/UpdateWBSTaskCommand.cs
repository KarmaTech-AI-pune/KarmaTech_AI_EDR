using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to update a specific task within a Work Breakdown Structure.
    /// </summary>
    public class UpdateWBSTaskCommand : IRequest<Unit>
    {
        // ProjectId might be useful for authorization or ensuring task belongs to the correct WBS
        public int ProjectId { get; }
        public int TaskId { get; }
        public WBSTaskDto TaskDto { get; }

        public UpdateWBSTaskCommand(int projectId, int taskId, WBSTaskDto taskDto)
        {
            ProjectId = projectId;
            TaskId = taskId;
            TaskDto = taskDto;
            // Ensure the ID in the DTO matches the TaskId from the route
            TaskDto.Id = taskId;
        }
    }
}
