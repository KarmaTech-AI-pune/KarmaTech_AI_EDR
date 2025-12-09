using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.ProjectSchedules.Command
{
    public class CreateProjectScheduleCommand : IRequest<int>
    {
        public ProjectScheduleDto ProjectSchedule { get; set; }
    }
}
