using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.ProjectSchedules.Query
{
    public class GetProjectScheduleQuery : IRequest<ProjectTasksOnlyDto?>
    {
        public int ProjectId { get; set; }
    }
}
