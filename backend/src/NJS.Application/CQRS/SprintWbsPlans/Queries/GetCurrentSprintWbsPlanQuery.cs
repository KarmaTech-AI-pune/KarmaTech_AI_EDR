using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintWbsPlans.Queries
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

