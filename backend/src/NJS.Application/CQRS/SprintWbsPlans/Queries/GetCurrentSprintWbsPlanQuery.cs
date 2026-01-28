using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetCurrentSprintWbsPlanQuery : IRequest<CurrentSprintWbsPlanResponseDto>
    {
        public int ProjectId { get; set; }

        public GetCurrentSprintWbsPlanQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}
