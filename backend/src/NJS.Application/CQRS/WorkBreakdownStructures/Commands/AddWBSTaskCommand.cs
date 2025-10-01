using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to add a single new task to a Work Breakdown Structure.
    /// </summary>
    public class AddWBSTaskCommand : IRequest<WBSTaskDto> // Returns the full DTO of the new task
    {
        public int ProjectId { get; }
        public WBSTaskDto TaskDto { get; }

        public AddWBSTaskCommand(int projectId, WBSTaskDto taskDto)
        {
            ProjectId = projectId;
            TaskDto = taskDto;
            // Ensure the ID is 0 for a new task, preventing accidental updates
            TaskDto.Id = 0;
        }
    }
}
