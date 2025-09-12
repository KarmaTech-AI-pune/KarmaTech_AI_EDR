using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.TodoSchedules.Command
{
    public class CreateTodoScheduleCommand : IRequest<int>
    {
        public TodoScheduleDto TodoSchedule { get; set; }
    }
}
