using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.ProjectSchedules.Command
{
    public class CreateProjectScheduleCommand : IRequest<int>
    {
        public ProjectScheduleDto ProjectSchedule { get; set; }
    }
}

