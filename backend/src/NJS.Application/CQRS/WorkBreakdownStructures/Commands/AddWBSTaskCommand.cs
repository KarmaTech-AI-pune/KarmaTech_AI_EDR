using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to add a single new task to a Work Breakdown Structure.
    /// </summary>
    public class AddWBSTaskCommand : IRequest<List<WBSTaskDto>> // Returns the full DTO of the new task
    {
        public int ProjectId { get; }
        public List<WBSTaskDto> TasksDto { get; }

        public AddWBSTaskCommand(int projectId, List<WBSTaskDto> tasksDto)
        {
            ProjectId = projectId;
            TasksDto = tasksDto;
            // Ensure IDs are 0 for new tasks, preventing accidental updates
            foreach (var task in TasksDto)
            {
                task.Id = 0;
            }
        }
    }
}
