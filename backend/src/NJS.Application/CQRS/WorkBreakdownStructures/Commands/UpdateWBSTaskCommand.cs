using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to update a specific task within a Work Breakdown Structure.
    /// </summary>
    public class UpdateWBSTaskCommand : IRequest<Unit>
    {
        public int ProjectId { get; }
        public int TaskId { get; }
        public WBSTaskDto TaskDto { get; }

        public UpdateWBSTaskCommand(int projectId, int taskId, WBSTaskDto taskDto)
        {
            ProjectId = projectId;
            TaskId = taskId;
            TaskDto = taskDto;
            TaskDto.Id = taskId;
        }
    }
}
