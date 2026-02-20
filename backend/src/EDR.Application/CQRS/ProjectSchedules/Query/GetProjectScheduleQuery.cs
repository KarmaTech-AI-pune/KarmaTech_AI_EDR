using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.ProjectSchedules.Query
{
    public class GetProjectScheduleQuery : IRequest<ProjectScheduleDto?>
    {
        public int ProjectId { get; set; }
    }
}

