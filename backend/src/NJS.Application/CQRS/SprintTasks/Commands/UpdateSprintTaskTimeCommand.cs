using MediatR;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintTaskTimeCommand : IRequest<bool>
    {
        [Required]
        public int TaskId { get; set; }

        [Required]
        public int SprintWbsPlanId { get; set; }

        [Required]
        public int ActualHours { get; set; }

        public int RemainingHours { get; set; } // Optional: update task's remaining hours too
    }
}
