using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.TodoSchedules.Query
{
    public class GetTodoScheduleQuery : IRequest<TodoScheduleDto?>
    {
        public int ProjectId { get; set; }
    }
}
